import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue } from "framer-motion";

// Demo data - updated to match EventCard.jsx structure
const SAMPLE_EVENTS = [
  {
    id: 1,
    title: "Tech Meetup",
    date: "2025-09-01T18:00:00",
    image: "https://picsum.photos/seed/evt1/800/450",
    price: 25,
    company: "Tech Innovators Inc.",
    description: "Join us for an evening of networking and learning about the latest in technology trends.",
    venue: {
      name: "Innovation Hub",
      address: "123 Water Street, St. John's, NL"
    },
    organizer: {
      name: "John Smith"
    },
    tags: ["Technology", "Networking", "Innovation"],
    capacity: 100
  },
  {
    id: 2,
    title: "React NL Meetup",
    date: "2025-09-05T19:00:00",
    image: "https://picsum.photos/seed/evt2/800/450",
    price: 0,
    company: "React Newfoundland",
    description: "A meetup for React developers to share knowledge and build community.",
    venue: {
      name: "MUN Computer Science Building",
      address: "230 Elizabeth Ave, St. John's, NL"
    },
    organizer: {
      name: "Sarah Johnson"
    },
    tags: ["React", "JavaScript", "Web Development"],
    capacity: 50
  },
  {
    id: 3,
    title: "AI Builders Workshop",
    date: "2025-09-08T18:30:00",
    image: "https://picsum.photos/seed/evt3/800/450",
    price: 20,
    company: "AI Solutions Lab",
    description: "Hands-on workshop building AI applications with modern tools and frameworks.",
    venue: {
      name: "Mount Pearl Community Center",
      address: "1755 O'Leary Ave, Mount Pearl, NL"
    },
    organizer: {
      name: "Dr. Emily Chen"
    },
    tags: ["AI", "Machine Learning", "Workshop"],
    capacity: 30
  },
  {
    id: 4,
    title: "Open Source Sprint",
    date: "2025-09-12T10:00:00",
    image: "https://picsum.photos/seed/evt4/800/450",
    price: 10,
    company: "Open Source Community",
    description: "Contributing to open source projects together. All skill levels welcome!",
    venue: {
      name: "Paradise Library",
      address: "30 McNamara Dr, Paradise, NL"
    },
    organizer: {
      name: "Michael Brown"
    },
    tags: ["Open Source", "Collaboration", "Coding"],
    capacity: 25
  }
];

// Sample registered users data for the EventCard component
const SAMPLE_REGISTERED_USERS = [
  { id: 1, name: "Alice Cooper", avatar: "https://picsum.photos/seed/user1/50/50" },
  { id: 2, name: "Bob Wilson", avatar: "https://picsum.photos/seed/user2/50/50" },
  { id: 3, name: "Charlie Davis", avatar: "https://picsum.photos/seed/user3/50/50" },
  { id: 4, name: "Diana Prince", avatar: "https://picsum.photos/seed/user4/50/50" },
  { id: 5, name: "Ethan Hunt", avatar: "https://picsum.photos/seed/user5/50/50" },
  { id: 6, name: "Fiona Shaw", avatar: "https://picsum.photos/seed/user6/50/50" },
  { id: 7, name: "George Lucas", avatar: "https://picsum.photos/seed/user7/50/50" }
];

export default function EventCarousel({
  events = [],
  registered = SAMPLE_REGISTERED_USERS,
  apiUrl = null, // API endpoint URL
  autoPlayMs = 6000,
  loop = true,
  onPageChange
}) {
  const [apiEvents, setApiEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch events from API
  useEffect(() => {
    if (!apiUrl) return;
    
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setApiEvents(Array.isArray(data) ? data : data.events || []);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [apiUrl]);

  // Determine which events to use (API data, passed props, or sample data)
  const list = useMemo(() => {
    if (apiUrl && apiEvents.length > 0) return apiEvents;
    if (events && events.length > 0) return events;
    return SAMPLE_EVENTS;
  }, [apiUrl, apiEvents, events]);
  const count = list.length;
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const x = useMotionValue(0);

  // Responsive cards-per-view
  const perView = useCardsPerView(viewportWidth);
  const slideWidth = viewportWidth > 0 ? viewportWidth / perView : 0;
  const pageCount = Math.max(1, Math.ceil(count / perView));
  const [pageIndex, setPageIndex] = useState(0);

  // ResizeObserver keeps width in sync
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setViewportWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Snap to current page when width/index changes
  useEffect(() => {
    const targetX = -pageIndex * viewportWidth;
    x.stop();
    x.set(targetX);
    onPageChange?.(pageIndex);
  }, [pageIndex, viewportWidth]);

  // Navigation helpers
  const clamp = (i) => Math.max(0, Math.min(i, pageCount - 1));
  const mod = (i, n) => ((i % n) + n) % n;
  const goTo = (i) => setPageIndex(loop ? mod(i, pageCount) : clamp(i));
  const next = () => goTo(pageIndex + 1);
  const prev = () => goTo(pageIndex - 1);

  // Autoplay (pause on hover/focus)
  const [isPaused, setIsPaused] = useState(false);
  useEffect(() => {
    if (!autoPlayMs || autoPlayMs <= 0) return;
    if (isPaused) return;
    const id = setInterval(next, autoPlayMs);
    return () => clearInterval(id);
  }, [pageIndex, isPaused, autoPlayMs, pageCount]);

  // Keyboard controls
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onKey = (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      else if (e.key === "Home") { e.preventDefault(); goTo(0); }
      else if (e.key === "End") { e.preventDefault(); goTo(pageCount - 1); }
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [pageIndex, pageCount]);

  // Drag/swipe
  const SWIPE_THRESHOLD = 0.15;
  const VELOCITY_THRESHOLD = 300;
  const handleDragEnd = (event, info) => {
    const { offset, velocity } = info;
    const pct = Math.abs(offset.x) / (viewportWidth || 1);
    if (pct > SWIPE_THRESHOLD || Math.abs(velocity.x) > VELOCITY_THRESHOLD) {
      if (offset.x < 0) next(); else prev();
    } else {
      x.stop();
      x.set(-pageIndex * viewportWidth);
    }
  };

  return (
    <section
      className="w-full"
      role="region"
      aria-roledescription="carousel"
      aria-label="Recommended events carousel"
    >
      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-600">Loading events...</div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-center justify-center p-8">
          <div className="text-red-600">Error loading events: {error}</div>
        </div>
      )}

      {/* Carousel */}
      {!loading && !error && (
        <div
          ref={viewportRef}
          tabIndex={0}
          className="relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
          data-testid="carousel-viewport"
        >
        <motion.div
          ref={trackRef}
          className="flex"
          style={{ width: count * slideWidth, x }}
          drag="x"
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          aria-live="polite"
          data-testid="carousel-track"
        >
          {list.map((event, i) => (
            <div key={event.id ?? i} style={{ width: slideWidth }} className="shrink-0 p-3 md:p-4">
              {/* Card structure from EventCard.jsx */}
              <EventCardDiv event={event} registered={registered} />
            </div>
          ))}
        </motion.div>

        {/* Navigation arrows */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-between p-2">
          <button
            type="button"
            onClick={prev}
            className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-white/90 backdrop-blur-md shadow-md ring-1 ring-black/5 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 px-3 h-10"
            aria-label="Previous"
          >
            <span aria-hidden>←</span>
          </button>
          <button
            type="button"
            onClick={next}
            className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-white/90 backdrop-blur-md shadow-md ring-1 ring-black/5 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 px-3 h-10"
            aria-label="Next"
          >
            <span aria-hidden>→</span>
          </button>
        </div>

        {/* Pagination dots */}
        <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2 w-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${i === pageIndex ? "bg-white" : "bg-white/50"}`}
              aria-label={`Go to page ${i + 1} of ${pageCount}`}
              aria-pressed={i === pageIndex}
              data-testid={`dot-${i}`}
            />
          ))}
        </div>
              </div>
      )}

      <p className="sr-only" aria-live="polite">Page {pageIndex + 1} of {pageCount}</p>
    </section>
  );
}

function useCardsPerView(width) {
  if (!width) return 1;
  if (width >= 1280) return 3; // lg+
  if (width >= 768) return 2;  // md
  return 1;                    // mobile
}

// Simple card component using the div structure from EventCard.jsx
function EventCardDiv({ event, registered }) {
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState(0);

  useEffect(() => {
    if (!contentRef.current) return;
    const el = contentRef.current;
    const measure = () => setMaxHeight(el.scrollHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [event.description, event.title, event.company, event.capacity, event?.venue?.address, event?.tags?.length]);

  const eventDate = useMemo(() => new Date(event.date), [event.date]);
  const formattedDate = useMemo(
    () => eventDate.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    [eventDate]
  );
  const formattedTime = useMemo(
    () => eventDate.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
    [eventDate]
  );

  const isFree = Number(event.price) === 0 || Number.isNaN(Number(event.price));
  const toggle = () => setExpanded((e) => !e);

  return (
    <div
      role="button"
      aria-expanded={expanded}
      tabIndex={0}
      onClick={toggle}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggle()}
      className="relative w-[260px] flex flex-col gap-2 p-2 rounded-lg shadow-md bg-white cursor-pointer select-none transition-shadow duration-200 hover:shadow-lg"
    >
      <img
        className="w-full aspect-[4/2] object-cover rounded-lg"
        src={event.image}
        alt="Event"
      />

      <h2 className="text-xl font-bold">{event.title}</h2>

      <div className="flex justify-between text-sm">
        <p>📍{event?.venue?.name}</p>
        <p>🗓️{formattedDate} - {formattedTime}</p>
      </div>

      <div className="flex items-center justify-between">
        {/* Price (or Free) */}
        <p className="text-base">
          {isFree ? "Free" : `${event.price}`}
          {!isFree && <span className="text-sm text-gray-500">/ticket</span>}
        </p>

        {/* Avatars */}
        <div className="ml-2">
          {registered.slice(0, 5).map((user) => (
            <img
              key={user.id}
              src={user.avatar}
              alt={user.name}
              className="inline-block w-6 h-6 -ml-[10px] border-2 border-white rounded-full"
            />
          ))}
          {registered.length > 5 && (
            <span className="align-middle text-sm inline-flex items-center justify-center w-6 h-6 -ml-[10px] border-2 border-white bg-green-500 text-white rounded-full">
              {registered.length - 5}
            </span>
          )}
        </div>
      </div>

      {/* Sliding panel */}
      <div
        ref={contentRef}
        className="overflow-hidden transition-[max-height] duration-500 ease-out"
        style={{ maxHeight: expanded ? maxHeight : 0 }}
        aria-hidden={!expanded}
      >
        <div
          className={`flex flex-col gap-2 transition-all duration-500 ${expanded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
            }`}
        >
          {Array.isArray(event.tags) && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div>
            <p className="text-sm text-gray-500">{event.company}</p>
            <p className="text-sm text-gray-500">{event?.venue?.address}</p>
            <p className="text-sm text-gray-500">Hosted by {event?.organizer?.name ?? "Organizer"}</p>
            <p className="my-2">{event.description}</p>
          </div>

          <button
            className="bg-blue-500 text-white py-1 px-2 rounded"
            onClick={(e) => {
              e.stopPropagation();
              // Handle register//
            }}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}
