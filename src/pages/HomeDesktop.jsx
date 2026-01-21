import { useEffect, useRef, useState } from "react";
import FeaturedGrid from "../components/FeaturedGrid";
import EventList from "../components/EventList";
import Hero from "../components/Hero";
import FiltersPanel from "../components/FiltersPanel";
import PaginationControls from "../components/PaginationControls";

export default function HomeDesktop({
  featured = [],
  events = [],
  notInterestedEvents = [],
  showNotInterested = false,
  onToggleNotInterested = () => { },
  activeTags = [],
  availableTags = [],
  onToggleTag = () => { },
  activeSources = [],
  availableSources = [],
  onToggleSource = () => { },
  activeLocations = [],
  availableLocations = [],
  onToggleLocation = () => { },
  searchTerm = "",
  onSearchChange = () => { },
  loading,
  eventPreferences = {},
  onSelectPreference = () => { },
  pagination = {},
}) {
  const topFeatured = featured.slice(0, 8);
  const auroraSectionRef = useRef(null);
  const [allowAuroraMotion, setAllowAuroraMotion] = useState(true);
  const [auroraActive, setAuroraActive] = useState(false);
  const [auroraPaused, setAuroraPaused] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setAllowAuroraMotion(!media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!allowAuroraMotion || typeof window === "undefined") return;
    const node = auroraSectionRef.current;
    if (!node) return;

    if (typeof window.IntersectionObserver === "undefined") {
      setAuroraActive(true);
      return;
    }

    // kick off animation immediately; observer will pause when off-screen
    setAuroraActive(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        setAuroraActive(entry.isIntersecting);
      },
      { threshold: 0.24 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [allowAuroraMotion, topFeatured.length]);

  useEffect(() => {
    if (!allowAuroraMotion) {
      setAuroraActive(false);
      setAuroraPaused(false);
    }
  }, [allowAuroraMotion]);

  const handleAuroraPause = () => {
    if (!allowAuroraMotion || auroraPaused) return;
    setAuroraPaused(true);
  };

  const handleAuroraResume = () => {
    if (!allowAuroraMotion || !auroraPaused) return;
    setAuroraPaused(false);
  };

  const handleAuroraBlur = (event) => {
    if (!allowAuroraMotion) return;
    if (
      event.relatedTarget &&
      auroraSectionRef.current?.contains(event.relatedTarget)
    ) {
      return;
    }
    handleAuroraResume();
  };

  const auroraSectionClasses = [
    "featured-aurora",
    "xl:[grid-area:featured]",
    "relative rounded-3xl border border-brand-200 shadow-lg",
    "px-5 pt-5 pb-0 lg:px-6 lg:pt-6 lg:pb-0",
  ];

  if (allowAuroraMotion && auroraActive) {
    auroraSectionClasses.push("aurora--active");
  }
  if (auroraPaused) {
    auroraSectionClasses.push("aurora--paused");
  }

  return (
    <div className="mx-auto w-full text-text">
      {/* Responsive grid */}
      <div
        className="
          px-[32px] pt-4
          grid grid-cols-1 gap-6 items-start
          xl:grid-cols-[280px_1fr_300px]
          xl:[grid-template-areas:'featured_featured_featured''filters_main_aside']
        "
      >
        {topFeatured.length > 0 && (
          <section
            ref={auroraSectionRef}
            onPointerEnter={handleAuroraPause}
            onPointerLeave={handleAuroraResume}
            onFocusCapture={handleAuroraPause}
            onBlurCapture={handleAuroraBlur}
            className={auroraSectionClasses.join(" ")}
          >
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between mb-4">
              <div>
                <h2 className="text-2xl text-invert font-semibold">Featured highlights</h2>
                <p className="text-sm text-text-muted">
                  Curated standouts to catch before they sell out.
                </p>
              </div>
            </div>
            <FeaturedGrid items={topFeatured} />
          </section>
        )}

        {/* Left rail (filters) */}
        <aside
          className="
            self-start z-10
            xl:sticky xl:top-24
            xl:[grid-area:filters]
          "
        >
          <div className="py-3 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
            <FiltersPanel
              searchTerm={searchTerm}
              onSearchChange={onSearchChange}
              availableSources={availableSources}
              activeSources={activeSources}
              onToggleSource={onToggleSource}
              availableLocations={availableLocations}
              activeLocations={activeLocations}
              onToggleLocation={onToggleLocation}
              availableTags={availableTags}
              activeTags={activeTags}
              onToggleTag={onToggleTag}
              searchPlaceholder="Search…"

            />
          </div>
        </aside>

        {/* Main */}
        <main
          className="
            min-w-0
            xl:[grid-area:main]
          "
        >
          {loading ? (
            <div className="py-6 text-sm">Loading…</div>
          ) : events.length ? (
            <EventList
              events={events}
              accordion
              density="comfortable"
              columns={{ base: 1, lg: 2 }}
              eventPreferences={eventPreferences}
              onSelectPreference={onSelectPreference}
              onRegister={(ev) => console.log("register", ev.id)}
            />
          ) : (
            <div className="text-sm text-text-muted py-6">
              No events match your selection.
            </div>
          )}

          <PaginationControls
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
            className="mt-6"
          />

          {notInterestedEvents.length > 0 && (
            <section className="mt-8 rounded-2xl border border-brand-200 bg-surface shadow-sm p-4">
              <button
                type="button"
                onClick={onToggleNotInterested}
                className="flex w-full items-center justify-between text-left text-base font-semibold text-text"
                aria-expanded={showNotInterested}
              >
                <span>Not interested ({notInterestedEvents.length})</span>
                <span className="text-xl text-text/60" aria-hidden>
                  {showNotInterested ? "−" : "+"}
                </span>
              </button>
              {showNotInterested && (
                <div className="mt-4">
                  <EventList
                    events={notInterestedEvents}
                    accordion
                    density="comfortable"
                    columns={{ base: 1 }}
                    eventPreferences={eventPreferences}
                    onSelectPreference={onSelectPreference}
                    onRegister={(ev) => console.log("register", ev.id)}
                  />
                </div>
              )}
            </section>
          )}
        </main>

        {/* Right rail */}
        <aside className="hidden xl:block xl:sticky xl:top-24 self-start z-10 xl:[grid-area:aside]">
          <div className="space-y-4">
            <section className="rounded-2xl border shadow-sm p-3 bg-surface border-brand-200">
              <h3 className="text-sm font-semibold mb-2">Happening soon</h3>
              <ul className="space-y-2 text-sm text-text-muted">
                <li className="flex justify-between"><span>DevOps Deep Dive</span><time>Jul 15</time></li>
                <li className="flex justify-between"><span>Community Social Night</span><time>Jul 22</time></li>
              </ul>
            </section>

            <section className="rounded-2xl p-4 shadow-sm bg-primary/10 border border-brand-100">
              <h3 className="font-semibold text-primary">Host your event</h3>
              <p className="text-sm text-text-muted mt-1">Share your workshop or meetup.</p>
              <a
                href="/register"
                className="inline-block mt-3 rounded-lg px-3 py-1.5 font-semibold bg-primary text-onprimary hover:opacity-95"
              >
                Create event
              </a>
            </section>
          </div>
        </aside>
      </div>

      <footer className="px-[32px] mt-16">
        <div className="mx-auto max-w-6xl rounded-3xl border border-brand-200/70 bg-surface/85 backdrop-blur-xl shadow-[0_40px_120px_-60px_rgba(16,24,40,0.75)] overflow-hidden">
          <div className="relative">
            <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
              <div className="absolute -left-20 top-10 h-64 w-64 bg-primary blur-3xl rounded-full" />
              <div className="absolute right-0 bottom-0 h-48 w-48 bg-accent blur-3xl rounded-full" />
            </div>
            <div className="relative px-8 py-10 lg:px-12 grid gap-8 lg:grid-cols-[1.5fr_1fr_1fr] text-sm text-text-muted">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-brand-200/70 bg-surface/80 px-3 py-1 text-xs uppercase tracking-[0.3em] text-primary shadow-inner">
                  Neighbourhood
                </div>
                <p className="text-2xl lg:text-3xl font-semibold text-text">
                  Tech for humans, by neighbours.
                </p>
                <p className="max-w-md">
                  Weekly happenings, coffee chats, hack nights, and collabs. Plug in, try something new, or host your own — we’ll help you get it seen.
                </p>
                <a
                  href="/register"
                  className="inline-flex w-fit items-center gap-2 rounded-full bg-primary text-onprimary text-sm font-semibold px-4 py-2 shadow-[0_12px_30px_-16px_rgba(220,73,102,0.9)] hover:shadow-[0_16px_40px_-14px_rgba(220,73,102,0.95)] transition"
                >
                  ＋ Submit an event
                </a>
              </div>
              <div className="space-y-3">
                <p className="font-semibold text-text">Explore</p>
                <ul className="space-y-2">
                  <li><a className="hover:text-text transition" href="/explore">Find events</a></li>
                  <li><a className="hover:text-text transition" href="/register">Host an event</a></li>
                  <li><a className="hover:text-text transition" href="/about">About</a></li>
                  <li><a className="hover:text-text transition" href="/explore?q=workshop">Workshops</a></li>
                </ul>
              </div>
              <div className="space-y-3">
                <p className="font-semibold text-text">Stay in touch</p>
                <p>hello@neighbourhood.tech</p>
                <div className="flex gap-3 pt-2">
                  <a className="text-text-muted hover:text-text transition" href="#linkedin">LinkedIn</a>
                  <a className="text-text-muted hover:text-text transition" href="#insta">Instagram</a>
                  <a className="text-text-muted hover:text-text transition" href="#discord">Discord</a>
                </div>
                <p className="text-xs text-text-muted/80 pt-4">
                  © {new Date().getFullYear()} Neighbourhood Tech Collective
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
