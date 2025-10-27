import { anyCssColorToRgb, rgbToCss } from "./color-utils";

// ---------------- sRGB helpers ----------------
function srgbToLinear(c) {
  const cs = c / 255;
  return cs <= 0.04045 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c) {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

function rgbToLuminance(r, g, b) {
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(l1, l2) {
  const [L1, L2] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (L1 + 0.05) / (L2 + 0.05);
}

function mixRgbLinear(rgbA, rgbB, t) {
  const a = rgbA.map(srgbToLinear);
  const b = rgbB.map(srgbToLinear);
  const mixedLinear = [0, 1, 2].map((i) => a[i] * (1 - t) + b[i] * t).map(linearToSrgb);
  return mixedLinear.map((v) => Math.max(0, Math.min(255, Math.round(v * 255))));
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
    const ratio = contrastRatio(L_on, Lbg);
    if (ratio > best.ratio) best = { rgb: mixed, ratio };
    if (ratio >= target) return best;
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

export { setBrandByClockContinuous, startBrandClockContinuous } from "./brand-clock";
