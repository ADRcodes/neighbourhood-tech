import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSavedEvents } from "../lib/context/SavedEventsProvider";
import FiltersPanel from "../components/FiltersPanel";
import EventListItem from "../components/EventListItem";
import { buildLocationOptions, buildSourceOptions, buildTagOptions, filterEvents } from "../lib/utils/events";

const STATUS_GROUPS = [
  { key: "going", label: "Saved" },
  { key: "interested", label: "Interested" },
  { key: "not_interested", label: "Not interested" },
];

const STATUS_DESCRIPTIONS = {
  going: "Saved for later",
  interested: "Keeping an eye on",
  not_interested: "Passing on these",
};

const Saved = () => {
  const navigate = useNavigate();
  const { entries, loading, error: loadError, updateStatus, user, ready, hasSupabase } = useSavedEvents();
  const [actionError, setActionError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTags, setActiveTags] = useState([]);
  const [activeSources, setActiveSources] = useState([]);
  const [activeLocations, setActiveLocations] = useState([]);
  const [openSections, setOpenSections] = useState({
    going: false,
    interested: false,
    not_interested: false,
  });
  const [openIds, setOpenIds] = useState(() => new Set());

  const handleStatusChange = useCallback(async (eventId, status) => {
    if (!user) return;
    setActionError("");
    try {
      await updateStatus(eventId, status);
    } catch (err) {
      console.error("Failed to update", err);
      setActionError(err.message || "Unable to update status");
    }
  }, [updateStatus, user]);

  const savedEvents = useMemo(() => entries.map((entry) => entry.event), [entries]);

  const tagOptions = useMemo(() => buildTagOptions(savedEvents), [savedEvents]);
  const sourceOptions = useMemo(() => buildSourceOptions(savedEvents), [savedEvents]);
  const locationOptions = useMemo(() => buildLocationOptions(savedEvents), [savedEvents]);

  const filteredEntries = useMemo(() => {
    if (!entries.length) return [];
    if (!activeTags.length && !activeSources.length && !activeLocations.length && !searchTerm.trim()) {
      return entries;
    }
    const decorated = entries.map((entry) => ({ ...entry.event }));
    const filteredEvents = filterEvents(decorated, {
      tags: activeTags,
      sources: activeSources,
      locations: activeLocations,
      search: searchTerm,
    });
    const allowedIds = new Set(filteredEvents.map((event) => event.id));
    return entries.filter((entry) => allowedIds.has(entry.event.id));
  }, [entries, activeTags, activeSources, activeLocations, searchTerm]);

  const grouped = useMemo(() => {
    const base = {
      going: [],
      interested: [],
      not_interested: [],
    };
    filteredEntries.forEach((entry) => {
      const key = entry.status === "going"
        ? "going"
        : entry.status === "not_interested"
          ? "not_interested"
          : "interested";
      base[key].push(entry);
    });
    return base;
  }, [filteredEntries]);

  const hasAnyFiltered = filteredEntries.length > 0;
  const isFiltering =
    activeTags.length > 0 ||
    activeSources.length > 0 ||
    activeLocations.length > 0 ||
    Boolean(searchTerm.trim());
  const toggleTag = useCallback(
    (key) => {
      setActiveTags((prev) => (prev.includes(key) ? prev.filter((v) => v !== key) : [...prev, key]));
    },
    []
  );
  const toggleSource = useCallback(
    (key) => {
      setActiveSources((prev) => (prev.includes(key) ? prev.filter((v) => v !== key) : [...prev, key]));
    },
    []
  );
  const toggleLocation = useCallback(
    (key) => {
      setActiveLocations((prev) => (prev.includes(key) ? prev.filter((v) => v !== key) : [...prev, key]));
    },
    []
  );
  const toggleSection = useCallback((key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);
  const toggleEventOpen = useCallback((eventId) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      return next;
    });
  }, []);

  const content = useMemo(() => {
    if (!hasSupabase) {
      return (
        <div className="rounded-2xl border border-brand-200 bg-surface p-4 text-sm text-text">
          Supabase is not configured. Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your env to enable saved events.
        </div>
      );
    }

    if (!ready || loading) {
      return <p className="text-sm text-text-muted">Loading your saved events…</p>;
    }

    if (!user) {
      return (
        <div className="space-y-3 text-sm text-text">
          <p>You need an account to save events.</p>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-semibold text-onprimary hover:opacity-95"
            onClick={() => navigate("/auth")}
          >
            Sign in to manage saved events
          </button>
        </div>
      );
    }

    if (!hasAnyFiltered) {
      return (
        <div className="text-sm text-text-muted py-6">
          {isFiltering ? "No saved events match your filters." : "No saved events yet."}
        </div>
      );
    }
    const largeColumns = (
      <div className="hidden lg:flex lg:flex-col gap-6">
        <div className="grid gap-6 lg:[grid-template-columns:minmax(400px,1fr)_minmax(400px,1fr)]">
          {STATUS_GROUPS.filter((group) => group.key !== "not_interested").map((group) => (
            <SavedStatusColumn
              key={group.key}
              label={group.label}
              description={STATUS_DESCRIPTIONS[group.key]}
              entries={grouped[group.key]}
              onStatusChange={handleStatusChange}
              openIds={openIds}
              onToggleOpen={toggleEventOpen}
            />
          ))}
        </div>
        <section className="rounded-3xl border border-brand-200 bg-surface shadow-sm">
          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold"
            onClick={() => toggleSection("not_interested")}
            aria-expanded={openSections.not_interested}
          >
            <span>
              {STATUS_GROUPS.find((group) => group.key === "not_interested")?.label} ({grouped.not_interested.length})
            </span>
            <span className="text-lg" aria-hidden>
              {openSections.not_interested ? "−" : "+"}
            </span>
          </button>
          {openSections.not_interested && (
            <div className="px-4 pb-4">
              <SavedEventsList
                entries={grouped.not_interested}
                onStatusChange={handleStatusChange}
                openIds={openIds}
                onToggleOpen={toggleEventOpen}
              />
            </div>
          )}
        </section>
      </div>
    );

    const mobileAccordions = (
      <div className="lg:hidden space-y-4">
        {STATUS_GROUPS.map((group) => (
          <section key={group.key} className="rounded-2xl border border-brand-200 bg-surface shadow-sm">
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold"
              onClick={() => toggleSection(group.key)}
              aria-expanded={openSections[group.key]}
            >
              <span>
                {group.label} ({grouped[group.key].length})
              </span>
              <span className="text-lg" aria-hidden>
                {openSections[group.key] ? "−" : "+"}
              </span>
            </button>
            {openSections[group.key] && (
              <div className="px-4 pb-4">
                <SavedEventsList
                  entries={grouped[group.key]}
                  onStatusChange={handleStatusChange}
                  openIds={openIds}
                  onToggleOpen={toggleEventOpen}
                />
              </div>
            )}
          </section>
        ))}
      </div>
    );

    return (
      <>
        {largeColumns}
        {mobileAccordions}
      </>
    );
  }, [
    grouped,
    hasSupabase,
    handleStatusChange,
    loading,
    openSections,
    ready,
    toggleSection,
    toggleEventOpen,
    hasAnyFiltered,
    isFiltering,
    navigate,
    user,
    openIds,
  ]);

  return (
    <div className="px-4 md:px-6 lg:px-8 py-6 md:-mt-[72px] md:pt-24 space-y-4 text-text mobile-aurora">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Library</p>
        <h1 className="text-2xl font-bold text-text">Saved events</h1>
      </div>
      {loadError && <p className="text-sm text-danger">{loadError}</p>}
      {actionError && <p className="text-sm text-danger">{actionError}</p>}
      <FiltersPanel
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search saved events"
        availableTags={tagOptions}
        activeTags={activeTags}
        onToggleTag={toggleTag}
        availableSources={sourceOptions}
        activeSources={activeSources}
        onToggleSource={toggleSource}
        availableLocations={locationOptions}
        activeLocations={activeLocations}
        onToggleLocation={toggleLocation}
      />
      {content}
    </div>
  );
};

function SavedStatusColumn({ label, description, entries, onStatusChange, openIds, onToggleOpen }) {
  return (
    <section className="rounded-3xl border border-brand-200 bg-surface shadow-sm p-4 space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-primary">{description}</p>
        <h3 className="mt-2 text-xl font-semibold text-text flex items-baseline gap-2">
          {label}
          <span className="text-xs font-semibold text-text-muted">({entries.length})</span>
        </h3>
      </div>
      <SavedEventsList
        entries={entries}
        onStatusChange={onStatusChange}
        openIds={openIds}
        onToggleOpen={onToggleOpen}
      />
    </section>
  );
}

function SavedEventsList({ entries, onStatusChange, openIds, onToggleOpen }) {
  if (!entries.length) {
    return <p className="text-sm text-text-muted">Nothing here yet.</p>;
  }
  return (
    <div className="space-y-4">
      {entries.map(({ event, status }) => (
        <div key={event.id} className="rounded-3xl">
          <EventListItem
            event={event}
            registered={event.registered ?? []}
            expanded={openIds.has(event.id)}
            onToggle={() => onToggleOpen(event.id)}
            preference={status}
            onSelectPreference={(nextStatus) => {
              if (!nextStatus) return;
              return onStatusChange(event.id, nextStatus);
            }}
            onRegister={(ev) => console.log("register", ev.id)}
            cardClassName="bg-white"
            mediaSize="md"
            selected={false}
          />
        </div>
      ))}
    </div>
  );
}

export default Saved;
