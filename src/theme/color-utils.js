// Shared color parsing and formatting helpers used across theme utilities.

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function toHexByte(n) {
  return clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0").toUpperCase();
}

// ---------------- sRGB / OKLab conversions ----------------
export function oklabToRgb(L, a, b) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  let r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  let bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  r = clamp(r, 0, 1);
  g = clamp(g, 0, 1);
  bl = clamp(bl, 0, 1);

  const encode = (u) => (u <= 0.0031308 ? 12.92 * u : 1.055 * Math.pow(u, 1 / 2.4) - 0.055);

  return [encode(r) * 255, encode(g) * 255, encode(bl) * 255];
}

// ---------------- CSS color string parsers ----------------
export function rgbStringToRgb(str) {
  const m = str && str.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

export function hslStringToRgb(str) {
  const m = str && str.match(/hsla?\(\s*([\d.]+)[deg]*[,\s]+([\d.]+)%[,\s]+([\d.]+)%/i);
  if (!m) return null;

  let h = ((Number(m[1]) % 360) + 360) % 360;
  const s = Number(m[2]) / 100;
  const l = Number(m[3]) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));

  let r = 0;
  let g = 0;
  let b = 0;

  if (0 <= hp && hp < 1) [r, g, b] = [c, x, 0];
  else if (1 <= hp && hp < 2) [r, g, b] = [x, c, 0];
  else if (2 <= hp && hp < 3) [r, g, b] = [0, c, x];
  else if (3 <= hp && hp < 4) [r, g, b] = [0, x, c];
  else if (4 <= hp && hp < 5) [r, g, b] = [x, 0, c];
  else if (5 <= hp && hp < 6) [r, g, b] = [c, 0, x];

  const m0 = l - c / 2;

  return [(r + m0) * 255, (g + m0) * 255, (b + m0) * 255];
}

export function oklchStringToRgb(str) {
  const m = str && str.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(deg)?/i);
  if (!m) return null;

  const L = Number(m[1]);
  const C = Number(m[2]);
  const hDeg = ((Number(m[3]) % 360) + 360) % 360;
  const hr = (hDeg * Math.PI) / 180;

  return oklabToRgb(L, Math.cos(hr) * C, Math.sin(hr) * C);
}

export function oklabStringToRgb(str) {
  const m = str && str.match(/oklab\(\s*([\d.]+)\s+([-?\d.]+)\s+([-?\d.]+)/i);
  return m ? oklabToRgb(Number(m[1]), Number(m[2]), Number(m[3])) : null;
}

export function hexStringToRgb(str) {
  if (!str || str[0] !== "#") return null;
  if (str.length === 4) {
    return [...str.slice(1)].map((ch) => parseInt(ch + ch, 16));
  }
  if (str.length === 7) {
    return [
      parseInt(str.slice(1, 3), 16),
      parseInt(str.slice(3, 5), 16),
      parseInt(str.slice(5, 7), 16),
    ];
  }
  return null;
}

// Resolve any CSS color string to an RGB triplet (0-255) if possible.
export function anyCssColorToRgb(str) {
  if (!str) return null;

  const s = str.trim().toLowerCase();

  return (
    hexStringToRgb(s) ||
    (s.startsWith("rgb") && rgbStringToRgb(s)) ||
    (s.startsWith("hsl") && hslStringToRgb(s)) ||
    (s.startsWith("oklch") && oklchStringToRgb(s)) ||
    (s.startsWith("oklab") && oklabStringToRgb(s)) ||
    (() => {
      try {
        const canvas = document.createElement("canvas").getContext("2d");
        canvas.fillStyle = s;
        const normalized = canvas.fillStyle;
        return hexStringToRgb(normalized) || rgbStringToRgb(normalized);
      } catch {
        return null;
      }
    })()
  );
}

// ---------------- Formatting helpers ----------------
export function rgbToCss([r, g, b]) {
  const clampByte = (value) => clamp(Math.round(value), 0, 255);
  return `rgb(${clampByte(r)} ${clampByte(g)} ${clampByte(b)})`;
}

export function rgbToHex([r, g, b]) {
  return `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`;
}

export function anyCssColorToHex(str) {
  const rgb = anyCssColorToRgb(str);
  return rgb ? rgbToHex(rgb) : null;
}
