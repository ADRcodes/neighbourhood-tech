import React, { useEffect, useMemo, useRef, useState } from "react";

const AvatarStack = ({ users = [] }) => (
  <div className="ml-2 shrink-0">
    {users.slice(0, 5).map((u) => (
      <img
        key={u.id}
        src={u.avatar}
        alt={u.name}
        className="inline-block w-6 h-6 -ml-[10px] border-2 border-white rounded-full"
      />
    ))}
    {users.length > 5 && (
      <span className="align-middle text-[11px] inline-flex items-center justify-center w-6 h-6 -ml-[10px] border-2 border-white bg-success/80 text-onprimary rounded-full">
        {users.length - 5}
      </span>
    )}
  </div>
);

const PriceTag = ({ price }) => {
  const isFree = Number(price) === 0 || Number.isNaN(Number(price));
  return (
    <p className="text-sm md:text-base font-medium text-text">
      {isFree ? "Free" : `$${Number(price).toFixed(2)}`}
      {!isFree && <span className="text-xs md:text-sm text-text-muted"> /Person</span>}
    </p>
  );
};

const MetaRow = ({ venue, date, expanded = false }) => {
  const dt = useMemo(() => new Date(date), [date]);
  const dateStr = useMemo(
    () => dt.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    [dt]
  );
  const timeStr = useMemo(
    () => dt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
    [dt]
  );

  return (
    <div className="flex items-start justify-between gap-2 md:gap-4">
      {/* location: 2 lines when collapsed, full when expanded */}
      <p className="text-xs md:text-sm text-text-muted flex-1 min-w-0 leading-snug">
        <span
          className={`${expanded ? "" : "line-clamp-2"} break-words align-top`}
          title={venue?.name}
        >
          📍 {venue?.name || "TBA"}
        </span>
      </p>

      {/* date/time */}
      <div className="flex flex-col items-end shrink-0 text-xs md:text-sm text-text">
        <span className="font-semibold text-primary">{dateStr}</span>
        <span>{timeStr}</span>
      </div>
    </div>
  );
};

const TagPills = ({ tags }) =>
  Array.isArray(tags) && tags.length > 0 ? (
    <div className="flex flex-wrap h-min items-start gap-1">
      {tags.map((tag) => (
        <span
          key={String(tag)}
          className="h-min text-xs md:text-sm bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20"
        >
          {tag}
        </span>
      ))}
    </div>
  ) : null;

const EventListItem = ({
  event,
  registered = [],
  expanded = false,
  onToggle = () => { },
  onRegister = () => { },
}) => {
  const spotsLeft =
    typeof event.capacity === "number"
      ? Math.max(event.capacity - registered.length, 0)
      : null;

  const contentRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState(0);

  // image fallback (stable per event)
  const imgSrc =
    event.image || `https://picsum.photos/seed/${event.id || "event"}/300/200`;

  useEffect(() => {
    if (!contentRef.current) return;
    const el = contentRef.current;
    const measure = () => setMaxHeight(el.scrollHeight + 4);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [event.description, event.company, event?.venue?.address, event?.tags?.length]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      onClick={onToggle}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onToggle()}
      className="relative w-full bg-surface rounded-2xl border border-brand-200/70 shadow-[0_15px_40px_-28px_rgba(16,24,40,0.65)] hover:shadow-[0_20px_45px_-25px_rgba(16,24,40,0.58)] transition-shadow flex flex-col p-3 md:p-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30"
    >
      <div
        aria-hidden
        className={`absolute right-3 top-2 text-text-muted transition-transform duration-300 select-none ${expanded ? "rotate-180" : "rotate-0"
          }`}
      >
        ▾
      </div>

      {/* Header row */}
      <div className="flex justify-between gap-3 md:gap-5 relative">
        <img
          src={imgSrc}
          alt={event.title || "Event image"}
          onError={(e) => {
            e.currentTarget.src = `https://picsum.photos/seed/${event.id || "fallback"}/300/200`;
          }}
          className="w-24 sm:w-28 md:w-32 lg:w-36 xl:w-40 aspect-[4/3] object-cover rounded-xl shrink-0 shadow-[0_10px_24px_-20px_rgba(16,24,40,0.6)]"
        />

        <div className="w-full flex-1">
          <h3 className={`text-sm sm:text-base md:text-lg xl:text-xl font-semibold leading-snug text-text ${expanded ? "" : "line-clamp-1"
            }`}>
            {event.title || "Untitled Event"}
          </h3>
          <MetaRow venue={event.venue} date={event.date} expanded={expanded} />
          <div className="mt-2 flex items-center justify-between gap-2 md:gap-3">
            <PriceTag price={event.price} />
            <AvatarStack users={registered} />
          </div>
        </div>
      </div>

      {/* Expandable panel */}
      <div className="relative">
        {/* keep gradient inside the panel to avoid overlapping header */}
        {expanded && (
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-surface to-transparent rounded-b" />
        )}

        <div
          className="overflow-hidden transition-[max-height] duration-500 ease-out"
          style={{ maxHeight: expanded ? maxHeight : 0 }}
          aria-hidden={!expanded}
        >
          {/* padding prevents margin-collapsing from clipping top/bottom */}
          <div
            ref={contentRef}
            className={`transition-all duration-500 space-y-2 pt-2 ${expanded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
              }`}
          >
            <TagPills tags={event.tags} />
            <div className="text-sm md:text-base text-text-muted leading-relaxed">
              <p className="flex flex-wrap">
                <span className="w-fit">{event.company},{'\u00A0'}</span>
                <span className="w-fit">{event?.venue?.address}</span>
              </p>
              <p>
                Hosted by {event?.organizer?.name ?? "Organizer"}
              </p>
            </div>

            <p className="text-text leading-relaxed text-sm md:text-base">{event.description}</p>

            <div className="flex items-center justify-end gap-3">
              {spotsLeft !== null && (
                <span className="text-xs md:text-sm text-text-muted">
                  {spotsLeft} spot{spotsLeft === 1 ? "" : "s"} left
                </span>
              )}
              <button
                className="inline-flex items-center gap-1 rounded-full bg-primary text-onprimary px-3 py-1.5 text-xs md:text-sm font-semibold shadow-[0_10px_20px_-14px_rgba(220,73,102,0.8)] transition hover:shadow-[0_14px_24px_-12px_rgba(220,73,102,0.95)]"
                onClick={(e) => {
                  e.stopPropagation();
                  onRegister(event);
                }}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventListItem;
