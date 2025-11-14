// Shared normalization used by API + mocks to keep shape consistent

export const normalizeDate = (d) => {
  if (!d) return null;
  if (d instanceof Date) return d.toISOString();
  const s = String(d).trim();
  return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(s) ? s.replace(" ", "T") : s;
};

function normalizePriceValue(value) {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  const text = String(value).trim();
  return text || null;
}

export function coerceEvent(e) {
  const rawDate = e.date ?? e.startDate ?? e.start_time ?? null;

  const tags = Array.isArray(e.tags)
    ? e.tags
    : Array.isArray(e.event_tags)
      ? e.event_tags.map((t) => (typeof t === "string" ? t : (t.tag ?? t.name ?? "")))
      : Array.isArray(e.tagsList)
        ? e.tagsList
        : [];

  const venue = e.venue
    ? {
      id: e.venue.id ?? null,
      name: e.venue.name ?? e.venueName ?? "",
      address: e.venue.address ?? e.venueAddress ?? "",
      capacity: e.venue.capacity ?? null,
    }
    : {
      id: null,
      name: e.venueName ?? "",
      address: e.venueAddress ?? "",
      capacity: null,
    };

  const organizer = e.organizer
    ? { id: e.organizer.id ?? e.organizerId ?? null, name: e.organizer.name ?? e.organizerName ?? "" }
    : { id: e.organizerId ?? null, name: e.organizerName ?? "" };

  const regs = Array.isArray(e.registered)
    ? e.registered
    : Array.isArray(e.registrations)
      ? e.registrations.map((r) => {
        const u = r.user || r.attendee || {};
        const name = u.name ?? "Guest";
        const id = u.id ?? r.userId ?? null;
        const avatar =
          u.avatar ?? `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}`;
        return { id, name, avatar };
      })
      : [];

  const capacityRaw =
    typeof e.capacity === "number" ? e.capacity : Number(e.capacity ?? 0) || 0;
  const capacity = Number.isFinite(capacityRaw) && capacityRaw > 0 ? capacityRaw : null;

  return {
    id: e.id,
    company: e.company ?? "",
    title: e.title ?? e.name ?? "",
    date: normalizeDate(rawDate),
    description: e.description ?? "",
    price: normalizePriceValue(e.price ?? e.cost ?? e.ticket_price),
    capacity,
    image:
      e.image ??
      e.coverImageUrl ??
      `https://picsum.photos/seed/${e.id || Math.random()}/600/400`,
    venue,
    organizer,
    tags,
    url: e.url ?? e.link ?? null,
    registered: regs,
  };
}
