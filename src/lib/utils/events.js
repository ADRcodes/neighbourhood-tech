import { getEventTagsLower, norm } from "./tags";

const extractLocationLabel = (ev) => {
  const city = String(ev?.city ?? "").trim();
  if (city) return city;

  const address = String(ev?.venue?.address ?? "").trim();
  if (address) {
    const parts = address.split(",");
    const candidate = String(parts[parts.length - 1] ?? "").trim();
    return candidate || address;
  }

  const venueName = String(ev?.venue?.name ?? "").trim();
  return venueName;
};

export function filterEvents(events, { tags = [], sources = [], locations = [], search = "" } = {}) {
  if (!tags.length && !sources.length && !locations.length && !search) return events;

  const tagSet = new Set(tags.map(norm).filter(Boolean));
  const sourceSet = new Set(sources.map(norm).filter(Boolean));
  const locationSet = new Set(locations.map(norm).filter(Boolean));
  const searchTerm = norm(search);

  return events.filter((ev) => {
    if (tagSet.size) {
      const eventTags = getEventTagsLower(ev);
      if (!eventTags.some((tag) => tagSet.has(tag))) {
        return false;
      }
    }

    if (sourceSet.size) {
      const sourceKey = norm(ev?.source);
      if (!sourceKey || !sourceSet.has(sourceKey)) {
        return false;
      }
    }

    if (locationSet.size) {
      const locationKey = norm(extractLocationLabel(ev));
      if (!locationKey || !locationSet.has(locationKey)) {
        return false;
      }
    }

    if (searchTerm) {
      const haystack = [
        ev?.title,
        ev?.company,
        ev?.venue?.name,
        ev?.venue?.address,
        ev?.city,
        extractLocationLabel(ev),
      ]
        .map(norm)
        .filter(Boolean)
        .join(" ");
      if (!haystack.includes(searchTerm)) {
        return false;
      }
    }

    return true;
  });
}

export const recommendedOf = (events, n = 4) =>
  events.length > 4 ? events.slice(2, 2 + n) : [];

export const recommendedOfSpecific = (events, ids) =>
  events.filter((ev) => ids.includes(ev.id));

const SOURCE_ALIASES = {
  majestic: "Majestic",
  stjohnsliving: "St. John's Living",
  destinationstjohns: "Destination St. John's",
};

const ZERO_PRICE_STRINGS = new Set(["0", "0.0", "0.00", "$0", "$0.00", "zero"]);

export function formatSourceName(value) {
  if (!value) return "";
  const normalizedKey = String(value).toLowerCase().replace(/[^a-z0-9]/g, "");
  if (SOURCE_ALIASES[normalizedKey]) {
    return SOURCE_ALIASES[normalizedKey];
  }

  const spaced = String(value)
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([a-zA-Z])(\d)/g, "$1 $2")
    .replace(/(\d)([a-zA-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();

  if (!spaced) return "";

  return spaced
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function isExplicitlyFreePrice(price) {
  if (price == null) return false;
  if (typeof price === "number") {
    return Number.isFinite(price) && price === 0;
  }

  const normalized = String(price).trim().toLowerCase();
  if (!normalized) return false;
  if (normalized.includes("free")) return true;
  return ZERO_PRICE_STRINGS.has(normalized);
}

const PRICE_FORMATTER =
  typeof Intl !== "undefined"
    ? new Intl.NumberFormat(undefined, { style: "currency", currency: "CAD", maximumFractionDigits: 2 })
    : null;

export function formatPriceDisplay(price) {
  if (price == null) return "";
  if (isExplicitlyFreePrice(price)) return "Free";
  if (typeof price === "number" && Number.isFinite(price)) {
    return PRICE_FORMATTER ? PRICE_FORMATTER.format(price) : `$${price}`;
  }
  const text = String(price).trim();
  return text;
}

export function buildTagOptions(events) {
  const map = new Map();
  events.forEach((ev) => {
    if (!Array.isArray(ev?.tags)) return;
    ev.tags.forEach((tag) => {
      const label = String(tag ?? "").trim();
      if (!label) return;
      const key = norm(label);
      if (!key) return;
      const entry = map.get(key) ?? { key, label, count: 0 };
      entry.count += 1;
      map.set(key, entry);
    });
  });

  return Array.from(map.values())
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.label.localeCompare(b.label, undefined, { sensitivity: "base" });
    })
    .slice(0, 20)
    .map(({ key, label }) => ({ key, label }));
}

export function buildSourceOptions(events) {
  const map = new Map();
  events.forEach((ev) => {
    const raw = ev?.source ?? "";
    const key = norm(raw);
    if (!key || map.has(key)) return;
    map.set(key, { key, label: formatSourceName(raw) || raw || "Unknown" });
  });

  return Array.from(map.values()).sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { sensitivity: "base" })
  );
}

export function buildLocationOptions(events) {
  const map = new Map();
  events.forEach((ev) => {
    const label = extractLocationLabel(ev);
    if (!label) return;
    const key = norm(label);
    if (!key) return;
    const entry = map.get(key) ?? { key, label, count: 0 };
    entry.count += 1;
    map.set(key, entry);
  });

  return Array.from(map.values())
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.label.localeCompare(b.label, undefined, { sensitivity: "base" });
    })
    .map(({ key, label }) => ({ key, label }));
}
