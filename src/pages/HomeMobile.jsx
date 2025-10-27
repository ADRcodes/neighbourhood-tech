import { useRef } from "react";
import EventList from "../components/EventList";
import TagFilterBar from "../components/TagFilterBar";
import EventCarousel from "../components/EventCarousel";
import ColorPalettePopover from "../components/ColorPalettePopover";
import { CHIPS } from "../lib/utils/tags";

export default function HomeMobile({
  featured = [],
  events = [],
  activeTags = [],
  onToggleTag = () => {},
  loading = false,
  error,
  warning,
}) {
  const chipsRef = useRef(null);
  const showStatus = warning || (error && !loading);

  return (
    <div className="tiled-background relative flex flex-col min-w-0">
      <div className="w-full flex flex-col gap-2 items-center overflow-y-auto pb-8 min-w-0">
        <div className="md:hidden">
          <ColorPalettePopover />
        </div>

        <div className="w-full max-w-screen-sm md:max-w-4xl lg:max-w-6xl px-0 md:px-0 pt-2 min-w-0">
          <h3 className="h3">Recommended events</h3>
          {featured.length > 0 && <EventCarousel events={featured} />}
        </div>

        {showStatus && (
          <div className="p-4 mb-6 mt-2 bg-white/90 rounded-4xl border-2 border-x-amber-800/20 border-y-blue-800/20 text-center shadow-2xl shadow-red-200">
            {warning && <div className="py-2 text-xs text-amber-700">{warning}</div>}
            {error && !loading && <div className="py-2 text-xs text-blue-600">{String(error)}</div>}
            {!error && !loading && events.length === 0 && (
              <div className="py-2 text-xs text-gray-600">No events match your selection.</div>
            )}
          </div>
        )}

        <h3 className="h3 w-full">Upcoming events</h3>
        <TagFilterBar
          ref={chipsRef}
          items={CHIPS}
          activeKeys={activeTags}
          onToggle={onToggleTag}
        />

        {loading ? (
          <div className="py-6 text-sm">Loading…</div>
        ) : events.length ? (
          <EventList
            events={events}
            accordion
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
}
