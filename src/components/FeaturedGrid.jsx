import EventCard from "./EventCard";

export default function FeaturedGrid({ items = [] }) {
  if (!items?.length) return null;

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((ev) => (
        <div key={ev.id} className="min-w-0">
          <EventCard event={ev} registered={ev.registered} />
        </div>
      ))}
    </div>
  );
}
