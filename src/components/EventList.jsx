// src/components/EventList.jsx
import { useState } from "react";
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
  onRegister = () => {},
  eventPreferences = {},
  onSelectPreference = () => {},
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

  if (!events.length) return <div className="p-4 text-sm">No events yet.</div>;

  return (
    <div className="p-2 md:p-3 lg:p-4 space-y-3">
      {events.map((event) => {
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
          />
        );
      })}
    </div>
  );
};

export default EventList;
