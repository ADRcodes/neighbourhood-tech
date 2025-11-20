import { API_BASE } from "../config";
import { httpGetJson } from "./client";
import { coerceEvent } from "./normalize";
import { listEvents as listSupabaseEvents } from "./supabase";
import { supabase } from "../supabase/client";

const LOCAL_EVENTS_URL = "/data/events.json";

export async function fetchEvents({ signal } = {}) {
  if (supabase) {
    console.info("[Events] Fetching via Supabase client");
    const rows = await listSupabaseEvents({ signal });
    console.info("[Events] Supabase returned", rows.length, "rows");
    return rows.map(mapSupabaseEvent).map(coerceEvent);
  }

  console.info("[Events] Fetching via API_BASE", API_BASE);
  const data = await httpGetJson(`${API_BASE}/api/events`, { signal });
  const rows = Array.isArray(data) ? data : data?.content ?? [];
  return rows.map(coerceEvent);
}

export async function fetchLocalEvents({ signal } = {}) {
  const data = await httpGetJson(LOCAL_EVENTS_URL, { signal, timeoutMs: 6000 });
  const rows = Array.isArray(data?.rows) ? data.rows : [];
  return rows
    .map((row, index) => transformLocalRow(row, index))
    .filter(Boolean)
    .sort((a, b) => {
      const aTime = a.date ? new Date(a.date).getTime() : Number.POSITIVE_INFINITY;
      const bTime = b.date ? new Date(b.date).getTime() : Number.POSITIVE_INFINITY;
      return aTime - bTime;
    });
}

function transformLocalRow(row, index) {
  if (!row || typeof row !== "object") return null;

  const id =
    row.content_hash ||
    row.source_id ||
    (row.title ? `${row.title}-${index}` : `local-event-${index}`);

  const date = deriveDateFromRow(row);
  if (!date) return null;

  const tags = normalizeTags(row.tags);
  // derive an organizer name from common fields if provided; keep blank otherwise
  const organizerName = row.organizer || row.organizer_name || row.author || "";
  const venueName = row.venue || row.city || "Venue TBA";
  const description = sanitizeDescription(row.description);
  const imageUrl = row.image_url
    ? row.image_url
    : row.source_id
      ? `https://api.dicebear.com/8.x/shapes/svg?seed=${encodeURIComponent(row.source_id)}`
      : null;

  const event = coerceEvent({
    id,
    title: row.title ?? "Untitled event",
    company: "",
    date,
    description,
    price: derivePrice(row.price),
    capacity: Number.parseInt(row.capacity ?? row.capacity_total ?? 0, 10) || 0,
    tags,
    image: imageUrl,
    venue: {
      name: venueName,
      address: row.city ?? "",
      id: venueName ? `${row.source ?? "local"}-${venueName}` : null,
    },
    organizer: {
      id: row.organizer_id ?? null,
      name: organizerName,
    },
    url: row.url ?? row.source_id ?? null,
    registered: [],
  });

  if (!event?.date) return null;

  return {
    ...event,
    source: row.source ?? null,
    url: row.url ?? row.source_id ?? null,
    city: row.city ?? "",
  };
}

function derivePrice(raw) {
  if (raw == null) return null;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw;
  }
  const text = String(raw).trim();
  return text || null;
}

function normalizeTags(value) {
  if (!value) return [];
  const list = Array.isArray(value)
    ? value
    : String(value)
      .split(/[,|]/);

  const seen = new Set();
  return list
    .map((tag) => String(tag).trim())
    .filter((tag) => tag.length > 0 && !seen.has(tag.toLowerCase()))
    .map((tag) => {
      seen.add(tag.toLowerCase());
      return tag;
    });
}

function sanitizeDescription(value) {
  if (!value) return "";
  const text = String(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
  return text || "";
}

function deriveDateFromRow(row) {
  if (row.starts_at) return row.starts_at;
  if (row.ends_at) return row.ends_at;
  const fromSlug = inferDateFromSlug(row.source_id || row.url || row.title || "");
  return fromSlug;
}

function inferDateFromSlug(value) {
  if (!value) return null;
  const match = String(value).match(/(\d{4})-(\d{2})-(\d{2})(?:[-_T]?(\d{3,4}))?(?:[-_]?([ap]m))?/i);
  if (!match) return null;

  const [, year, month, day, timeDigits = "", meridiemRaw = ""] = match;
  let hours = 0;
  let minutes = 0;

  if (timeDigits) {
    const padded = timeDigits.padStart(4, "0").slice(-4);
    hours = Number.parseInt(padded.slice(0, 2), 10) || 0;
    minutes = Number.parseInt(padded.slice(2), 10) || 0;
  }

  const meridiem = meridiemRaw.toLowerCase();
  if (meridiem === "pm" && hours < 12) {
    hours += 12;
  } else if (meridiem === "am" && hours === 12) {
    hours = 0;
  }

  const hourStr = String(hours).padStart(2, "0");
  const minuteStr = String(minutes).padStart(2, "0");
  return `${year}-${month}-${day}T${hourStr}:${minuteStr}:00`;
}

export function mapSupabaseEvent(row) {
  const tags =
    Array.isArray(row?.event_tags) && row.event_tags.length
      ? row.event_tags
          .map((et) => et?.tag?.name || et?.tag?.label || et?.tag?.tag || "")
          .filter(Boolean)
      : [];

  return {
    ...row,
    image: row.image_url ?? row.image ?? null,
    venue: row.venue ?? null,
    organizer: row.organizer ?? null,
    tags,
  };
}
