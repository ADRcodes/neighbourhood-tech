import { setBrandBase } from "./contrast";

function oklchString(l, c, h) {
  return `oklch(${l} ${c} ${h}deg)`;
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
