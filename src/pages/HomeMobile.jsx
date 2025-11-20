import EventList from "../components/EventList";
import EventCarousel from "../components/EventCarousel";
import ColorPalettePopover from "../components/ColorPalettePopover";
import TagList from "../components/TagList";

export default function HomeMobile({
  featured = [],
  events = [],
  notInterestedEvents = [],
  showNotInterested = false,
  onToggleNotInterested = () => { },
  activeTags = [],
  onToggleTag = () => { },
  availableTags = [],
  activeSources = [],
  availableSources = [],
  onToggleSource = () => { },
  loading = false,
  // error,
  // warning,
  eventPreferences = {},
  onSelectPreference = () => { },
}) {
  return (
    <div className="tiled-background relative flex flex-col min-w-0">
      <div className="w-full flex flex-col gap-2 items-center overflow-y-auto pb-8 min-w-0">
        <div className="w-full md:max-w-4xl lg:max-w-6xl px-0 md:px-0 pt-2 min-w-0">
          <h3 className="h3">Recommended events</h3>
          {featured.length > 0 && <EventCarousel events={featured} />}
        </div>

        <h3 className="h3 mt-2 w-full">Upcoming events</h3>

        <div className="w-full px-4">
          <div className="rounded-3xl border border-brand-100 bg-surface shadow-sm p-4 space-y-4">
            <TagList
              title="Filter by source"
              items={availableSources}
              activeKeys={activeSources}
              onToggle={onToggleSource}
              emptyLabel="Sources will appear once events load."
            />
            <TagList
              title="Filter by tag"
              items={availableTags}
              activeKeys={activeTags}
              onToggle={onToggleTag}
              emptyLabel="Tags will appear once events load."
            />
          </div>
        </div>

        {loading ? (
          <div className="py-6 text-sm">Loading…</div>
        ) : events.length ? (
          <EventList
            events={events}
            accordion
            eventPreferences={eventPreferences}
            onSelectPreference={onSelectPreference}
            onRegister={(ev) => console.log("register", ev.id)}
          />
        ) : (
          <div className="w-[340px] max-w-[92%] text-center text-sm text-gray-500 py-6">
            No events match your selection.
          </div>
        )}

        {notInterestedEvents.length > 0 && (
          <div className="w-full max-w-screen-sm px-4 sm:px-0 pb-10">
            <button
              type="button"
              onClick={onToggleNotInterested}
              className="w-full flex items-center justify-between rounded-2xl border border-brand-200 bg-surface px-4 py-3 text-left text-sm font-semibold text-text shadow-sm hover:border-brand-300 transition"
              aria-expanded={showNotInterested}
            >
              <span>Not interested ({notInterestedEvents.length})</span>
              <span className="text-lg" aria-hidden>
                {showNotInterested ? "−" : "+"}
              </span>
            </button>
            {showNotInterested && (
              <div className="mt-4 rounded-3xl border border-brand-200 bg-surface shadow-sm">
                <EventList
                  events={notInterestedEvents}
                  accordion
                  eventPreferences={eventPreferences}
                  onSelectPreference={onSelectPreference}
                  onRegister={(ev) => console.log("register", ev.id)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
