import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSavedEvents } from "../lib/context/SavedEventsProvider";
import TagList from "../components/TagList";
import { buildSourceOptions, buildTagOptions, filterEvents } from "../lib/utils/events";

const STATUS_GROUPS = [
  { key: "going", label: "Going" },
  { key: "interested", label: "Interested" },
  { key: "not_interested", label: "Not interested" },
];

const STATUS_DESCRIPTIONS = {
  going: "Locked in plans",
  interested: "Keeping an eye on",
  not_interested: "Passing on these",
};

const STATUS_OPTIONS = [
  { value: "going", label: "Going" },
  { value: "interested", label: "Interested" },
  { value: "not_interested", label: "Not interested" },
];

const Saved = () => {
  const navigate = useNavigate();
  const { entries, loading, error: loadError, updateStatus, user, ready, hasSupabase } = useSavedEvents();
  const [pending, setPending] = useState(null);
  const [actionError, setActionError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTags, setActiveTags] = useState([]);
  const [activeSources, setActiveSources] = useState([]);
  const [openSections, setOpenSections] = useState({
    going: false,
    interested: false,
    not_interested: false,
  });

  const handleStatusChange = useCallback(async (eventId, status) => {
    if (!user) return;
    setPending(`${eventId}:${status}`);
    setActionError("");
    try {
      await updateStatus(eventId, status);
    } catch (err) {
      console.error("Failed to update", err);
      setActionError(err.message || "Unable to update status");
    } finally {
      setPending(null);
    }
  }, [updateStatus, user]);

  const savedEvents = useMemo(() => entries.map((entry) => entry.event), [entries]);

  const tagOptions = useMemo(() => buildTagOptions(savedEvents), [savedEvents]);
  const sourceOptions = useMemo(() => buildSourceOptions(savedEvents), [savedEvents]);

  const filteredEntries = useMemo(() => {
    if (!entries.length) return [];
    if (!activeTags.length && !activeSources.length && !searchTerm.trim()) {
      return entries;
    }
    const decorated = entries.map((entry) => ({ ...entry.event }));
    const filteredEvents = filterEvents(decorated, {
      tags: activeTags,
      sources: activeSources,
      search: searchTerm,
    });
    const allowedIds = new Set(filteredEvents.map((event) => event.id));
    return entries.filter((entry) => allowedIds.has(entry.event.id));
  }, [entries, activeTags, activeSources, searchTerm]);

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
  const isFiltering = activeTags.length > 0 || activeSources.length > 0 || Boolean(searchTerm.trim());
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
  const toggleSection = useCallback((key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
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
      <div className="hidden lg:grid lg:grid-cols-3 gap-6">
        {STATUS_GROUPS.map((group) => (
            <SavedStatusColumn
              key={group.key}
              label={group.label}
              description={STATUS_DESCRIPTIONS[group.key]}
              entries={grouped[group.key]}
              pending={pending}
              onStatusChange={handleStatusChange}
            />
          ))}
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
                  pending={pending}
                  onStatusChange={handleStatusChange}
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
    pending,
    ready,
    toggleSection,
    hasAnyFiltered,
    isFiltering,
    navigate,
    user,
  ]);

  return (
    <div className="px-4 py-6 space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Library</p>
        <h1 className="text-2xl font-bold text-text">Saved events</h1>
      </div>
      {loadError && <p className="text-sm text-danger">{loadError}</p>}
      {actionError && <p className="text-sm text-danger">{actionError}</p>}
      <FilterPanel
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        availableTags={tagOptions}
        activeTags={activeTags}
        onToggleTag={toggleTag}
        availableSources={sourceOptions}
        activeSources={activeSources}
        onToggleSource={toggleSource}
      />
      {content}
    </div>
  );
};

function FilterPanel({
  searchTerm,
  onSearchChange,
  availableTags,
  activeTags,
  onToggleTag,
  availableSources,
  activeSources,
  onToggleSource,
}) {
  return (
    <section className="rounded-3xl border border-brand-200 bg-surface shadow-sm p-4 space-y-4">
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-50">⌕</span>
        <input
          type="search"
          placeholder="Search saved events"
          className="w-full rounded-xl border border-brand-200/80 bg-white py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="rounded-2xl border border-brand-200 bg-surface/70 p-3">
        <TagList
          title="Filter by source"
          items={availableSources}
          activeKeys={activeSources}
          onToggle={onToggleSource}
          emptyLabel="Sources appear once events load."
          className="bg-white rounded-xl p-3"
        />
      </div>
      <div className="rounded-2xl border border-brand-200 bg-surface/70 p-3">
        <TagList
          title="Filter by tag"
          items={availableTags}
          activeKeys={activeTags}
          onToggle={onToggleTag}
          emptyLabel="Tags appear once events load."
          className="bg-white rounded-xl p-3"
        />
      </div>
    </section>
  );
}

function SavedStatusColumn({ label, description, entries, pending, onStatusChange }) {
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
        pending={pending}
        onStatusChange={onStatusChange}
      />
    </section>
  );
}

function SavedEventsList({ entries, pending, onStatusChange }) {
  if (!entries.length) {
    return <p className="text-sm text-text-muted">Nothing here yet.</p>;
  }
  return (
    <div className="space-y-4">
      {entries.map(({ event, status }) => (
        <SavedEventCard
          key={event.id}
          event={event}
          status={status}
          pending={pending}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}

function SavedEventCard({ event, status, pending, onStatusChange }) {
  const formattedDate = event.date
    ? new Date(event.date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    : "Date TBA";
  const imageSrc = event.image || `https://picsum.photos/seed/${event.id || "saved"}/320/200`;
  return (
    <article className="rounded-2xl border border-brand-200/70 bg-white p-4 shadow-[0_10px_30px_-26px_rgba(16,24,40,0.65)]">
      <div className="flex gap-4">
        <img
          src={imageSrc}
          alt={event.title || "Event"}
          className="w-28 h-24 rounded-xl object-cover shadow-[0_12px_28px_-20px_rgba(16,24,40,0.55)]"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = `https://picsum.photos/seed/${event.id || "saved-fallback"}/320/200`;
          }}
        />
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-xs text-text-muted">{formattedDate}</p>
          <h4 className="text-lg font-semibold text-text leading-tight line-clamp-2">{event.title}</h4>
          {event.venue?.name && (
            <p className="text-sm text-text-muted">📍 {event.venue.name}</p>
          )}
        </div>
        {event.url && (
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start rounded-full border border-brand-200 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/10"
          >
            Visit
          </a>
        )}
      </div>
      {event.description && (
        <p className="mt-2 text-sm text-text-muted line-clamp-2">{event.description}</p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onStatusChange(event.id, opt.value)}
            disabled={pending === `${event.id}:${opt.value}`}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              status === opt.value
                ? "bg-primary text-onprimary border-primary"
                : "bg-surface text-text border-brand-200/80 hover:bg-primary/10"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </article>
  );
}

export default Saved;
