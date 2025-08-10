import { useState } from "react";
import EventListItem from "./EventListItem";

/**
 * EventList
 * Props:
 *  - events: Array<{ id, ...; registered?: [] }>
 *  - accordion?: boolean (default true)
 *  - onRegister?: (event) => void
 */
const EventList = ({ events = [], accordion = true, onRegister = () => { } }) => {
  const [openIds, setOpenIds] = useState(() => new Set());

  const toggle = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (accordion) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <EventListItem
          key={event.id}
          event={event}
          registered={event.registered ?? []}
          expanded={openIds.has(event.id)}
          onToggle={() => toggle(event.id)}
          onRegister={onRegister}
        />
      ))}
    </div>
  );
};

export default EventList;
