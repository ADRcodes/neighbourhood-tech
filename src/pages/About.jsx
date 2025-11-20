import { Link } from "react-router-dom";

const STATS = [
  { label: "Neighbourhoods plugged in", value: "18" },
  { label: "Events surfaced", value: "420+" },
  { label: "Hosts onboarded", value: "32" },
];

export default function About() {
  return (
    <main className="bg-bg text-text">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-16 px-4 pt-0 pb-16 sm:px-6 sm:pt-4 lg:px-8">
        <section className="about-aurora px-4 py-10 sm:px-10 lg:px-14 text-onprimary">
          <span className="aurora-orb" aria-hidden />
          <span className="aurora-orb" aria-hidden />
          <span className="aurora-orb" aria-hidden />
          <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-5">
              <p className="text-xs uppercase tracking-[0.4em] text-onprimary/70">Neighbourhood Tech</p>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                One feed for what's happening in St. John&apos;s.
              </h1>
              <p className="text-base sm:text-lg text-onprimary/85">
                Neighbourhood Tech is a community-built listing that rounds up civic meetups, shows, maker nights, and pop-ups around St. John&apos;s. It takes the word-of-mouth events we love and keeps them in one calm spot so locals don&apos;t have to sift through generic feeds.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-onprimary shadow-[0_20px_40px_-28px_rgba(220,73,102,1)] hover:opacity-95"
                >
                  ＋ Host an event
                </Link>
                <Link
                  to="/saved"
                  className="inline-flex items-center gap-2 rounded-full border border-onprimary/40 px-5 py-2.5 text-sm font-semibold text-onprimary/90 hover:bg-onprimary/10"
                >
                  Browse saved spots
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
        <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <article className="rounded-3xl border border-brand-200/60 bg-surface/90 p-6 shadow-[0_18px_34px_-28px_rgba(16,24,40,0.5)]">
            <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Purpose</p>
            <h2 className="mt-3 text-2xl font-semibold">A calm feed for neighbourhood tech.</h2>
            <p className="mt-3 text-sm text-text-muted leading-relaxed">
              The app exists so artists, civic hackers, and local hosts in St. John&apos;s have one friendly spot to promote workshops without fighting generic event spam. It gathers neighbourhood tips, open mics, and pop-up markets so you can plan a week of events without hopping between feeds.
            </p>
            <div className="mt-4 text-sm text-text">
              <span className="font-semibold text-primary">Current sources:</span>{" "}
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
              . More trusted community calendars will be added as they come online.
            </div>
            <div className="mt-4 rounded-2xl border border-brand-200/60 bg-surface p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-text-muted">What we listen for</p>
              <ul className="mt-3 space-y-2 text-sm text-text">
                <li>• Downtown hosts testing ideas in small rooms.</li>
                <li>• Volunteers running recurring meetups who need signal boosts.</li>
                <li>• Residents looking for trusted events without sorting through ads.</li>
              </ul>
            </div>
          </article>
          <article className="rounded-3xl border border-brand-200/60 bg-surface p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Code notes</p>
            <h3 className="mt-3 text-xl font-semibold">Built to stay maintainable.</h3>
            <ul className="mt-4 space-y-3 text-sm text-text">
              <li><span className="font-semibold text-primary">•</span> Vite + React handle routing, with HomeShell switching mobile/desktop instantly.</li>
              <li><span className="font-semibold text-primary">•</span> Tailwind tokens (`bg-primary`, `text-text`) keep themes cohesive and accessible.</li>
              <li><span className="font-semibold text-primary">•</span> useEvents() normalizes API + mock data for chips, carousels, and saved views.</li>
              <li><span className="font-semibold text-primary">•</span> Supabase powers auth, with drop-down menus sharing logic across devices.</li>
            </ul>
            <Link
              to="/color-about"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full border border-brand-200/70 px-4 py-2 text-sm font-semibold text-text hover:bg-surface/80"
            >
              See the colour system ↗
            </Link>
          </article>
        </section>

        <section className="rounded-3xl border border-brand-200/60 bg-surface/90 p-6 text-center">
          <h3 className="text-2xl font-semibold">Have something cooking?</h3>
          <p className="mt-3 text-sm text-text-muted">
            Share your meetup, skill share, or block party. We keep the form light so you can get back to prepping.
          </p>
          <Link
            to="/register"
            className="mt-5 inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-onprimary shadow-[0_20px_30px_-24px_rgba(220,73,102,0.9)] hover:opacity-95"
          >
            Submit an event
          </Link>
        </section>
      </div>
    </main>
  );
}
