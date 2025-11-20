// Central place for runtime config
export const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/$/, "");

const rawUseApi = import.meta.env.VITE_USE_API;
// Default to Supabase/API data unless explicitly disabled.
export const DEFAULT_USE_API =
  rawUseApi == null ? true : !["false", "0", "no"].includes(String(rawUseApi).toLowerCase());
