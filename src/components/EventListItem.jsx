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
      <span className="align-middle text-sm inline-flex items-center justify-center w-6 h-6 -ml-[10px] border-2 border-white bg-green-500 text-white rounded-full">
        {users.length - 5}
      </span>
    )}
  </div>
);

const PriceTag = ({ price }) => {
  const isFree = Number(price) === 0 || Number.isNaN(Number(price));
  return (
    <p className="text-sm">
      {isFree ? "Free" : `$${Number(price).toFixed(2)}`}
      {!isFree && <span className="text-xs text-gray-500"> /Person</span>}
    </p>
  );
};

const MetaRow = ({ venue, date }) => {
  const dt = useMemo(() => (date ? new Date(date) : null), [date]);
  const dateStr = useMemo(
    () =>
      dt
        ? dt.toLocaleDateString(undefined, { month: "short", day: "numeric" })
        : "TBD",
    [dt]
  );
  const timeStr = useMemo(
    () =>
      dt
        ? dt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
        : "",
    [dt]
  );
  return (
    <div className="flex w-full items-center justify-between gap-3 text-xs text-gray-700">
      <div className="flex items-center gap-1">
        <p>📍</p>
        <p>{venue?.name || "Venue"}</p>
      </div>
      <div className="flex flex-col w-fit items-center gap-1">
        <p className="font-semibold">{dateStr}</p>
        {timeStr && <p>{timeStr}</p>}
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
          className="h-min text-xs bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200"
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
      className="relative w-full bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col p-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300"
    >
      <div
        aria-hidden
        className={`absolute right-2 top-1 transition-transform duration-300 select-none ${expanded ? "rotate-180" : "rotate-0"
          }`}
      >
        ▾
      </div>

      {/* Header row */}
      <div className="flex justify-between gap-3 relative">
        <img
          src={imgSrc}
          alt={event.title || "Event image"}
          onError={(e) => {
            e.currentTarget.src = `https://picsum.photos/seed/${event.id || "fallback"}/300/200`;
          }}
          className="w-24 aspect-[4/3] object-cover rounded-md shrink-0"
        />

        <div className="w-full">
          <h3 className="text-sm font-semibold truncate">
            {event.title || "Untitled Event"}
          </h3>
          <MetaRow venue={event.venue} date={event.date} />
          <div className="mt-1 flex items-center justify-between gap-3">
            <PriceTag price={event.price} />
            <AvatarStack users={registered} />
          </div>
        </div>
      </div>

      {/* Expandable panel */}
      <div className="relative">
        {/* keep gradient inside the panel to avoid overlapping header */}
        {expanded && (
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-white to-transparent rounded-b" />
        )}

        <div
          className="overflow-hidden transition-[max-height] duration-500 ease-out"
          style={{ maxHeight: expanded ? maxHeight : 0 }}
          aria-hidden={!expanded}
        >
          {/* padding prevents margin-collapsing from clipping top/bottom */}
          <div
            ref={contentRef}
            className={`transition-all duration-500 pt-2 ${expanded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
              }`}
          >
            <div className="flex w-fit gap-3 items-start">
              <div className="text-sm text-gray-600 space-y-1">
                <p className="text-gray-500">{event.company}</p>
                <p className="text-gray-500">{event?.venue?.address}</p>
                <p className="text-gray-500">
                  Hosted by {event?.organizer?.name ?? "Organizer"}
                </p>
              </div>
              <TagPills tags={event.tags} />
            </div>

            <p className="mt-2 text-gray-800">{event.description}</p>

            <div className="mt-2 flex items-center justify-end gap-3">
              {spotsLeft !== null && (
                <span className="text-xs text-gray-500">
                  {spotsLeft} spot{spotsLeft === 1 ? "" : "s"} left
                </span>
              )}
              <button
                className="bg-blue-500 text-white py-1 px-2 rounded"
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
