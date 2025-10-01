import { API_BASE } from "../config";
import { httpGetJson } from "./client";
import { coerceEvent } from "./normalize";

export async function fetchEvents({ signal } = {}) {
  const data = await httpGetJson(`${API_BASE}/api/events`, { signal });
  const rows = Array.isArray(data) ? data : data?.content ?? [];
  return rows.map(coerceEvent);
}
