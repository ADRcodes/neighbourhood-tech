// EventCard.jsx
import { useEffect, useRef, useState, useMemo } from "react";

export default function EventCard({
  event,
  registered = [],
  onBodyResize,           // (h:number) => void
  forcedBodyHeight,       // number | undefined
  density = "default",    // "default" | "compact"
}) {
  const [expanded, setExpanded] = useState(false);
  const toggle = () => setExpanded((e) => !e);

  const compact = density === "compact";

  // --- SUMMARY (measured & equalized when collapsed) ---
  const bodyRef = useRef(null);

  // Measure only when collapsed (so expansion never affects equalized height)
  useEffect(() => {
    if (!bodyRef.current || expanded) return;
    const el = bodyRef.current;
    const report = () => onBodyResize?.(el.scrollHeight);
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [
    expanded,                    // re-run when returning to collapsed
    onBodyResize,
    event.title, event.image,
    event?.venue?.name,
    event.price, registered.length,
  ]);

  // Image load can change summary height (report only if collapsed)
  const imgRef = useRef(null);
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const onLoad = () => {
      if (bodyRef.current && !expanded) onBodyResize?.(bodyRef.current.scrollHeight);
    };
    img.addEventListener("load", onLoad);
    return () => img.removeEventListener("load", onLoad);
  }, [expanded, onBodyResize, event.image]);

  // --- DETAILS (expandable) ---
  const detailsRef = useRef(null);
  const [detailsMax, setDetailsMax] = useState(0);
  const [detailsHeight, setDetailsHeight] = useState(0);

  useEffect(() => {
    if (!detailsRef.current) return;
    const el = detailsRef.current;
    const measure = () => {
      const next = el.scrollHeight;
      setDetailsMax(next);
      if (expanded) {
        setDetailsHeight(next);
      }
    };
    measure();
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(measure);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [expanded, event.description, event.company, event?.venue?.address, event?.tags?.length]);

  useEffect(() => {
    const el = detailsRef.current;
    if (!el) return;
    if (expanded) {
      const target = el.scrollHeight;
      requestAnimationFrame(() => setDetailsHeight(target));
    } else {
      setDetailsHeight(0);
    }
  }, [expanded, detailsMax]);

  // Date/time
  const dt = useMemo(() => new Date(event.date), [event.date]);
  const dateStr = useMemo(
    () => dt.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    [dt]
  );
  const timeStr = useMemo(
    () => dt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
    [dt]
  );
  const isFree = Number(event.price) === 0 || Number.isNaN(Number(event.price));

  return (
    <div
      role="button"
      aria-expanded={expanded}
      tabIndex={0}
      onClick={toggle}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggle()}
      className={`relative flex flex-col rounded-lg shadow-md bg-white cursor-pointer select-none transition-shadow duration-200 hover:shadow-lg ${
        compact ? "p-2" : "p-3"
      }`}
    >
      {/* SUMMARY: always clamped; height forced only when collapsed */}
      <div
        ref={bodyRef}
        data-card-body
        style={
          !expanded && forcedBodyHeight && !compact
            ? { height: forcedBodyHeight }
            : undefined
        }
        className={`flex flex-col ${compact ? "gap-1.5" : "gap-2"} ${
          !expanded && forcedBodyHeight && !compact ? "overflow-hidden" : ""
        }`}
      >
        <img
          ref={imgRef}
          className={`w-full object-cover rounded-lg ${
            compact ? "aspect-[5/3]" : "aspect-[4/2]"
          }`}
          src={event.image}
          alt={event.title || "Event"}
        />

        {/* Title: clamp to 2 lines in summary */}
        <h2 className={`${compact ? "text-base" : "text-xl"} font-bold leading-tight ${compact ? "line-clamp-1" : "line-clamp-2"}`}>
          {event.title}
        </h2>

        <div className={`flex justify-between ${compact ? "text-xs" : "text-sm"} gap-2`}>
          {/* Location: clamp to 2 lines in summary */}
          <div className="flex gap-1 items-center min-w-0">
            <p>📍</p>
            <p className={`${compact ? "line-clamp-1" : "line-clamp-2"} min-w-0`}>{event?.venue?.name}</p>
          </div>
          <div className="flex gap-1 items-center">
            <p>🗓️</p>
            <div className="w-fit">
              <p>{dateStr}</p>
              <p className="w-max">{timeStr}</p>
            </div>
          </div>
        </div>

        {/* Price row pinned to bottom of summary */}
        <div className="mt-auto flex items-center justify-between">
          <p className={compact ? "text-xs font-semibold" : "text-base"}>
            {isFree ? "Free" : `$${event.price}`}
            {!isFree && <span className={`${compact ? "text-[11px]" : "text-sm"} text-gray-500`}>/ticket</span>}
          </p>
          {!compact && (
            <div className="ml-2">
              {registered.slice(0, 5).map((user) => (
                <img
                  key={user.id}
                  src={user.avatar}
                  alt={user.name}
                  className="inline-block w-6 h-6 -ml-[10px] border-2 border-white rounded-full"
                />
              ))}
              {registered.length > 5 && (
                <span className="align-middle text-sm inline-flex items-center justify-center w-6 h-6 -ml-[10px] border-2 border-white bg-green-500 text-white rounded-full">
                  {registered.length - 5}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* DETAILS: show full title/location here so summary can stay clamped */}
      <div
        className="overflow-hidden transition-[max-height] duration-500 ease-in-out"
        style={{ maxHeight: detailsHeight, willChange: "max-height" }}
        aria-hidden={!expanded}
      >
        <div
          ref={detailsRef}
          className={`mt-2 flex flex-col gap-2 transition-all duration-500 ${expanded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
            }`}
        >
          {/* Full title & location (unclamped) */}

          {/* Tags */}
          {Array.isArray(event.tags) && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Meta & description */}
          <div className="text-sm text-gray-600 space-y-1">
            <p className="text-gray-500">{event.company}</p>
            <p className="text-gray-500">{event?.venue?.address}</p>
            <p className="text-gray-500">
              Hosted by {event?.organizer?.name ?? "Organizer"}
            </p>
          </div>

          <p className="my-2">{event.description}</p>

          <button
            className="bg-blue-500 text-white py-1 px-2 mb-2 rounded self-end"
            onClick={(e) => {
              e.stopPropagation();
              // handle register action
            }}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}
