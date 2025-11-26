import { useEffect, useRef, useState } from "react";
import { formatSourceName, formatPriceDisplay } from "../lib/utils/events";

const PriceTag = ({ price }) => {
  const label = formatPriceDisplay(price);
  if (!label) return null;
  return <p className="text-sm md:text-base font-medium text-text">{label}</p>;
};

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

const LocationRow = ({ venue, expanded }) => {
  const venueName = venue?.name || "Venue TBA";
  return (
    <p className="text-xs md:text-sm text-text-muted flex-1 min-w-0 leading-snug">
      <span className={`${expanded ? "" : "line-clamp-1"} break-words align-top`} title={venueName}>
        📍 {venueName}
      </span>
    </p>
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

const preferenceOptions = [
  { value: "interested", label: "Interested" },
  { value: "going", label: "Going" },
];

const EventListItem = ({
  event,
  registered = [],
  expanded = false,
  onToggle = () => { },
  onRegister = () => { },
  preference = null,
  onSelectPreference = () => { },
  cardClassName = "",
}) => {
  const [pendingStatus, setPendingStatus] = useState(null);
  const isNotInterested = preference === "not_interested";
  const handlePreference = async (status) => {
    try {
      const nextStatus = preference === status ? null : status;
      setPendingStatus(status || "remove");
      const result = onSelectPreference?.(nextStatus);
      if (result && typeof result.then === "function") {
        await result;
      }
    } finally {
      setPendingStatus(null);
    }
  };

  const formattedSource = event?.source ? formatSourceName(event.source) : "";

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

  const dateObj = event?.date ? new Date(event.date) : null;
  const hasDate = dateObj && !Number.isNaN(dateObj.getTime());
  const dateStr = hasDate
    ? dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : "Date TBA";
  const timeStr = hasDate
    ? dateObj.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    : "";

  const surfaceClass = cardClassName || "bg-surface";

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      onClick={onToggle}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onToggle()}
      className={`relative w-full ${surfaceClass} rounded-2xl border border-brand-200/70 shadow-[0_15px_40px_-28px_rgba(16,24,40,0.65)] hover:shadow-[0_20px_45px_-25px_rgba(16,24,40,0.58)] transition-shadow flex flex-col p-3 md:p-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${isNotInterested ? "opacity-60 grayscale" : ""
        }`}
    >
      {isNotInterested && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-text/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-onprimary">
          Not interested
        </span>
      )}
      <div className="flex justify-between gap-3 md:gap-5 relative">
        <img
          src={imgSrc}
          alt={event.title || "Event image"}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = `https://picsum.photos/seed/${event.id || "fallback"}/300/200`;
          }}
          className="w-24 sm:w-28 md:w-32 lg:w-36 xl:w-40 h-20 sm:h-24 md:h-28 lg:h-32 xl:h-36 object-cover rounded-xl shrink-0 shadow-[0_10px_24px_-20px_rgba(16,24,40,0.6)]"
        />

        <div className="w-full flex-1 flex flex-col gap-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <div className="flex-1 min-w-0">
              <h3 className={`text-base md:text-lg font-semibold leading-snug text-text ${expanded ? "" : "line-clamp-1"}`}>
                {event.title || "Untitled Event"}
              </h3>
              <LocationRow venue={event.venue} expanded={expanded} />
            </div>
            <div className="flex flex-col items-end shrink-0">
              <button
                type="button"
                aria-label="Not interested"
                className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-sm font-semibold transition ${preference === "not_interested"
                  ? "border-danger/60 text-danger bg-danger/10"
                  : "border-brand-200/70 text-text-muted hover:text-danger hover:border-danger/30"
                  }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreference("not_interested");
                }}
                disabled={pendingStatus === "not_interested"}
              >
                ×
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 md:gap-4">
            <div>
              <PriceTag price={event.price} />
            </div>
            <div className="text-right text-xs md:text-sm text-text">
              <span className="block font-semibold text-nowrap text-primary">{dateStr}</span>
              {timeStr && <span className="block text-nowrap">{timeStr}</span>}
            </div>
          </div>
          <div className="mt-2 flex justify-end">
            <AvatarStack users={registered} />
          </div>
        </div>
      </div>

      {/* Expandable panel */}
      <div className="relative">
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
              {(event.company || event?.venue?.address) && (
                <p className="flex flex-wrap">
                  {event.company && <span className="w-fit">{event.company}{'\u00A0'}</span>}
                  {event?.venue?.address && <span className="w-fit">{event.venue.address}</span>}
                </p>
              )}
              {event?.organizer?.name && (
                <p>
                  Hosted by {event.organizer.name}
                </p>
              )}
              {formattedSource && (
                <p>
                  Source: <span className="text-text">{formattedSource}</span>
                </p>
              )}
            </div>

            <p className="text-text leading-relaxed text-sm md:text-base">
              {event.description || "More details coming soon."}
            </p>

            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-end gap-2">
                {preferenceOptions.map((opt) => {
                  const active = preference === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${active
                        ? "bg-primary text-onprimary border-primary"
                        : "bg-surface text-text border-brand-200/80 hover:bg-primary/10"
                        }`}
                      disabled={pendingStatus === opt.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreference(opt.value);
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
                {event.url && (
                  <a
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full bg-primary text-onprimary px-3 py-1.5 text-xs md:text-sm font-semibold shadow-[0_10px_20px_-14px_rgba(220,73,102,0.8)] transition hover:shadow-[0_14px_24px_-12px_rgba(220,73,102,0.95)]"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRegister(event);
                    }}
                  >
                    Visit Event
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <span
        aria-hidden
        className={`pointer-events-none absolute flex h-4 w-4 items-center justify-center rounded-full left-1/2 -translate-x-1/2 text-text-muted transition-transform duration-300 bg-surface border border-brand-200 shadow-sm ${expanded ? "rotate-180 -bottom-2" : "rotate-0 -bottom-2 pt-[1px]"}`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </span>
    </div >
  );
};

export default EventListItem;
