import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import EventCard from "../components/EventCard";
import EventList from "../components/EventList";
import TagFilterBar from "../components/TagFilterBar";

import { useEvents } from "../lib/hooks/useEvents";
import { CHIPS } from "../lib/utils/tags";

const Home2 = () => {
  const navigate = useNavigate();
  const chipsRef = useRef(null);

  const {
    filtered, // Events after filtering by chips
    recommended,
    chips,
    toggleChip,
    loading,
    error,
    warning,
  } = useEvents({
    useApi: true,          // flip false to force mocks
    fallbackToMocks: true, // graceful offline
    initialChips: [],
  });

  return (
    <div className="phone-frame tiled-background relative overflow-hidden flex flex-col">
      <div className="w-full flex flex-col gap-5 items-center overflow-y-auto pb-8">
        {/* Header */}
        <div className="w-full flex justify-center mt-2">
          <div className="w-[340px] max-w-[92%] flex items-center justify-between">
            <h2 className="text-[26px] font-bold text-[#3F72FF] drop-shadow-sm text-center">
              Upcoming events
            </h2>
            <button
              onClick={() => navigate("/register")}
              className="auth-button register-button"
            >
              Create Event
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
        <TagFilterBar
          ref={chipsRef}
          items={CHIPS}
          activeKeys={chips}
          onToggle={toggleChip}
        />

        {/* Status / list */}
        {(warning || (error && !loading)) && (
          <div className="p-4 m-2 bg-white/90 rounded-4xl border-4 border-x-amber-800/20 border-y-blue-800/20 text-center shadow-2xl shadow-red-200">
            {warning && <div className="py-2 text-xs text-amber-700">{warning}</div>}
            {error && !loading && <div className="py-2 text-xs text-blue-600">{String(error)}</div>}
            {!error && !loading && filtered.length === 0 && (
              <div className="py-2 text-xs text-gray-600">No events match your selection.</div>
            )}
          </div>
        )}

        {loading ? (
          <div className="py-6 text-sm">Loading…</div>
        ) : filtered.length ? (
          <EventList
            events={filtered}
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

export default Home2;
