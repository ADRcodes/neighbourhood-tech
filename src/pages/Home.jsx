// src/pages/Home.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import EventCard from "../components/EventCard";
import EventList from "../components/EventList";
import {
  USE_API,
  CHIPS,
  MOCK_EVENTS,
  fetchEvents,
  filterEvents,
  recommendedOf,
  TagFilterBar,
} from "../components/tags";

const Home = () => {
  const [activeChips, setActiveChips] = useState([]);
  const [events, setEvents] = useState(USE_API ? [] : MOCK_EVENTS);
  const [loading, setLoading] = useState(USE_API);
  const [error, setError] = useState(null);

  const chipsRef = useRef(null);

  // Load events (from API or mock)
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
    return () => { alive = false; };
  }, []);

  const recommended = useMemo(() => recommendedOf(events, 3), [events]);
  const filteredEvents = useMemo(
    () => filterEvents(events, activeChips),
    [events, activeChips]
  );

  const toggleChip = (key) =>
    setActiveChips((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );

  const handleViewAll = () =>
    chipsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

  return (
    <div className="phone-frame relative overflow-hidden flex flex-col">
      <div className="w-full flex flex-col gap-5 items-center overflow-y-auto max-h-[calc(100vh-6rem)] pb-8">
        {/* Header */}
        <div className="w-full flex justify-center mt-2">
          <div className="w-[340px] max-w-[92%] flex items-center justify-between">
            <h2 className="text-lg font-semibold">Upcoming events</h2>
            <button onClick={handleViewAll} className="text-sm text-indigo-600 hover:underline">
              View all
            </button>
          </div>
        </div>

        {/* Carousel (unfiltered) */}
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

        {/* Tags */}
        <TagFilterBar ref={chipsRef} items={CHIPS} activeKeys={activeChips} onToggle={toggleChip} />

        {/* Status / list */}
        {error && !loading && <div className="py-6 text-sm text-red-600">Error: {error}</div>}
        {loading ? (
          <div className="py-6 text-sm">Loading…</div>
        ) : filteredEvents.length ? (
          <EventList events={filteredEvents} accordion={true} onRegister={(ev) => console.log("register", ev.id)} />
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
