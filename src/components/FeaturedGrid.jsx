import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import EventCard from "./EventCard";

const PLACEHOLDER_VARIANTS = [
  {
    word: "CREATE",
    background: "color-mix(in oklch, var(--color-primary) 20%, transparent)",
    color: "color-mix(in oklch, var(--color-primary) 85%, black 15%)",
  },
  {
    word: "BUILD",
    background: "color-mix(in oklch, var(--color-accent) 22%, transparent)",
    color: "color-mix(in oklch, var(--color-accent) 80%, black 20%)",
  },
  {
    word: "SHARE",
    background: "color-mix(in oklch, var(--color-brand-complement) 18%, transparent)",
    color: "color-mix(in oklch, var(--color-brand-complement) 78%, black 22%)",
  },
  {
    word: "TECH",
    background: "color-mix(in oklch, var(--color-brand-300) 25%, transparent)",
    color: "color-mix(in oklch, var(--color-brand-600) 85%, black 15%)",
  },
];

export default function FeaturedGrid({ items = [], extraHeight = 280 }) {
  // mirror carousel height sync so cards stay even in the grid
  const heightsRef = useRef(new Map());
  const [heightSnapshot, setHeightSnapshot] = useState({});
  const [columnCount, setColumnCount] = useState(1);

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
        setHeightSnapshot(Object.fromEntries(map));
      }
    },
    []
  );

  useEffect(() => {
    if (!items.length) {
      heightsRef.current.clear();
      setHeightSnapshot({});
      return;
    }
    pruneStaleIds(items.slice(0, 12));
  }, [items, pruneStaleIds]);

  useEffect(() => {
    const computeColumns = () => {
      if (typeof window === "undefined") return 1;
      const width = window.innerWidth;
      if (width >= 1280) return 4;
      if (width >= 1024) return 3;
      if (width >= 768) return 2;
      return 1;
    };

    const update = () => setColumnCount(computeColumns());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const updateHeight = useCallback((id, h) => {
    const map = heightsRef.current;
    const prev = map.get(id) ?? 0;
    if (Math.abs(prev - h) <= 0.5) return;
    map.set(id, h);
    setHeightSnapshot(Object.fromEntries(map));
  }, []);

  const visibleItems = useMemo(() => items.slice(0, 12), [items]);

  const pairs = useMemo(() => {
    const list = [];
    for (let i = 0; i < visibleItems.length; i += 2) {
      list.push(visibleItems.slice(i, i + 2));
    }
    return list;
  }, [visibleItems]);

  const columns = useMemo(() => {
    const buckets = Array.from({ length: columnCount }, () => []);
    pairs.forEach((pair, pairIdx) => {
      const columnIdx = pairIdx % columnCount;
      const bucket = buckets[columnIdx];
      pair.forEach((item) => {
        bucket.push({ __kind: "event", key: `event-${item.id}`, data: item });
      });
      bucket.push({
        __kind: "placeholder",
        key: `placeholder-${columnIdx}-${pairIdx}`,
        order: pairIdx,
      });
    });
    return buckets;
  }, [pairs, columnCount]);

  const rowGap = 16;
  const columnGap = 20;
  const maxCardWidth = 300;
  const defaultCollapsedHeight = 220;
  const additionalHeight = extraHeight;

  const placeholderHeight = useMemo(() => {
    const values = Object.values(heightSnapshot);
    if (values.length) {
      return values.reduce((sum, value) => sum + value, 0) / values.length;
    }
    return defaultCollapsedHeight;
  }, [heightSnapshot, defaultCollapsedHeight]);

  const columnHeights = useMemo(() => {
    return columns.map((columnItems) => {
      const firstTwo = columnItems.slice(0, 2);
      const cardsHeight = firstTwo.reduce((sum, item) => {
        if (item.__kind === "placeholder") {
          return sum + placeholderHeight;
        }
        return sum + (heightSnapshot[item.data.id] ?? defaultCollapsedHeight);
      }, 0);
      const gaps = firstTwo.length > 1 ? rowGap : 0;
      return cardsHeight + gaps;
    });
  }, [columns, heightSnapshot, defaultCollapsedHeight, rowGap, placeholderHeight]);

  const visibleHeight =
    (columnHeights.length > 0
      ? Math.max(...columnHeights)
      : placeholderHeight * 2 + rowGap) + additionalHeight;

  if (!visibleItems.length) {
    return null;
  }

  return (
    <div
      className="featured-grid"
      style={{
        "--featured-row-gap": `${rowGap}px`,
        "--featured-column-gap": `${columnGap}px`,
        "--featured-visible-height": `${visibleHeight}px`,
        gridTemplateColumns: `repeat(${columnCount}, minmax(0, ${maxCardWidth}px))`,
      }}
    >
      {columns.map((columnItems, columnIdx) => (
        <div key={columnIdx} className="featured-grid__column">
          {columnItems.map((ev) => {
            if (ev.__kind === "placeholder") {
              const variant = PLACEHOLDER_VARIANTS[ev.order % PLACEHOLDER_VARIANTS.length];
              return (
                <div
                  key={ev.key}
                  className="featured-grid__placeholder"
                  style={{
                    height: `${placeholderHeight}px`,
                    background: variant.background,
                    color: variant.color,
                  }}
                  aria-hidden="true"
                >
                  <span className="placeholder-word">{variant.word}</span>
                </div>
              );
            }

            return (
              <EventCard
                key={ev.key}
                event={ev.data}
                registered={ev.data.registered}
                onBodyResize={(h) => updateHeight(ev.data.id, h)}
                density="default"
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
