import { Link } from "react-router-dom";

const STATS = [
  { label: "Sources tracked", value: "10+" },
  { label: "Events listed", value: "400+" },
  { label: "Updated weekly", value: "Yes" },
];

export default function About() {
  return (
    <main className="bg-bg text-text">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-4 pt-4 pb-16 sm:gap-12 sm:px-6 sm:pt-6 md:-mt-[72px] md:pt-24 lg:px-8 lg:pt-24">
        <section className="about-aurora px-4 py-10 sm:px-10 lg:px-14 text-onprimary">
          <span className="aurora-orb" aria-hidden />
          <span className="aurora-orb" aria-hidden />
          <span className="aurora-orb" aria-hidden />
          <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-5">
              <p className="text-xs uppercase tracking-[0.4em] text-onprimary/70">Out &amp; About Events</p>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                One place to see what&apos;s happening around the city.
              </h1>
              <p className="text-base sm:text-lg text-onprimary/85">
                Out &amp; About Events brings together local events from across city websites into one cleaner calendar and feed. Instead of checking multiple pages, you can browse what&apos;s on in one place and decide what to do next.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/calendar"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-onprimary shadow-[0_20px_40px_-28px_rgba(220,73,102,1)] hover:opacity-95"
                >
                  View calendar
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-full border border-onprimary/40 px-5 py-2.5 text-sm font-semibold text-onprimary/90 hover:bg-onprimary/10"
                >
                  Browse events
                </Link>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 rounded-3xl bg-onprimary/10 p-6 text-center backdrop-blur">
              {STATS.map((stat) => (
                <div key={stat.label} className="flex flex-col gap-1 items-center flex-1 min-w-[120px]">
                  <span className="text-2xl font-semibold leading-tight">{stat.value}</span>
                  <span className="text-[10px] uppercase tracking-[0.12em] text-onprimary/80 text-center leading-snug max-w-[7rem]">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
          <article className="rounded-3xl border border-brand-200/60 bg-surface/90 p-6 shadow-[0_18px_34px_-28px_rgba(16,24,40,0.5)]">
            <p className="text-xs uppercase tracking-[0.3em] text-text-muted">What this app does</p>
            <h2 className="mt-3 text-2xl font-semibold">City events, collected into one stream.</h2>
            <p className="mt-3 text-sm text-text-muted leading-relaxed">
              The goal is simple: make local discovery easier. This app tracks public event pages and gathers what&apos;s happening into one place so people can find workshops, markets, community meetups, shows, and other local happenings without bouncing between tabs.
            </p>
            <div className="mt-4 text-sm text-text">
              <span className="font-semibold text-primary">Current sources include:</span>{" "}
              <a
                href="https://destinationstjohns.com"
                target="_blank"
                rel="noreferrer noopener"
                className="underline decoration-2 underline-offset-2 text-primary hover:text-primary/80"
              >
                Destination St. John&apos;s
              </a>
              ,{" "}
              <a
                href="https://stjohnsliving.ca"
                target="_blank"
                rel="noreferrer noopener"
                className="underline decoration-2 underline-offset-2 text-primary hover:text-primary/80"
              >
                St. John&apos;s Living
              </a>
              , and{" "}
              <a
                href="https://majestictheatrehill.com"
                target="_blank"
                rel="noreferrer noopener"
                className="underline decoration-2 underline-offset-2 text-primary hover:text-primary/80"
              >
                Majestic Theatre Hill
              </a>
              . Right now events are gathered by scraping public sites, and coverage grows as new sources are added.
            </div>
            <div className="mt-4 rounded-2xl border border-brand-200/60 bg-surface p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-text-muted">Current approach</p>
              <ul className="mt-3 space-y-2 text-sm text-text">
                <li>• Event data is pulled from trusted local websites.</li>
                <li>• Listings are normalized into a single, readable format.</li>
                <li>• No direct event submission form is live yet.</li>
              </ul>
            </div>
          </article>

          <div className="space-y-6">
            <article className="rounded-3xl border border-brand-200/60 bg-surface p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-text-muted">About me</p>
              <h3 className="mt-3 text-xl font-semibold">Built by Alex</h3>
              <p className="mt-3 text-sm text-text-muted leading-relaxed">
                I built Out &amp; About Events to make local plans easier for people in the city. I care about clean interfaces, useful filtering, and making sure good community events are easier to discover.
              </p>
              <p className="mt-3 text-sm text-text-muted leading-relaxed">
                This project is actively evolving, and I&apos;m steadily improving source coverage, data quality, and the overall browsing experience.
              </p>
            </article>

            <article className="rounded-3xl border border-brand-200/60 bg-surface p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Build notes</p>
              <h3 className="mt-3 text-xl font-semibold">Designed to stay maintainable.</h3>
              <ul className="mt-4 space-y-3 text-sm text-text">
                <li><span className="font-semibold text-primary">•</span> Vite + React power routing and responsive views.</li>
                <li><span className="font-semibold text-primary">•</span> Tailwind semantic tokens keep colors consistent and accessible.</li>
                <li><span className="font-semibold text-primary">•</span> Shared hooks keep filtering, list rendering, and API fallback logic in one place.</li>
              </ul>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
