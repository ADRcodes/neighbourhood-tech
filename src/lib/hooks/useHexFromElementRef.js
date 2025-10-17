import { useEffect, useState } from "react";

/* -------------------- Parsers -------------------- */
function toHexByte(n) { return Math.round(n).toString(16).padStart(2, "0"); }

// rgb()/rgba()
function rgbStringToHex(str) {
  const m = str.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
  if (!m) return null;
  const [r, g, b] = [m[1], m[2], m[3]].map(Number);
  return `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`.toUpperCase();
}

// hsl()/hsla()
function hslStringToHex(str) {
  const m = str.match(/hsla?\(\s*([\d.]+)[deg]*[,\s]+([\d.]+)%[,\s]+([\d.]+)%/i);
  if (!m) return null;
  let h = ((Number(m[1]) % 360) + 360) % 360;
  const s = Number(m[2]) / 100, l = Number(m[3]) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60, x = c * (1 - Math.abs((hp % 2) - 1));
  let [r, g, b] = [0, 0, 0];
  if (0 <= hp && hp < 1) [r, g, b] = [c, x, 0];
  else if (1 <= hp && hp < 2) [r, g, b] = [x, c, 0];
  else if (2 <= hp && hp < 3) [r, g, b] = [0, c, x];
  else if (3 <= hp && hp < 4) [r, g, b] = [0, x, c];
  else if (4 <= hp && hp < 5) [r, g, b] = [x, 0, c];
  else if (5 <= hp && hp < 6) [r, g, b] = [c, 0, x];
  const m0 = l - c / 2;
  r = (r + m0) * 255; g = (g + m0) * 255; b = (b + m0) * 255;
  return `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`.toUpperCase();
}

// oklch() -> hex via oklab -> linear sRGB -> gamma sRGB
function oklchStringToHex(str) {
  const m = str.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(deg)?/i);
  if (!m) return null;
  const L = Number(m[1]); const C = Number(m[2]); let h = Number(m[3]);
  // normalize hue
  h = ((h % 360) + 360) % 360; const hr = h * Math.PI / 180;
  const a = Math.cos(hr) * C;
  const b = Math.sin(hr) * C;
  return oklabToHex(L, a, b);
}

// oklab() -> hex
function oklabStringToHex(str) {
  const m = str.match(/oklab\(\s*([\d.]+)\s+([-\d.]+)\s+([-\d.]+)/i);
  if (!m) return null;
  const L = Number(m[1]); const a = Number(m[2]); const b = Number(m[3]);
  return oklabToHex(L, a, b);
}

// Convert OKLab to Hex
function oklabToHex(L, a, b) {
  // OKLab -> LMS (nonlinear)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  // nonlinearity inverse (cube)
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  // LMS -> linear sRGB
  let r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  let bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
  // clamp linear
  r = Math.max(0, Math.min(1, r));
  g = Math.max(0, Math.min(1, g));
  bl = Math.max(0, Math.min(1, bl));
  // gamma encode
  const enc = (u) => u <= 0.0031308 ? 12.92 * u : 1.055 * Math.pow(u, 1 / 2.4) - 0.055;
  const R = enc(r) * 255, G = enc(g) * 255, B = enc(bl) * 255;
  return `#${toHexByte(R)}${toHexByte(G)}${toHexByte(B)}`.toUpperCase();
}

/* master resolver for any CSS color string */
function anyCssColorToHex(str) {
  if (!str) return null;
  const s = str.trim().toLowerCase();
  if (s.startsWith("#")) {
    // normalize short hex #abc -> #aabbcc
    if (s.length === 4) {
      return ("#" + [1, 2, 3].map(i => s[i] + s[i]).join("")).toUpperCase();
    }
    if (s.length === 7) return s.toUpperCase();
  }
  if (s.startsWith("rgb")) return rgbStringToHex(s);
  if (s.startsWith("hsl")) return hslStringToHex(s);
  if (s.startsWith("oklch")) return oklchStringToHex(s);
  if (s.startsWith("oklab")) return oklabStringToHex(s);
  // try rgb() fallback via assigning to a temp canvas context (browsers that serialize to something else)
  try {
    const c = document.createElement("canvas").getContext("2d");
    c.fillStyle = s;
    const computed = c.fillStyle; // tends to normalize to rgb(a) or hex
    const rgbHex = rgbStringToHex(computed);
    if (rgbHex) return rgbHex;
    if (computed.startsWith("#")) return computed.toUpperCase();
  } catch {
    // ignore
  }
  return null;
}

/* -------------------- Hook -------------------- */
export default function useHexFromElementRef(ref) {
  const [hex, setHex] = useState(null);

  useEffect(() => {
    if (!ref?.current) return;
    const el = ref.current;

    let raf;
    const read = () => {
      const css = getComputedStyle(el).backgroundColor; // could be oklch(...), rgb(...), etc.
      const h = anyCssColorToHex(css);
      if (h && h !== hex) setHex(h);
    };
    const kick = () => {
      let frames = 4;
      const tick = () => { read(); if (frames-- > 0) raf = requestAnimationFrame(tick); };
      tick();
    };

    // initial & a few frames to allow cascade
    kick();

    // react to theme/token changes
    const mo = new MutationObserver(kick);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["style", "data-theme"] });

    const onTheme = () => kick();
    window.addEventListener("theme:tokens-updated", onTheme);

    // also if the element resizes (rare but harmless)
    const ro = new ResizeObserver(kick);
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("theme:tokens-updated", onTheme);
      mo.disconnect();
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  return hex;
}
