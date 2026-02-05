import React, { useCallback, useState } from "react";
import { setBrandBase } from "../theme/contrast";
import { setBrandByClockContinuous } from "../theme/brand-clock";

const palettes = [
  {
    name: "Sunrise Pulse",
    story: "Warm coral energy that lifts the morning feed and sets a welcoming tone.",
    color: "oklch(0.72 0.15 25)",
  },
  {
    name: "Citrus Spotlight",
    story: "Vibrant citrus that makes call-to-action moments impossible to miss.",
    color: "oklch(0.78 0.18 95)",
  },
  {
    name: "Midnight Neon",
    story: "After-dark electric hue ideal for late sessions and DJ takeovers.",
    color: "oklch(0.63 0.16 290)",
  },
];

const colorStories = [
  {
    title: "Hero & Key Art",
    copy: "Primary drives immersive gradients and hero typography. It anchors the brand halo across mobile and desktop.",
    themeClass: "bg-primary text-onprimary",
  },
  {
    title: "Interactive Beats",
    copy: "Accent injects spark into chips, toggles, and micro-interactions—micro hover states stay consistent and accessible.",
    themeClass: "bg-accent text-onaccent",
  },
  {
    title: "Rhythm & Balance",
    copy: "Complement cools things down for supporting rails and informational callouts. It balances primary intensity in the 3-rail layout.",
    themeClass: "bg-brand-complement text-oncomplement",
  },
];

function TokenCard({ title, copy, themeClass }) {
  return (
    <article className={`rounded-3xl p-6 lg:p-8 shadow-sm shadow-black/5 ${themeClass}`}>
      <h3 className="text-xl font-semibold tracking-tight mb-2">{title}</h3>
      <p className="text-sm leading-relaxed opacity-90">{copy}</p>
    </article>
  );
}

function PaletteButton({ palette, isActive, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(palette)}
      className={`relative flex flex-col gap-1 rounded-2xl border border-brand-200 px-5 py-4 text-left transition-all ${isActive ? "bg-primary text-onprimary shadow-lg shadow-primary/40" : "bg-surface text-text hover:-translate-y-1 hover:shadow-md hover:shadow-brand-200/40"
        }`}
      style={isActive ? { background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-brand-complement) 88%)" } : {}}
    >
      <span className="text-sm font-medium uppercase tracking-wider">{palette.name}</span>
      <span className={`text-xs ${isActive ? "opacity-90" : "opacity-70"}`}>{palette.story}</span>
      <span className="mt-3 flex items-center gap-2 text-xs font-mono uppercase">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-onprimary">P</span>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent text-onaccent">A</span>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-complement text-oncomplement">C</span>
      </span>
    </button>
  );
}

export default function ColorAbout() {
  const [active, setActive] = useState(null);

  const applyPalette = useCallback((palette) => {
    setActive(palette.name);
    setBrandBase(palette.color);
  }, []);

  const syncToClock = useCallback(() => {
    setActive("Live Clock");
    setBrandByClockContinuous({ target: 5, mutateBg: true, c: 0.16 });
  }, []);

  return (
    <div className="min-h-screen bg-surface text-text">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16 lg:gap-16">
        <section
          className="relative overflow-hidden rounded-3xl bg-primary text-onprimary"
          style={{
            background: "linear-gradient(140deg, var(--color-primary) 0%, var(--color-brand-complement) 55%, var(--color-accent) 100%)",
          }}
        >
          <div className="relative z-10 flex flex-col gap-6 px-6 py-12 sm:px-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.25em] text-onprimary/70">Out &amp; About Events Festival</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Colour is our headliner.</h1>
              <p className="mt-4 text-base sm:text-lg text-onprimary/85">
                The About experience is a live stage for the brand system. Primary sets the mood, accent keeps the rhythm, and complement brings balance across rails.
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-3xl bg-onprimary/10 p-6 backdrop-blur">
              <span className="text-xs uppercase tracking-wide text-onprimary/80">Live Palette</span>
              <div className="flex items-center gap-3">
                <span className="h-12 w-12 rounded-full bg-primary" />
                <span className="h-12 w-12 rounded-full bg-accent" />
                <span className="h-12 w-12 rounded-full bg-brand-complement" />
              </div>
              <button
                type="button"
                onClick={syncToClock}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-onprimary/15 px-4 py-2 text-sm font-semibold text-onprimary transition hover:bg-onprimary/25"
              >
                Sync to golden hour
              </button>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface/70" />
        </section>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-start">
          <div className="rounded-3xl border border-brand-200/60 bg-surface p-8 shadow-sm shadow-brand-200/20">
            <header className="flex flex-col gap-2">
              <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Palette studio</p>
              <h2 className="text-2xl font-semibold tracking-tight text-text">Pick a vibe, watch the system respond.</h2>
              <p className="text-sm text-text-muted">
                Each preset remixes <code className="font-mono">--color-brand-base</code>; tokens cascade into primary, accent, and complement automatically.
              </p>
            </header>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {palettes.map((palette) => (
                <PaletteButton key={palette.name} palette={palette} isActive={active === palette.name} onSelect={applyPalette} />
              ))}
              <button
                type="button"
                onClick={syncToClock}
                className={`rounded-2xl border border-dashed border-brand-200 px-5 py-4 text-left text-sm font-medium transition ${active === "Live Clock" ? "bg-brand-complement text-oncomplement shadow-md shadow-brand-complement/40" : "bg-surface text-text hover:-translate-y-1 hover:shadow-md hover:shadow-brand-200/30"
                  }`}
              >
                <span className="block text-xs uppercase tracking-widest text-text-muted">Auto</span>
                <span className="mt-1 block text-base">Go hands-free with the time-of-day hue shift.</span>
                <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs text-onaccent">
                  <span className="font-semibold">Continuous</span>
                  <span className="opacity-80">24h sweep</span>
                </span>
              </button>
            </div>
          </div>

          <aside className="flex flex-col gap-4 rounded-3xl bg-brand-complement text-oncomplement p-8 shadow-inner shadow-brand-complement/30">
            <p className="text-xs uppercase tracking-[0.3em] text-oncomplement/70">Creative direction</p>
            <h3 className="text-2xl font-semibold">Designing with motion, music, and light.</h3>
            <p className="text-sm leading-relaxed text-oncomplement/85">
              We treat colour like a stage wash—dynamic, adaptive, and responsive to the moment. Tokens keep comps consistent: UI, posters, wristbands, even backstage signage echo the same palette.
            </p>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-2 w-2 rounded-full bg-oncomplement/70" />
                <span>Primary = hero gradients, nav rails, and marquee typography.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-2 w-2 rounded-full bg-oncomplement/70" />
                <span>Accent = micro interactions, chips, ticket CTAs, and sponsor pills.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-2 w-2 rounded-full bg-oncomplement/70" />
                <span>Complement = schedule widgets, contextual rails, multi-day badges.</span>
              </li>
            </ul>
          </aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {colorStories.map((story) => (
            <TokenCard key={story.title} {...story} />
          ))}
        </section>

        <section className="grid gap-6 rounded-3xl border border-brand-200/80 bg-surface p-8 shadow-lg shadow-brand-200/15 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
          <div className="flex flex-col gap-4">
            <span className="text-xs uppercase tracking-[0.3em] text-text-muted">Experience DNA</span>
            <h2 className="text-3xl font-semibold leading-tight text-text">Why colour matters for event discovery.</h2>
            <p className="text-sm text-text-muted">
              The platform juxtaposes live energy with calm organization. Semantic tokens let us orchestrate that tension responsively without hard-coded hex values.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold text-primary">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-onprimary text-[0.65rem]">UX</span>
              High contrast and rhythm for always-on accessibility.
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-primary/10 p-5">
              <h4 className="text-sm font-semibold text-primary">01 · Responsive gradients</h4>
              <p className="mt-2 text-xs text-text-muted">
                Hero gradients blend <code>var(--color-primary)</code> → <code>var(--color-brand-complement)</code> to keep posters and hero cards expressive without sacrificing readability.
              </p>
            </div>

            <div className="rounded-3xl bg-accent/10 p-5">
              <h4 className="text-sm font-semibold text-accent">02 · Action moments</h4>
              <p className="mt-2 text-xs text-text-muted">
                Tickets, RSVP states, and sticky controls lean on accent with <code>var(--color-onaccent)</code> for clarity at every breakpoint.
              </p>
            </div>

            <div className="rounded-3xl bg-brand-complement/10 p-5 md:col-span-2">
              <h4 className="text-sm font-semibold text-brand-complement">03 · Support rails</h4>
              <p className="mt-2 text-xs text-text-muted">
                Calendars, chip bars, and the desktop third rail rest on complement to keep focus on the main stage while staying visually tied together.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
