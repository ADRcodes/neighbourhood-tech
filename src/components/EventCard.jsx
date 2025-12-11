// EventCard.jsx
import { memo, useEffect, useMemo, useRef, useState, useLayoutEffect } from "react";
import { formatSourceName, formatPriceDisplay } from "../lib/utils/events";

function EventCardComponent({
  event,
  registered = [],
  onBodyResize,           // (h:number) => void
  forcedBodyHeight,       // number | undefined
  density = "default",    // "default" | "compact"
  descriptionClampLines = null,
}) {
  const [expanded, setExpanded] = useState(false);
  const toggle = () => setExpanded((e) => !e);

  const compact = density === "compact";

  // --- SUMMARY (measured & equalized when collapsed) ---
  const bodyRef = useRef(null);

  // Measure only when collapsed (so expansion never affects equalized height)
  const lastReportedSummaryHeight = useRef(0);

  useLayoutEffect(() => {
    if (!bodyRef.current || expanded) return;
    const el = bodyRef.current;
    const report = () => {
      const next = Math.round(el.scrollHeight);
      if (next !== lastReportedSummaryHeight.current) {
        lastReportedSummaryHeight.current = next;
        onBodyResize?.(next);
      }
    };
    report();
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(report);
    });
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

  useLayoutEffect(() => {
    if (!detailsRef.current) return;
    const el = detailsRef.current;
    const measure = () => {
      const next = el.scrollHeight;
      setDetailsMax((prev) => (prev === next ? prev : next));
      if (expanded) {
        setDetailsHeight((prev) => (prev === next ? prev : next));
      }
    };
    measure();
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(measure);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [expanded, event.description, event.company, event?.venue?.address, event?.tags?.length]);

  useLayoutEffect(() => {
    const el = detailsRef.current;
    if (!el) return;
    let rafId;
    if (expanded) {
      const target = el.scrollHeight;
      rafId = requestAnimationFrame(() => {
        setDetailsHeight((prev) => (prev === target ? prev : target));
      });
    } else {
      setDetailsHeight((prev) => (prev === 0 ? prev : 0));
    }
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [expanded, detailsMax]);

  // Date/time
  const dt = useMemo(() => (event?.date ? new Date(event.date) : null), [event?.date]);
  const dateStr = useMemo(() => {
    if (!dt || Number.isNaN(dt.getTime())) return "Date TBA";
    return dt.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }, [dt]);
  const timeStr = useMemo(() => {
    if (!dt || Number.isNaN(dt.getTime())) return "";
    return dt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }, [dt]);
  const priceValue = event?.price;
  const priceLabel = formatPriceDisplay(priceValue);
  const visibleTags = useMemo(
    () => (Array.isArray(event?.tags) ? event.tags.slice(0, 8) : []),
    [event?.tags]
  );
  const venueName = event?.venue?.name || "Venue TBA";
  const venueAddress = event?.venue?.address || "";
  const organizerName = event?.organizer?.name?.trim?.() ? event.organizer.name : "";
  const descriptionText = event?.description || "More details coming soon.";
  const formattedSource = event?.source ? formatSourceName(event.source) : "";
  const descriptionClampStyle = useMemo(() => {
    if (!descriptionClampLines || descriptionClampLines <= 0) return undefined;
    return {
      display: "-webkit-box",
      WebkitBoxOrient: "vertical",
      WebkitLineClamp: descriptionClampLines,
      overflow: "hidden",
    };
  }, [descriptionClampLines]);

  return (
    <div
      role="button"
      aria-expanded={expanded}
      tabIndex={0}
      onClick={toggle}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggle()}
      className={`relative flex flex-col rounded-xl shadow-md bg-white cursor-pointer select-none transition-shadow duration-200 hover:shadow-lg ${compact ? "p-2" : "p-3"
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
        className={`flex flex-col ${compact ? "gap-1.5" : "gap-2"} ${!expanded && forcedBodyHeight && !compact ? "overflow-hidden" : ""
          }`}
      >
        <img
          ref={imgRef}
          className={`w-full object-cover rounded-lg ${compact ? "aspect-[5/3]" : "aspect-[4/2]"
            }`}
          src={event.image}
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.src = `https://picsum.photos/seed/${event.id || "event-card"}/600/400`;
          }}
          loading="lazy"
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
            <p className={`${compact ? "line-clamp-1" : "line-clamp-2"} min-w-0`}>{venueName}</p>
          </div>
          <div className="flex gap-1 items-center">
            <p>🗓️</p>
            <div className="w-fit">
              <p>{dateStr}</p>
              {timeStr && <p className="w-max">{timeStr}</p>}
            </div>
          </div>
        </div>

        {/* Price row pinned to bottom of summary */}
        {priceLabel && (
          <div className="mt-auto flex items-center justify-between">
            <p className={compact ? "text-xs font-semibold" : "text-base"}>
              {priceLabel}
            </p>
          </div>
        )}
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
          {visibleTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {visibleTags.map((tag) => (
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
            {event.company && <p className="text-gray-500">{event.company}</p>}
            {venueAddress && <p className="text-gray-500">{venueAddress}</p>}
            {organizerName && (
              <p className="text-gray-500">Hosted by {organizerName}</p>
            )}
            {formattedSource && (
              <p className="text-text-muted">Source: <span className="text-text">{formattedSource}</span></p>
            )}
          </div>

          <p className="my-2" style={descriptionClampStyle}>{descriptionText}</p>

          {event.url && (
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-onprimary py-1.5 px-3 mb-2 rounded-full self-end text-sm font-semibold shadow-[0_10px_20px_-14px_rgba(220,73,102,0.8)] hover:shadow-[0_14px_24px_-12px_rgba(220,73,102,0.95)]"
              onClick={(e) => e.stopPropagation()}
            >
              Register
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(EventCardComponent);
