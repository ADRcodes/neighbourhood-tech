// src/pages/Home.jsx
import { useEffect, useMemo, useRef, useState, forwardRef } from "react";
import EventCard from "../components/EventCard";
import EventList from "../components/EventList";
import { useNavigate } from "react-router-dom";

/* ----------------------------- Config ----------------------------- */
// Flip this to false to run with the inline MOCK_EVENTS below.
const USE_API = true;

// Where your Spring Boot app runs. You can set this in .env.local as:
// VITE_API_URL=http://localhost:8080
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

/* --------------------------- Tag chips UI ------------------------- */
const CHIPS = [
  { key: "social", label: "Social", icon: "☕️" },
  { key: "networking", label: "Networking", icon: "👥" },
  { key: "design", label: "Design", icon: "🧰" },
  { key: "funding", label: "Funding", icon: "💼" },
];

// Front-end keyword mapping: we check title/company/venue/tags
const CHIP_KEYWORDS = {
  social: ["social", "party", "night", "fest", "festival", "showcase"],
  networking: [
    "network",
    "networking",
    "meetup",
    "summit",
    "conference",
    "day",
    "devopsdays",
    "showcase",
    "container day",
    "devops",
  ],
  design: [
    "design",
    "css",
    "frontend",
    "ux",
    "ui",
    "react",
    "frameworks",
    "routing",
  ],
  funding: [
    "funding",
    "startup",
    "pitch",
    "pitching",
    "vc",
    "investor",
    "grant",
  ],
};

// helpers
const norm = (v) => (v == null ? "" : String(v).toLowerCase());
const getEventTagsLower = (ev) => {
  const candidates = [ev.tags, ev.event_tags, ev.tagNames, ev.tag_list];
  return candidates.flatMap((x) => (Array.isArray(x) ? x : [])).map(norm);
};
// Normalize "YYYY-MM-DD HH:mm:ss" -> "YYYY-MM-DDTHH:mm:ss" for Safari/Firefox
const normalizeDate = (d) => {
  if (!d) return null;
  if (d instanceof Date) return d.toISOString();
  const s = String(d).trim();
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(s))
    return s.replace(" ", "T");
  return s;
};

/* -------------------- Optional inline mock data ------------------- */
const MOCK_EVENTS = [
  {
    id: 1,
    company: "TechCorp",
    title: "DevOps Deep Dive",
    date: "2025-07-15T09:30:00",
    description: "CI/CD, IaC & monitoring workshop.",
    price: 149.99,
    capacity: 50,
    image: "https://picsum.photos/id/1015/600/400",
    venue: {
      id: 1,
      name: "Downtown Conference Center",
      address: "123 Main St, Springfield",
      capacity: 200,
    },
    organizer: { id: 1, name: "John Doe" },
    tags: ["Tech", "DevOps", "CI/CD"],
    registered: [
      { id: 1, name: "User 1", avatar: "https://picsum.photos/40/40?1" },
      { id: 2, name: "User 2", avatar: "https://picsum.photos/40/40?2" },
      { id: 3, name: "User 3", avatar: "https://picsum.photos/40/40?3" },
      { id: 4, name: "User 4", avatar: "https://picsum.photos/40/40?4" },
      { id: 5, name: "User 5", avatar: "https://picsum.photos/40/40?5" },
      { id: 6, name: "User 6", avatar: "https://picsum.photos/40/40?6" },
    ],
  },
  {
    id: 2,
    company: "Neighborhood Org",
    title: "Community Social Night",
    date: "2025-07-22T18:30:00",
    description: "Casual hangout with snacks, music, and games.",
    price: 0,
    capacity: 120,
    image: "https://picsum.photos/id/1050/600/400",
    venue: {
      id: 2,
      name: "Riverside Expo Hall",
      address: "456 River Rd, Shelbyville",
      capacity: 500,
    },
    organizer: { id: 2, name: "Lina Park" },
    tags: ["Social", "Party", "Community"],
    registered: [
      { id: 1, name: "Alex", avatar: "https://picsum.photos/40/40?7" },
      { id: 2, name: "Sam", avatar: "https://picsum.photos/40/40?8" },
      { id: 3, name: "Jess", avatar: "https://picsum.photos/40/40?9" },
    ],
  },
  {
    id: 3,
    company: "StartupSpark",
    title: "Pitch Fest 2025",
    date: "2025-06-26T14:00:00",
    description: "Local startups pitch to investors and mentors.",
    price: 25.0,
    capacity: 120,
    image: "https://picsum.photos/id/1043/600/400",
    venue: {
      id: 3,
      name: "Riverside Expo Hall",
      address: "456 River Rd, Shelbyville",
      capacity: 500,
    },
    organizer: { id: 3, name: "Morgan Li" },
    tags: ["Startup", "Pitching", "Funding"],
    registered: [
      { id: 1, name: "Ivy", avatar: "https://picsum.photos/40/40?10" },
      { id: 2, name: "Noah", avatar: "https://picsum.photos/40/40?11" },
    ],
  },
  {
    id: 4,
    company: "StyleScript",
    title: "CSS Beyond Basics",
    date: "2025-10-19T10:00:00",
    description: "Modern layout techniques, tokens, and design systems.",
    price: 65.0,
    capacity: 70,
    image: "https://picsum.photos/id/1035/600/400",
    venue: {
      id: 4,
      name: "AI Collaborative Space",
      address: "222 Neural Ln, Modeltown",
      capacity: 140,
    },
    organizer: { id: 4, name: "Sofia Vega" },
    tags: ["CSS", "Design", "Frontend"],
    registered: [
      { id: 1, name: "Mina", avatar: "https://picsum.photos/40/40?12" },
      { id: 2, name: "Jake", avatar: "https://picsum.photos/40/40?13" },
      { id: 3, name: "Alec", avatar: "https://picsum.photos/40/40?14" },
    ],
  },
  {
    id: 5,
    company: "DataPros",
    title: "AI in Production",
    date: "2025-09-10T10:00:00",
    description: "Deploying ML at scale with observability and safety.",
    price: 199.0,
    capacity: 40,
    image: "https://picsum.photos/id/1005/600/400",
    venue: {
      id: 5,
      name: "Tech Campus Auditorium",
      address: "789 Tech Blvd, Capital City",
      capacity: 300,
    },
    organizer: { id: 5, name: "Carol Martinez" },
    tags: ["AI", "Machine Learning"],
    registered: [
      { id: 1, name: "Riley", avatar: "https://picsum.photos/40/40?15" },
      { id: 2, name: "Theo", avatar: "https://picsum.photos/40/40?16" },
      { id: 3, name: "Kai", avatar: "https://picsum.photos/40/40?17" },
      { id: 4, name: "Remy", avatar: "https://picsum.photos/40/40?18" },
    ],
  },
  {
    id: 6,
    company: "CodeNest",
    title: "Frontend Future Summit",
    date: "2025-10-05T11:00:00",
    description: "React, Svelte, and UX trends with live demos.",
    price: 89.0,
    capacity: 100,
    image: "https://picsum.photos/id/1020/600/400",
    venue: {
      id: 6,
      name: "Innovation Loft",
      address: "321 Startup Ln, Techville",
      capacity: 150,
    },
    organizer: { id: 6, name: "Bob Johnson" },
    tags: ["Frontend", "UX", "Conference"],
    registered: [
      { id: 1, name: "Ava", avatar: "https://picsum.photos/40/40?19" },
      { id: 2, name: "Leo", avatar: "https://picsum.photos/40/40?20" },
    ],
  },
  {
    id: 7,
    company: "DevDocks",
    title: "Container Day",
    date: "2025-06-28T10:00:00",
    description: "Docker & Kubernetes hands-on workshops all day.",
    price: 99.0,
    capacity: 80,
    image: "https://picsum.photos/id/1024/600/400",
    venue: {
      id: 7,
      name: "Docker Dock",
      address: "44 Container Blvd, Shipyard",
      capacity: 120,
    },
    organizer: { id: 7, name: "Alec Devlin" },
    tags: ["Containers", "Docker", "Kubernetes"],
    registered: [
      { id: 1, name: "Zoe", avatar: "https://picsum.photos/40/40?21" },
      { id: 2, name: "Milo", avatar: "https://picsum.photos/40/40?22" },
      { id: 3, name: "Elle", avatar: "https://picsum.photos/40/40?23" },
      { id: 4, name: "Nico", avatar: "https://picsum.photos/40/40?24" },
    ],
  },
];

/* ------------------------- API fetch helpers ---------------------- */
const coerceEvent = (e) => {
  const rawDate = e.date ?? e.startDate ?? e.start_time ?? null;
  const tags = Array.isArray(e.tags)
    ? e.tags
    : Array.isArray(e.event_tags)
    ? e.event_tags.map((t) => (typeof t === "string" ? t : t.tag))
    : Array.isArray(e.tagsList)
    ? e.tagsList
    : [];

  const venue = e.venue
    ? {
        id: e.venue.id ?? null,
        name: e.venue.name ?? e.venueName ?? "",
        address: e.venue.address ?? e.venueAddress ?? "",
        capacity: e.venue.capacity ?? null,
      }
    : {
        id: null,
        name: e.venueName ?? "",
        address: e.venueAddress ?? "",
        capacity: null,
      };

  const organizer = e.organizer
    ? {
        id: e.organizer.id ?? e.organizerId ?? null,
        name: e.organizer.name ?? e.organizerName ?? "",
      }
    : {
        id: e.organizerId ?? null,
        name: e.organizerName ?? "",
      };

  const regs = Array.isArray(e.registered)
    ? e.registered
    : Array.isArray(e.registrations)
    ? e.registrations.map((r) => {
        const u = r.user || r.attendee || {};
        const name = u.name ?? "Guest";
        const id = u.id ?? r.userId ?? null;
        const avatar =
          u.avatar ??
          `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(
            name
          )}`;
        return { id, name, avatar };
      })
    : [];

  return {
    id: e.id,
    company: e.company ?? "",
    title: e.title ?? e.name ?? "",
    date: normalizeDate(rawDate),
    description: e.description ?? "",
    price: e.price ?? e.cost ?? 0,
    capacity: e.capacity ?? 0,
    image:
      e.image ??
      e.coverImageUrl ??
      `https://picsum.photos/seed/${e.id || Math.random()}/600/400`,
    venue,
    organizer,
    tags,
    registered: regs,
  };
};

async function fetchEvents() {
  const res = await fetch(`${API_BASE}/api/events`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.json();
  const rows = Array.isArray(body) ? body : body?.content ?? [];
  return rows.map(coerceEvent);
}

/* ----------------------------- Chips row -------------------------- */
const FilterChips = forwardRef(function FilterChips(
  { items, activeKeys, onToggle },
  ref
) {
  return (
    <div ref={ref} className="w-full flex justify-center">
      <div className="w-[340px] max-w-[92%]">
        <div className="chip-scroll mask-fade-x flex gap-3 overflow-x-auto py-2 scroll-smooth snap-x snap-mandatory">
          {items.map((c) => {
            const on = activeKeys.includes(c.key);
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => onToggle?.(c.key)}
                aria-pressed={on}
                className={`snap-start shrink-0 inline-flex items-center gap-2 px-4 py-[10px]
                            rounded-full border transition-all duration-200
                            ${
                              on
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200"
                                : "bg-white/85 text-gray-900 border-gray-200 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_6px_16px_rgba(2,6,23,0.06)] hover:bg-gray-50"
                            }`}
              >
                <span className="text-lg">{c.icon}</span>
                <span className="text-base font-semibold">{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});

/* -------------------------------- Page ---------------------------- */
const Home = () => {
  const navigate = useNavigate();

  const [activeChips, setActiveChips] = useState([]); // none selected
  const [events, setEvents] = useState(USE_API ? [] : MOCK_EVENTS);
  const [loading, setLoading] = useState(USE_API);
  const [error, setError] = useState(null);

  const chipsRef = useRef(null);

  // Fetch from API when enabled
  useEffect(() => {
    if (!USE_API) return;
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const list = await fetchEvents();
        if (alive) setEvents(list);
      } catch (e) {
        if (alive) setError(String(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Carousel should NOT change when chips change
  const recommended = useMemo(() => events.slice(0, 3), [events]);

  // Filtered list reacts to chips
  const filteredEvents = useMemo(() => {
    if (!activeChips.length) return events;
    return events.filter((ev) => {
      const haystack = `${norm(ev.title)} ${norm(ev.company)} ${norm(
        ev?.venue?.name
      )}`;
      const tags = getEventTagsLower(ev);
      return activeChips.some((chip) =>
        (CHIP_KEYWORDS[chip] || []).some((kw) => {
          const k = norm(kw);
          return haystack.includes(k) || tags.some((t) => t.includes(k));
        })
      );
    });
  }, [events, activeChips]);

  const toggleChip = (key) =>
    setActiveChips((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );

  const handleViewAll = () => {
    chipsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="phone-frame relative overflow-hidden flex flex-col">
      {/* Scrollable page column */}
      <div className="w-full flex flex-col gap-5 items-center overflow-y-auto max-h-[calc(100vh-6rem)] pb-8">
        {/* Header */}
        <div className="w-full flex justify-center mt-2">
          <div className="w-[340px] max-w-[92%] flex items-center justify-between">
            <h2 className="text-lg font-semibold">Upcoming events</h2>
            {/* <button
              onClick={handleViewAll}
              className="text-sm text-indigo-600 hover:underline"
            >
              View all
            </button> */}
            <button
              onClick={() => navigate("/register")}
              className="auth-button register-button"
            >
              Create New Event
            </button>
          </div>
        </div>

        {/* --- Mini carousel (first three) — stays unfiltered --- */}
        {recommended.length > 0 && (
          <div className="w-full flex justify-center -mt-1">
            <div className="w-[340px] max-w-[92%]">
              <div className="flex gap-4 overflow-x-auto pb-1">
                {recommended.map((ev) => (
                  <div key={ev.id} className="shrink-0">
                    <EventCard event={ev} registered={ev.registered} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tag chip rail (what “View all” scrolls to) */}
        <FilterChips
          ref={chipsRef}
          items={CHIPS}
          activeKeys={activeChips}
          onToggle={toggleChip}
        />

        {/* Status / list */}
        {error && !loading && (
          <div className="py-6 text-sm text-red-600">Error: {error}</div>
        )}
        {loading ? (
          <div className="py-6 text-sm">Loading…</div>
        ) : filteredEvents.length > 0 ? (
          <EventList
            events={filteredEvents}
            accordion={true}
            onRegister={(ev) => console.log("register", ev.id)}
          />
        ) : (
          <div className="w-[340px] max-w-[92%] text-center text-sm text-gray-500 py-6">
            No events match your selection.
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
