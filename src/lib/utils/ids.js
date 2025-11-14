const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DEFAULT_PAD = "00000000000000000000000000000000";

export function normalizeEventId(value) {
  if (value == null) return null;
  const str = String(value);
  if (UUID_REGEX.test(str)) {
    return str;
  }

  const hex = stringToHex(str);
  if (!hex) return null;
  const padded = (hex + DEFAULT_PAD).slice(0, 32);
  return `${padded.slice(0, 8)}-${padded.slice(8, 12)}-${padded.slice(12, 16)}-${padded.slice(16, 20)}-${padded.slice(20, 32)}`;
}

function stringToHex(str) {
  return Array.from(str)
    .map((ch) => ch.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("");
}

export function isUuid(value) {
  return typeof value === "string" && UUID_REGEX.test(value);
}
