import { useEffect, useRef, useState, useMemo } from "react";

const EventCard = ({ event, registered }) => {
  const [expanded, setExpanded] = useState(false);

  const contentRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState(0);

  useEffect(() => {
    if (!contentRef.current) return;
    const el = contentRef.current;
    const measure = () => setMaxHeight(el.scrollHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [event.description, event.title, event.company, event.capacity, event?.venue?.address, event?.tags?.length]);

  const eventDate = useMemo(() => new Date(event.date), [event.date]);
  const formattedDate = useMemo(
    () => eventDate.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    [eventDate]
  );
  const formattedTime = useMemo(
    () => eventDate.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
    [eventDate]
  );

  const isFree = Number(event.price) === 0 || Number.isNaN(Number(event.price));
  const toggle = () => setExpanded((e) => !e);

  return (
    <div
      role="button"
      aria-expanded={expanded}
      tabIndex={0}
      onClick={toggle}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggle()}
      className="relative w-[260px] h-full flex flex-col gap-2 p-2 rounded-lg shadow-md bg-white cursor-pointer select-none transition-shadow duration-200 hover:shadow-lg"
    >
      <img
        className="w-full aspect-[4/2] object-cover rounded-lg"
        src={event.image}
        alt="Event"
      />

      <h2 className="text-xl font-bold">{event.title}</h2>

      <div className="flex justify-between text-sm">
        <p>📍{event?.venue?.name}</p>
        <p>🗓️{formattedDate} - {formattedTime}</p>
      </div>

      <div className="flex items-center justify-between">
        {/* Price (or Free) */}
        <p className="text-base">
          {isFree ? "Free" : `$${event.price}`}
          {!isFree && <span className="text-sm text-gray-500">/ticket</span>}
        </p>

        {/* Avatars */}
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
      </div>

      {/* Sliding panel */}
      <div
        ref={contentRef}
        className="overflow-hidden transition-[max-height] duration-500 ease-out"
        style={{ maxHeight: expanded ? maxHeight : 0 }}
        aria-hidden={!expanded}
      >
        <div
          className={`flex flex-col gap-2 transition-all duration-500 ${expanded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
            }`}
        >
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
          <div>
            <p className="text-sm text-gray-500">{event.company}</p>
            <p className="text-sm text-gray-500">{event?.venue?.address}</p>
            <p className="text-sm text-gray-500">Hosted by {event?.organizer?.name ?? "Organizer"}</p>
            <p className="my-2">{event.description}</p>
          </div>


          <button
            className="bg-blue-500 text-white py-1 px-2 rounded"
            onClick={(e) => {
              e.stopPropagation();
              // handle register action here
            }}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
