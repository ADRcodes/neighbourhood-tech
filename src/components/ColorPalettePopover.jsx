import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { setBrandBase, setBrandByClockContinuous } from "../theme/Contrast.js";
import useHexFromElementRef from "../lib/hooks/useHexFromElementRef.js";


/* ---------- atoms ---------- */
const cap = "text-[11px] md:text-xs leading-4 text-text-muted text-center truncate w-full";
function RampRow({ label, className, textClass = "" }) {
  return (
    <div className="grid grid-cols-[52px_1fr] items-center gap-3">
      <div className={`h-12 w-12 rounded-md border border-black/10 ${className} ${textClass}`} />
      <span className="text-sm text-text tabular-nums">{label}</span>
    </div>
  );
}
function Swatch({ label, className, textClass = "" }) {
  return (
    <div className="w-[76px]">
      <div className={`h-14 w-[72px] mx-auto rounded-md border border-black/10 ${className} ${textClass}`} />
      <div className={`mt-1 ${cap}`}>{label}</div>
    </div>
  );
}

/* ---------- main modal ---------- */
export default function ColorPaletteModalPro() {
  const [open, setOpen] = useState(false);
  const primaryProbeRef = useRef(null);
  const hexPrimary = useHexFromElementRef(primaryProbeRef);

  useEffect(() => {
    setBrandByClockContinuous({ l: 0.62, c: 0.14, hueStart: 0 });
  }, []);

  return (
    <div className="text-text">
      {/* trigger lives in the nav */}
      <div
        ref={primaryProbeRef}
        className="fixed -left-[9999px] -top-[9999px] w-px h-px bg-primary pointer-events-none"
        aria-hidden
      />
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-2 py-1 cursor-pointer text-[var(--color-onprimary)] rounded-full box-border border-2 border-transparent hover:border-accent active:bg-primary-pressed text-2xl"
        aria-label="Open color palette"
        title="Open color palette"
      >
        🎨
      </button>
      <input
        type="color"
        className="w-8 h-8 p-0 rounded border border-black/10 cursor-pointer"
        onChange={(e) => setBrandBase(e.target.value)}
        aria-label="Pick brand color"
      />

      {/* PORTAL so overlay covers the entire app (not just the nav) */}
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50"
            role="dialog"
            aria-modal="true"
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            {/* Backdrop: blur + dim across WHOLE viewport */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur" />

            {/* Modal panel (flex column) */}
            <div className="relative h-dvh w-dvw grid place-items-center p-4 sm:p-6">
              <div className="w-full max-w-[900px] rounded-2xl border border-black/10 bg-bg shadow-xl flex flex-col max-h-[90dvh]">
                {/* Sticky header */}
                <div className="sticky top-0 z-10 px-4 sm:px-6 pt-4 pb-3 bg-bg/95 backdrop-blur supports-[backdrop-filter]:bg-bg/80 border-b border-black/5 rounded-t-2xl">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 md:h-14 md:w-14 rounded-lg border border-black/10 bg-primary" />
                      <div className="leading-tight">
                        <div className="text-base md:text-lg font-semibold tracking-tight">Primary</div>
                        <div className="text-[12px] md:text-sm text-text-muted">
                          brand-600 • {hexPrimary || "—"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="hidden sm:inline text-sm text-text-muted">Pick brand base</span>
                      <input
                        type="color"
                        className="w-8 h-8 p-0 rounded border border-black/10 cursor-pointer"
                        onChange={(e) => setBrandBase(e.target.value)}
                        aria-label="Pick brand color"
                      />
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="text-xs md:text-sm px-2 py-1.5 rounded border border-black/10 hover:bg-surface"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>

                {/* Scrollable body */}
                <div className="px-4 sm:px-6 pb-5 overflow-y-auto">
                  {/* Mobile ramp strip; sm+ left column */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-[260px_1fr] gap-6">
                    <section className="sm:hidden">
                      <div className="text-xs md:text-sm font-semibold text-text mb-2">Ramp</div>
                      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
                        {[
                          ["100", "bg-brand-100"],
                          ["200", "bg-brand-200"],
                          ["300", "bg-brand-300"],
                          ["400", "bg-brand-400"],
                          ["500 • base", "bg-brand-500 text-[var(--color-onprimary)]"],
                          ["600 • primary", "bg-primary text-[var(--color-onprimary)]"],
                          ["700", "bg-brand-700 text-white/90"],
                          ["800", "bg-brand-800 text-white/90"],
                          ["900", "bg-brand-900 text-white/90"],
                        ].map(([label, cls]) => (
                          <Swatch key={label} label={label} className={cls} />
                        ))}
                      </div>
                    </section>

                    <section className="hidden sm:block">
                      <div className="text-xs md:text-sm font-semibold text-text mb-2">Ramp</div>
                      <div className="space-y-3">
                        <RampRow label="100" className="bg-brand-100" />
                        <RampRow label="200" className="bg-brand-200" />
                        <RampRow label="300" className="bg-brand-300" />
                        <RampRow label="400" className="bg-brand-400" />
                        <RampRow label="500 • base" className="bg-brand-500 text-[var(--color-onprimary)]" />
                        <RampRow label="600 • primary" className="bg-primary text-[var(--color-onprimary)]" />
                        <RampRow label="700" className="bg-brand-700 text-white/90" />
                        <RampRow label="800" className="bg-brand-800 text-white/90" />
                        <RampRow label="900" className="bg-brand-900 text-white/90" />
                      </div>
                    </section>

                    <section className="space-y-6">
                      <div>
                        <div className="text-xs md:text-sm font-semibold text-text mb-2">Harmonies</div>
                        <div className="flex flex-wrap gap-3">
                          <Swatch label="complement" className="bg-brand-complement text-white/90" />
                          <Swatch label="analog-a" className="bg-brand-analog-a" />
                          <Swatch label="accent" className="bg-accent text-[var(--color-onaccent)]" />
                        </div>
                      </div>

                      <div>
                        <div className="text-xs md:text-sm font-semibold text-text mb-2">Primary states</div>
                        <div className="flex flex-wrap gap-3">
                          <Swatch label="primary" className="bg-primary text-[var(--color-onprimary)]" />
                          <Swatch label="hover" className="bg-primary-hover text-[var(--color-onprimary)]" />
                          <Swatch label="pressed" className="bg-primary-pressed text-[var(--color-onprimary)]" />
                        </div>
                      </div>

                      <div>
                        <div className="text-xs md:text-sm font-semibold text-text mb-2">Status colors</div>
                        <div className="flex flex-wrap gap-3">
                          <Swatch label="success" className="bg-success" />
                          <Swatch label="warning" className="bg-warning" />
                          <Swatch label="danger" className="bg-danger text-white/90" />
                        </div>
                      </div>

                      <div>
                        <div className="text-xs md:text-sm font-semibold text-text mb-2">Surfaces & text</div>
                        <div className="flex items-center gap-4">
                          <Swatch label="bg" className="bg-bg" />
                          <Swatch label="surface" className="bg-surface" />
                          <div className="flex items-center gap-3">
                            <span className="text-text text-base md:text-lg">Aa</span>
                            <span className="text-text-muted text-base md:text-lg">Aa</span>
                          </div>
                        </div>
                      </div>

                      {/* Example */}
                      <div className="rounded-xl border border-black/10 overflow-hidden">
                        <div className="bg-primary text-[var(--color-onprimary)] px-4 py-2 flex items-center justify-between">
                          <span className="font-medium">Example card</span>
                          <span className="px-2 py-0.5 rounded-md bg-brand-complement text-[var(--color-oncomplement)] text-[12px]">
                            Complement
                          </span>
                        </div>
                        <div className="bg-surface p-4">
                          <p className="text-sm md:text-base text-text">
                            Primary for CTAs, complement for emphasis, accent for links.
                          </p>
                          <p className="text-xs md:text-sm text-text-muted mt-1">
                            On-colors are computed for contrast; backgrounds gently nudge if needed.
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <button className="rounded bg-primary px-3 py-2 text-[var(--color-onprimary)] hover:bg-primary-hover active:bg-primary-pressed text-sm md:text-base">
                              Primary action
                            </button>
                            <a className="text-sm md:text-base underline decoration-2 underline-offset-2 text-accent" href="#">
                              Accent link
                            </a>
                            <span className="rounded-full border border-brand-complement text-brand-complement px-2 py-1 text-xs md:text-sm">
                              Complement outline
                            </span>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
                {/* /body */}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
