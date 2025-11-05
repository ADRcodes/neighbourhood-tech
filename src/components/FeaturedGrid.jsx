import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import EventCard from "./EventCard";

export default function FeaturedGrid({ items = [] }) {
  // mirror carousel height sync so cards stay even in the grid
  const heightsRef = useRef(new Map());
  const [maxBodyHeight, setMaxBodyHeight] = useState(0);

  const pruneStaleIds = useCallback(
    (nextItems) => {
      const ids = new Set(nextItems.map((item) => item.id));
      const map = heightsRef.current;
      let changed = false;
      map.forEach((_, key) => {
        if (!ids.has(key)) {
          map.delete(key);
          changed = true;
        }
      });
      if (changed) {
        const values = [...map.values()];
        const nextMax = values.length ? Math.max(...values) : 0;
        setMaxBodyHeight(nextMax);
      }
    },
    []
  );

  useEffect(() => {
    if (!items.length) {
      heightsRef.current.clear();
      setMaxBodyHeight(0);
      return;
    }
    pruneStaleIds(items);
  }, [items, pruneStaleIds]);

  const updateHeight = useCallback((id, h) => {
    const map = heightsRef.current;
    const prev = map.get(id) ?? 0;
    if (Math.abs(prev - h) <= 0.5) return;
    map.set(id, h);
    setMaxBodyHeight((prevMax) => {
      const values = [...map.values()];
      const nextMax = values.length ? Math.max(...values) : 0;
      return Math.abs(nextMax - prevMax) > 0.5 ? nextMax : prevMax;
    });
  }, []);

  const cards = useMemo(
    () =>
      items.map((ev) => (
        <div
          key={ev.id}
          className="min-w-0"
        >
          <EventCard
            event={ev}
            registered={ev.registered}
            onBodyResize={(h) => updateHeight(ev.id, h)}
            forcedBodyHeight={maxBodyHeight || undefined}
          />
        </div>
      )),
    [items, maxBodyHeight, updateHeight]
  );

  if (!cards.length) {
    return null;
  }

  return (
    <div
      className="
        grid gap-5
        grid-cols-1
        sm:[grid-template-columns:repeat(auto-fit,minmax(320px,360px))]
        justify-center
      "
    >
      {cards}
    </div>
  );
}
