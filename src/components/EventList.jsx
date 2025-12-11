// src/components/EventList.jsx
import { useMemo, useState } from "react";
import EventListItem from "./EventListItem";
import { normalizeEventId } from "../lib/utils/ids";

/**
 * EventList (pure render + accordion; data already fetched/normalized upstream)
 * Props:
 *  - events: Array<Event>
 *  - accordion?: boolean (default true)
 *  - onRegister?: (event) => void
 */
const EventList = ({
  events = [],
  accordion = true,
  onRegister = () => { },
  eventPreferences = {},
  onSelectPreference = () => { },
  cardClassName = "",
  headingTone = "default",
}) => {
  const [openIds, setOpenIds] = useState(() => new Set());

  const toggle = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        if (accordion) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  const displayItems = useMemo(() => buildDisplayItems(events), [events]);

  if (!displayItems.length) return <div className="p-4 text-sm">No events yet.</div>;

  return (
    <div className="px-2 sm:px-4 md:px-0 space-y-3">
      {displayItems.map((item, index) => {
        if (item.type === "heading") {
          return (
            <ListHeading
              key={item.key || `heading-${index}`}
              label={item.label}
              tone={headingTone}
            />
          );
        }
        const event = item.event;
        const id = event.id ?? event.eventId;
        const normalizedId = normalizeEventId(id);
        const preference = normalizedId ? eventPreferences?.[normalizedId] || null : null;
        return (
          <EventListItem
            key={id}
            event={event}
            registered={event.registered ?? []}
            expanded={openIds.has(id)}
            onToggle={() => toggle(id)}
            onRegister={onRegister}
            preference={preference}
            onSelectPreference={(status) => onSelectPreference(id, normalizedId, status)}
            cardClassName={cardClassName}
          />
        );
      })}
    </div>
  );
};

const ListHeading = ({ label, tone = "default" }) => {
  const toneClass =
    tone === "hero"
      ? "text-onprimary drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
      : "text-text-muted";
  return (
    <div className={`px-3 md:px-4 pt-4 text-xs font-semibold uppercase tracking-[0.35em] ${toneClass}`}>
      {label}
    </div>
  );
};

function buildDisplayItems(events) {
  if (!Array.isArray(events) || events.length === 0) return [];

  const items = [];
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const { start: weekendStart, end: weekendEnd } = upcomingWeekendRange(today);

  const markers = {
    today: false,
    tomorrow: false,
    weekend: false,
  };
  const seenMonths = new Set();

  events.forEach((event) => {
    const eventDate = event?.date ? new Date(event.date) : null;
    let dayStart = null;
    if (eventDate && !Number.isNaN(eventDate.getTime())) {
      dayStart = startOfDay(eventDate);
      const monthKey = `${dayStart.getFullYear()}-${dayStart.getMonth()}`;
      if (!seenMonths.has(monthKey)) {
        const now = new Date();
        const isCurrentMonth = dayStart.getFullYear() === now.getFullYear() && dayStart.getMonth() === now.getMonth();
        if (!isCurrentMonth || items.length > 0) {
          items.push({ type: "heading", key: `month-${monthKey}`, label: formatMonthLabel(dayStart, isCurrentMonth) });
        }
        seenMonths.add(monthKey);
      }

      if (!markers.today && isSameDay(dayStart, today)) {
        items.push({ type: "heading", key: "today", label: "Today" });
        markers.today = true;
      } else if (!markers.tomorrow && isSameDay(dayStart, tomorrow)) {
        items.push({ type: "heading", key: "tomorrow", label: "Tomorrow" });
        markers.tomorrow = true;
      } else if (!markers.weekend && isWithinWeekend(dayStart, today, weekendStart, weekendEnd)) {
        items.push({ type: "heading", key: "weekend", label: "This Weekend" });
        markers.weekend = true;
      }
    }

    items.push({ type: "event", event });
  });

  return items;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, delta) {
  const d = new Date(date);
  d.setDate(d.getDate() + delta);
  return d;
}

function upcomingWeekendRange(today) {
  const day = today.getDay();
  const offset = (6 - day + 7) % 7; // Saturday=6
  const saturday = addDays(today, offset);
  const sunday = addDays(saturday, 1);
  return { start: saturday, end: sunday };
}

function isSameDay(a, b) {
  return a.getTime() === b.getTime();
}

function isWithinWeekend(dayStart, today, weekendStart, weekendEnd) {
  if (dayStart < today) return false;
  return dayStart >= weekendStart && dayStart <= weekendEnd;
}

function formatMonthLabel(date, isCurrentMonth) {
  const opts = { month: "long" };
  const now = new Date();
  if (!isCurrentMonth && date.getFullYear() !== now.getFullYear()) {
    opts.year = "numeric";
  }
  return date.toLocaleDateString(undefined, opts);
}

export default EventList;
