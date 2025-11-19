const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function normalizeEventId(value) {
  if (value == null) return null;
  const str = String(value).trim();
  return UUID_REGEX.test(str) ? str : null;
}

export function isUuid(value) {
  return typeof value === "string" && UUID_REGEX.test(value.trim());
}
