import React, { useEffect, useState } from "react";
import EventListItem from "./EventListItem";

/**
 * EventList
 * Props:
 *  - events: Array<{ id, ...; registered?: [] }>
 *  - accordion?: boolean (default true)
 *  - onRegister?: (event) => void
 */
const EventList = ({ events = [], accordion = true, onRegister = () => {} }) => {
  // accordion state
  const [openIds, setOpenIds] = useState(() => new Set());

  // API state
  const [state, setState] = useState({ loading: true, error: null, data: [] });
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

  // fetch events from backend
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setState(s => ({ ...s, loading: true, error: null }));
        const res = await fetch(`${API_BASE}/api/events`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (alive) {
          setState({
            loading: false,
            error: null,
            data: Array.isArray(data) ? data : [],
          });
        }
      } catch (e) {
        if (alive) setState({ loading: false, error: String(e), data: [] });
      }
    })();
    return () => { alive = false; };
  }, [API_BASE]);

  // Use API data if available, otherwise fallback to props
  const listToRender = state.data.length ? state.data : events;

  const toggle = (id) => {
    setOpenIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        if (accordion) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  // Status UI
  if (state.loading && !events.length) return <div className="p-4">Loading events…</div>;
  if (state.error && !listToRender.length) return <div className="p-4 text-red-600">Error: {state.error}</div>;
  if (!listToRender.length) return <div className="p-4">No events yet.</div>;

  return (
    <div className="space-y-3">
      {listToRender.map((event) => {
        const id = event.id ?? event.eventId;
        return (
          <EventListItem
            key={id}
            event={event}
            registered={event.registered ?? []}
            expanded={openIds.has(id)}
            onToggle={() => toggle(id)}
            onRegister={onRegister}
          />
        );
      })}
    </div>
  );
};

export default EventList;
