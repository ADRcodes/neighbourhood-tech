import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import TagList from "../components/TagList";
import EventListItem from "../components/EventListItem";
import { useEventsContext } from "../lib/context/EventsProvider";
import { useEventPreferences } from "../lib/hooks/useEventPreferences";
import { normalizeEventId } from "../lib/utils/ids";

const DAY_MS = 1000 * 60 * 60 * 24;

const eventKey = (event) => event?.id ?? event?.eventId ?? event?.title;

function toStartOfDay(value) {
  const d = new Date(value);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isoDay(value) {
  return toStartOfDay(value).toISOString().slice(0, 10);
}

function addDays(date, amount) {
  return new Date(date.getTime() + amount * DAY_MS);
}

function startOfWeekMonday(date) {
  const d = toStartOfDay(date);
  const day = d.getDay(); // 0 = Sun
  const diff = (day + 6) % 7; // shift so Monday is start
  d.setDate(d.getDate() - diff);
  return d;
}

function formatDayLabel(date) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

function formatHeading(range) {
  if (!range?.start || !range?.end) return "Scroll the calendar";
  const start = new Date(range.start);
  const end = new Date(range.end);
  const fmt = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

export default function CalendarView() {
  const {
    filtered = [],
    chips,
    toggleChip,
    sourceFilters,
    toggleSource,
    searchTerm,
    setSearchTerm,
    tagOptions,
    sourceOptions,
    loading,
  } = useEventsContext();
  const navigate = useNavigate();
  const { statusByEvent, setPreference, AUTH_REQUIRED_ERROR } = useEventPreferences();

  const today = toStartOfDay(new Date());
  const todayIso = isoDay(today);

  const calendarScrollRef = useRef(null);
  const dayRefs = useRef(new Map());
  const visibleSetRef = useRef(new Set());
  const [visibleRange, setVisibleRange] = useState({ start: null, end: null });
  const [selectedEventKey, setSelectedEventKey] = useState(null);
  const visibleEventRefs = useRef(new Map());
  const [openIds, setOpenIds] = useState(new Set());

  const days = useMemo(() => {
    const start = startOfWeekMonday(addDays(today, -7));
    const totalDays = 210; // ~7 months of continuous scroll
    return Array.from({ length: totalDays }, (_, idx) => {
      const date = addDays(start, idx);
      const iso = isoDay(date);
      return {
        date,
        iso,
        label: formatDayLabel(date),
        isToday: iso === todayIso,
        isPast: date < today,
        month: date.toLocaleString(undefined, { month: "short" }),
      };
    });
  }, [todayIso, today]);

  const weeks = useMemo(() => {
    const chunked = [];
    for (let i = 0; i < days.length; i += 7) {
      chunked.push(days.slice(i, i + 7));
    }
    return chunked;
  }, [days]);

  const eventsByDay = useMemo(() => {
    const map = new Map();
    filtered.forEach((event) => {
      if (!event?.date) return;
      const iso = isoDay(event.date);
      if (!map.has(iso)) map.set(iso, []);
      map.get(iso).push(event);
    });
    return map;
  }, [filtered]);

  const visibleEvents = useMemo(() => {
    if (!visibleRange.start || !visibleRange.end) return [];
    const start = visibleRange.start;
    const end = visibleRange.end;
    return filtered
      .filter((event) => {
        if (!event?.date) return false;
        const iso = isoDay(event.date);
        return iso >= start && iso <= end;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filtered, visibleRange]);

  useEffect(() => {
    if (!selectedEventKey) return;
    const node = visibleEventRefs.current.get(selectedEventKey);
    if (node && typeof node.scrollIntoView === "function") {
      node.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedEventKey, visibleEvents.length]);

  useEffect(() => {
    if (!calendarScrollRef.current) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        let changed = false;
        entries.forEach((entry) => {
          const iso = entry.target.dataset?.date;
          if (!iso) return;
          if (entry.isIntersecting) {
            if (!visibleSetRef.current.has(iso)) {
              visibleSetRef.current.add(iso);
              changed = true;
            }
          } else if (visibleSetRef.current.has(iso)) {
            visibleSetRef.current.delete(iso);
            changed = true;
          }
        });
        if (changed) {
          const sorted = Array.from(visibleSetRef.current).sort();
          setVisibleRange(
            sorted.length
              ? { start: sorted[0], end: sorted[sorted.length - 1] }
              : { start: null, end: null }
          );
        }
      },
      {
        root: calendarScrollRef.current,
        threshold: 0,
        rootMargin: "15% 0px 15% 0px",
      }
    );

    dayRefs.current.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, [days.length]);

  const registerDayRef = (iso) => (node) => {
    if (!node) {
      dayRefs.current.delete(iso);
      return;
    }
    dayRefs.current.set(iso, node);
  };

  const handleDayEventClick = (eventObj) => {
    const key = eventKey(eventObj);
    setSelectedEventKey(key);
    setOpenIds(new Set([key]));
  };

  const toggleVisibleEvent = (key) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handlePreference = async (eventId, normalizedId, status) => {
    try {
      await setPreference(eventId, status, normalizedId);
    } catch (error) {
      if (error?.code === AUTH_REQUIRED_ERROR) {
        navigate("/auth");
      } else {
        console.error("Failed to set preference", error);
      }
    }
  };

  return (
    <div className="px-4 md:px-6 lg:px-8 py-6 text-text">
      <header className="mb-6 space-y-4">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Calendar</p>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">Continuous event calendar</h1>
            <p className="text-sm text-text-muted">
              Scroll through upcoming days; visible events stay in sync on the right.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-brand-200 bg-surface shadow-sm p-4 space-y-4">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-60">⌕</span>
            <input
              type="search"
              placeholder="Search events"
              className="w-full pl-8 pr-3 py-2 rounded-xl text-sm bg-white border border-brand-100 focus:ring-2 focus:ring-focus outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <TagList
              title="Filter by source"
              items={sourceOptions}
              activeKeys={sourceFilters}
              onToggle={toggleSource}
              emptyLabel="Sources will appear once events load."
              className="bg-white rounded-2xl p-3"
            />
            <TagList
              title="Filter by tag"
              items={tagOptions}
              activeKeys={chips}
              onToggle={toggleChip}
              emptyLabel="Tags will appear once events load."
              className="bg-white rounded-2xl p-3"
            />
          </div>
        </div>
      </header>

      <div className="grid gap-6 items-start lg:grid-cols-[2fr_1fr]">
        <section className="rounded-3xl border border-brand-200 bg-surface shadow-sm p-4 lg:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-sm font-semibold text-text">Continuous calendar</p>
              <p className="text-xs text-text-muted">{formatHeading(visibleRange)}</p>
            </div>
            <div className="inline-flex items-center gap-2 text-xs text-text-muted">
              <span className="h-2 w-2 rounded-full bg-primary" aria-hidden /> Today
              <span className="h-2 w-2 rounded-full bg-primary/15 border border-brand-200" aria-hidden /> Upcoming
            </div>
          </div>

          <div
            ref={calendarScrollRef}
            className="calendar-scroll rounded-2xl border border-brand-200/80 bg-white max-h-[75vh] overflow-y-auto shadow-inner"
          >
            <div className="grid grid-cols-7 gap-px bg-brand-100 text-[11px] font-semibold text-text-muted sticky top-0 z-10">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => (
                <div key={label} className="bg-white px-3 py-2 text-center">
                  {label}
                </div>
              ))}
            </div>
            <div className="divide-y divide-brand-100">
              {weeks.map((week, idx) => (
                <div key={week[0]?.iso || idx} className="grid grid-cols-7 gap-px bg-brand-100">
                  {week.map((day) => {
                    const dayEvents = eventsByDay.get(day.iso) || [];
                    return (
                      <div
                        key={day.iso}
                        data-date={day.iso}
                        ref={registerDayRef(day.iso)}
                        className={`calendar-day ${day.isToday ? "calendar-day--today" : ""} ${day.isPast ? "opacity-75" : ""
                          }`}
                      >
                        <div className="flex items-center justify-between px-1 text-xs font-semibold">
                          <span className="text-text">{day.label}</span>
                          {dayEvents.length > 0 && (
                            <span className="text-[11px] px-1 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                              {dayEvents.length}
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.map((event) => (
                            <button
                              key={eventKey(event)}
                              type="button"
                              onClick={() => handleDayEventClick(event)}
                              className={`w-full text-left text-xs rounded-lg px-1 py-1 transition line-clamp-2 leading-snug ${selectedEventKey === eventKey(event)
                                ? "bg-primary/15 text-primary font-semibold"
                                : "text-text-muted hover:bg-primary/8"
                                }`}
                            >
                              {event.title}
                            </button>
                          ))}
                          {dayEvents.length === 0 && (
                            <span className="text-[11px] text-text-muted/70">No events</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-3 lg:sticky lg:top-24">
          <div className="rounded-3xl border border-brand-200 bg-surface shadow-sm py-4 space-y-2">
            <div className="flex items-center justify-between gap-2 px-2">
              <div>
                <p className="text-sm font-semibold text-text">Events in view</p>
                <p className="text-xs text-text-muted">
                  {visibleEvents.length ? `${visibleEvents.length} events` : "Scroll the calendar to see events"}
                </p>
              </div>
              <div className="rounded-full bg-primary/10 text-primary text-xs font-semibold px-2 py-1 border border-primary/20">
                Live sync
              </div>
            </div>
            <div className="space-y-3 max-h-[72vh] overflow-y-auto p-2">
              {loading ? (
                <p className="text-xs text-text-muted">Loading events…</p>
              ) : visibleEvents.length === 0 ? (
                <p className="text-xs text-text-muted">No events in this range.</p>
              ) : (
                visibleEvents.map((event) => {
                  const key = eventKey(event);
                  const normalizedId = normalizeEventId(event?.id ?? event?.eventId);
                  const preference = normalizedId ? statusByEvent?.[normalizedId] || null : null;
                  return (
                    <div
                      key={key}
                      ref={(node) => {
                        if (!node) visibleEventRefs.current.delete(key);
                        else visibleEventRefs.current.set(key, node);
                      }}
                      className="rounded-3xl"
                    >
                      <EventListItem
                        event={event}
                        registered={event.registered ?? []}
                        expanded={openIds.has(key)}
                        onToggle={() => toggleVisibleEvent(key)}
                        preference={preference}
                        onSelectPreference={(status) => handlePreference(event?.id ?? event?.eventId, normalizedId, status)}
                        onRegister={(ev) => console.log("register", ev.id)}
                        cardClassName="bg-white"
                        mediaSize="sm"
                        selected={selectedEventKey === key}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
