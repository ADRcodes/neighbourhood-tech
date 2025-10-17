// ---------------- sRGB helpers ----------------
function srgbToLinear(c) {
  const cs = c / 255;
  return cs <= 0.04045 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
}
function linearToSrgb(c) {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}
function rgbToLuminance(r, g, b) {
  const R = srgbToLinear(r), G = srgbToLinear(g), B = srgbToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}
function contrastRatio(l1, l2) {
  const [L1, L2] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (L1 + 0.05) / (L2 + 0.05);
}
function rgbToCss([r, g, b]) {
  r = Math.max(0, Math.min(255, Math.round(r)));
  g = Math.max(0, Math.min(255, Math.round(g)));
  b = Math.max(0, Math.min(255, Math.round(b)));
  // space-separated works everywhere modern (and avoids commas in Tailwind arbitrary values)
  return `rgb(${r} ${g} ${b})`;
}
function mixRgbLinear(rgbA, rgbB, t) {
  const a = rgbA.map(srgbToLinear);
  const b = rgbB.map(srgbToLinear);
  const m = [0, 1, 2].map(i => a[i] * (1 - t) + b[i] * t).map(linearToSrgb);
  return m.map(v => Math.max(0, Math.min(255, Math.round(v * 255))));
}

// ---------------- Color string parsers (rgb/hsl/oklch/oklab/hex) ----------------
function rgbStringToRgb(str) {
  const m = str && str.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}
function hslStringToRgb(str) {
  const m = str && str.match(/hsla?\(\s*([\d.]+)[deg]*[,\s]+([\d.]+)%[,\s]+([\d.]+)%/i);
  if (!m) return null;
  let h = ((Number(m[1]) % 360) + 360) % 360;
  const s = Number(m[2]) / 100, l = Number(m[3]) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60, x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (0 <= hp && hp < 1) [r, g, b] = [c, x, 0];
  else if (1 <= hp && hp < 2) [r, g, b] = [x, c, 0];
  else if (2 <= hp && hp < 3) [r, g, b] = [0, c, x];
  else if (3 <= hp && hp < 4) [r, g, b] = [0, x, c];
  else if (4 <= hp && hp < 5) [r, g, b] = [x, 0, c];
  else if (5 <= hp && hp < 6) [r, g, b] = [c, 0, x];
  const m0 = l - c / 2;
  return [(r + m0) * 255, (g + m0) * 255, (b + m0) * 255];
}
function oklabToRgb(L, a, b) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  let r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  let bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
  r = Math.max(0, Math.min(1, r));
  g = Math.max(0, Math.min(1, g));
  bl = Math.max(0, Math.min(1, bl));
  const enc = (u) => (u <= 0.0031308 ? 12.92 * u : 1.055 * Math.pow(u, 1 / 2.4) - 0.055);
  return [enc(r) * 255, enc(g) * 255, enc(bl) * 255];
}
function oklchStringToRgb(str) {
  const m = str && str.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(deg)?/i);
  if (!m) return null;
  const L = Number(m[1]), C = Number(m[2]);
  const h = ((Number(m[3]) % 360) + 360) % 360 * Math.PI / 180;
  return oklabToRgb(L, Math.cos(h) * C, Math.sin(h) * C);
}
function oklabStringToRgb(str) {
  const m = str && str.match(/oklab\(\s*([\d.]+)\s+([-\d.]+)\s+([-\d.]+)/i);
  return m ? oklabToRgb(Number(m[1]), Number(m[2]), Number(m[3])) : null;
}
function hexStringToRgb(str) {
  if (!str || str[0] !== "#") return null;
  if (str.length === 4) return [...str.slice(1)].map(ch => parseInt(ch + ch, 16));
  if (str.length === 7) return [
    parseInt(str.slice(1, 3), 16),
    parseInt(str.slice(3, 5), 16),
    parseInt(str.slice(5, 7), 16),
  ];
  return null;
}
function anyCssColorToRgb(str) {
  if (!str) return null;
  const s = str.trim().toLowerCase();
  return hexStringToRgb(s)
    || (s.startsWith("rgb") && rgbStringToRgb(s))
    || (s.startsWith("hsl") && hslStringToRgb(s))
    || (s.startsWith("oklch") && oklchStringToRgb(s))
    || (s.startsWith("oklab") && oklabStringToRgb(s))
    || (() => {
      // canvas fallback: lets the browser normalize named/other formats to rgb()/hex
      try {
        const c = document.createElement("canvas").getContext("2d");
        c.fillStyle = s;
        const normalized = c.fillStyle; // usually rgb(...) or #hex
        return hexStringToRgb(normalized) || rgbStringToRgb(normalized);
      } catch {
        return null;
      }
    })();
}

// Resolve a CSS variable to *computed* RGB by letting the browser do the color math.
function resolveCSSVarToRGB(varName) {
  const el = document.createElement("div");
  Object.assign(el.style, {
    position: "fixed",
    left: "-9999px",
    top: "0",
    width: "1px",
    height: "1px",
    pointerEvents: "none",
    backgroundColor: `var(${varName})`,
  });
  document.body.appendChild(el);
  const css = getComputedStyle(el).backgroundColor; // can be oklch(...), rgb(...), etc.
  el.remove();
  return anyCssColorToRgb(css);
}

// ---------------- Contrast core ----------------
function pickOnColorRGB(bgRGB) {
  const Lbg = rgbToLuminance(bgRGB[0], bgRGB[1], bgRGB[2]);
  const Lw = rgbToLuminance(255, 255, 255);
  const Lk = rgbToLuminance(0, 0, 0);
  const cW = contrastRatio(Lw, Lbg);
  const cK = contrastRatio(Lk, Lbg);
  return cW >= cK ? { on: "white", contrast: cW } : { on: "black", contrast: cK };
}

function adjustBgForContrast(bgRGB, onColor, target = 4.5, step = 0.02, maxSteps = 80) {
  // move toward the *inverse* of the on-color to increase contrast
  const inverse = onColor === "white" ? [0, 0, 0] : [255, 255, 255];
  const L_on = onColor === "white" ? rgbToLuminance(255, 255, 255) : rgbToLuminance(0, 0, 0);
  let best = { rgb: bgRGB, ratio: contrastRatio(L_on, rgbToLuminance(...bgRGB)) };

  for (let i = 1; i <= maxSteps; i++) {
    const t = i * step; // up to ~1.6 in total distance; we clamp at end
    const mixed = mixRgbLinear(bgRGB, inverse, Math.min(t, 0.65)); // don't drift too far
    const Lbg = rgbToLuminance(mixed[0], mixed[1], mixed[2]);
    const r = contrastRatio(L_on, Lbg);
    if (r > best.ratio) best = { rgb: mixed, ratio: r };
    if (r >= target) return best;
  }
  return best;
}

function setCSSVar(name, value) {
  document.documentElement.style.setProperty(name, value);
}

// Compute + set on-text; optionally nudge the bg token to reach target contrast
function ensureReadable(varName, onVarName, { target = 4.5, mutateBg = true } = {}) {
  const bgRGB = resolveCSSVarToRGB(varName);
  if (!bgRGB) return;

  const pick = pickOnColorRGB(bgRGB);
  setCSSVar(onVarName, pick.on);

  if (!mutateBg) return;
  if (pick.contrast >= target) return;

  const adjusted = adjustBgForContrast(bgRGB, pick.on, target);
  setCSSVar(varName, rgbToCss(adjusted.rgb));
}

// ---------------- Public API ----------------
export function initOnColors(options) {
  // Ensure these exist in your CSS: --color-primary, --color-accent, and their --color-on* variables
  ensureReadable("--color-primary", "--color-onprimary", options);
  ensureReadable("--color-accent", "--color-onaccent", options);
  ensureReadable("--color-brand-complement", "--color-oncomplement", options);
}

export function watchThemeAttribute(attr = "data-theme", options) {
  const mo = new MutationObserver(() => initOnColors(options));
  mo.observe(document.documentElement, { attributes: true, attributeFilter: [attr] });
  return mo;
}

// OKLCH builder (for clock-based hues)
function oklchString(l, c, h) {
  return `oklch(${l} ${c} ${h}deg)`;
}

// ----- Main entry points you call from components -----
export function setBrandBase(color, { target = 4.5, mutateBg = true } = {}) {
  setCSSVar("--color-brand-base", color);
  // Wait two frames so all derived tokens (e.g., brand-600 -> primary) resolve before contrast pass
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      initOnColors({ target, mutateBg });
      window.dispatchEvent(new CustomEvent("theme:tokens-updated"));
    });
  });
}

export function setBrandByClockContinuous(opts = {}) {
  const {
    l = 0.62,
    c = 0.14,
    hueStart = 0,
    easing = null,
    target = 4.5,
    mutateBg = true,
  } = opts;

  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes(); // 0..1439
  let t = minutes / (24 * 60); // 0..1
  if (typeof easing === "function") t = Math.min(1, Math.max(0, easing(t)));

  const hue = (t * 360 + hueStart) % 360;
  const color = oklchString(l, c, hue);
  setBrandBase(color, { target, mutateBg });
}

export function startBrandClockContinuous(intervalMs = 60 * 60 * 1000, opts = {}) {
  setBrandByClockContinuous(opts);
  if (intervalMs > 0) {
    setInterval(() => setBrandByClockContinuous(opts), intervalMs);
  }
}
