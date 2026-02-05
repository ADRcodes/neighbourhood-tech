import EventList from "../components/EventList";
import EventCarousel from "../components/EventCarousel";
import ColorPalettePopover from "../components/ColorPalettePopover";
import FiltersPanel from "../components/FiltersPanel";
import PaginationControls from "../components/PaginationControls";

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
  activeLocations = [],
  availableLocations = [],
  onToggleLocation = () => { },
  searchTerm = "",
  onSearchChange = () => { },
  loading = false,
  // error,
  // warning,
  eventPreferences = {},
  onSelectPreference = () => { },
  pagination = {},
}) {
  return (
    <div className="mobile-aurora relative flex flex-col min-w-0">
      <div className="w-full flex flex-col gap-2 items-center overflow-visible pb-8 min-w-0">
        <div className="w-full md:max-w-4xl lg:max-w-6xl px-0 pt-2 min-w-0">
          <h3 className="px-5 text-onprimary drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)] text-[20px] font-bold">
            Picked for you
          </h3>
          {featured.length > 0 && <EventCarousel events={featured} />}
        </div>

        <h3 className="px-5 mt-2 w-full text-onprimary drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)] text-[20px] font-bold">
          Coming up
        </h3>

        <div className="w-full px-2 sm:px-4 md:px-0">
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
          />
        </div>

        {loading ? (
          <div className="py-6 text-sm">Loading events…</div>
        ) : events.length ? (
          <EventList
            events={events}
            accordion
            headingTone="hero"
            eventPreferences={eventPreferences}
            onSelectPreference={onSelectPreference}
            onRegister={(ev) => console.log("register", ev.id)}
            cardClassName="card"
          />
        ) : (
          <div className="w-[340px] max-w-[92%] text-center text-sm text-gray-500 py-6">
            Nothing matches that yet.
          </div>
        )}

        <PaginationControls
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={pagination.onPageChange}
          className="w-full max-w-screen-sm px-6"
        />

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
              <div className="mt-4 pb-2 rounded-3xl border border-brand-200 bg-surface shadow-sm">
                <EventList
                  events={notInterestedEvents}
                  accordion
                  headingTone="default"
                  eventPreferences={eventPreferences}
                  onSelectPreference={onSelectPreference}
                  onRegister={(ev) => console.log("register", ev.id)}
                  cardClassName="card"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
