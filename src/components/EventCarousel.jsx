// EventCarousel.jsx
import { useMemo, useRef, useState, useCallback } from "react";
import EventCard from "./EventCard";

const HIDE_SCROLLBAR =
  "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']";

export default function EventCarousel({ events }) {
  // --- equalize collapsed heights (unchanged) ---
  const heightsRef = useRef(new Map());
  const [maxBodyHeight, setMaxBodyHeight] = useState(0);

  const updateHeight = useCallback(
    (id, h) => {
      const map = heightsRef.current;
      const prev = map.get(id) || 0;
      if (Math.abs(prev - h) > 0.5) {
        map.set(id, h);
        const max = Math.max(...map.values());
        if (max !== maxBodyHeight) setMaxBodyHeight(max);
      }
    },
    [maxBodyHeight]
  );

  const cards = useMemo(
    () =>
      events.map((ev) => (
        <div
          key={ev.id}
          className="
            shrink-0 snap-start min-w-0
            w-[clamp(260px,28vw,360px)]
            md:w-[clamp(280px,24vw,400px)]
            first:ml-[20px] last:mr-4
            [scroll-margin-left:12px]     /* 👈 reveal the previous card when snapped */
          "
        >
          <EventCard
            event={ev}
            registered={ev.registered}
            onBodyResize={(h) => updateHeight(ev.id, h)}
            forcedBodyHeight={maxBodyHeight || undefined}
          />
        </div>

      )),
    [events, maxBodyHeight, updateHeight]
  );

  if (!events?.length) return null;

  return (
    <section className="relative w-full min-w-0 overflow-hidden" aria-roledescription="carousel">
      <div
        className={[
          "flex gap-4 overflow-x-auto snap-x snap-mandatory",
          "py-2 md:py-3 min-w-0 w-full",
          // small scroll padding so first/last don’t jam edges when centered
          "scroll-pl-4 md:scroll-pl-6 scroll-pr-4 md:scroll-pr-6",
          HIDE_SCROLLBAR,
        ].join(" ")}
        style={{ scrollPaddingLeft: 16, scrollPaddingRight: 16 }} // fallback
      >
        {cards}
      </div>
    </section>
  );
}
