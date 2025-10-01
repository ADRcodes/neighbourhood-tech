// Central place for runtime config
export const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/$/, "");
// Flip via env or hardcode per page if you like
export const DEFAULT_USE_API = true;
