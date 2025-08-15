import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, useMotionValue, animate } from "framer-motion";

export default function EventCarousel({
  events = [],
  registered = [],
  apiUrl = null, // API endpoint URL
  autoPlayMs = 6000,
  loop = true,
  onPageChange
}) {
  const [apiEvents, setApiEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedEventId, setExpandedEventId] = useState(null); // Track which event is expanded //

  // Fetch events from API
  useEffect(() => {
    if (!apiUrl) return;
    
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setApiEvents(Array.isArray(data) ? data : data.events || []);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [apiUrl]);

  // Determine which events to use //
  const list = useMemo(() => {
    if (apiUrl && apiEvents.length > 0) return apiEvents;
    if (events && events.length > 0) return events;
    return []; // No sample data fallback
  }, [apiUrl, apiEvents, events]);
  
  const count = list.length;
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const x = useMotionValue(0);

  const perView = 1;
  const slideWidth = viewportWidth > 0 ? viewportWidth / perView : 0;
  const pageCount = Math.max(1, count); // Each event gets its own page
  const [pageIndex, setPageIndex] = useState(0);

  // ResizeObserver keeps width in sync
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setViewportWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Animate to current page properly //
  useEffect(() => {
    if (viewportWidth > 0 && count > 0) {
      const targetX = -pageIndex * viewportWidth;
      animate(x, targetX, {
        type: "spring",
        damping: 30,
        stiffness: 300,
        duration: 0.6
      });
      onPageChange?.(pageIndex);
    }
  }, [pageIndex, viewportWidth, x, onPageChange, count]);

  // Navigation helpers with better bounds checking
  const goTo = useCallback((i) => {
    if (count === 0) return;
    let newIndex;
    if (loop) {
      newIndex = ((i % count) + count) % count; // Proper modulo for negative numbers
    } else {
      newIndex = Math.max(0, Math.min(i, count - 1));
    }
    setPageIndex(newIndex);
    // Close expanded event when navigating
    setExpandedEventId(null);
  }, [count, loop]);
  
  const next = useCallback(() => {
    goTo(pageIndex + 1);
  }, [goTo, pageIndex]);
  
  const prev = useCallback(() => {
    goTo(pageIndex - 1);
  }, [goTo, pageIndex]);

  // Autoplay //
  const [isPaused, setIsPaused] = useState(false);
  useEffect(() => {
    if (!autoPlayMs || autoPlayMs <= 0 || isPaused || count <= 1) return;
    const id = setInterval(next, autoPlayMs);
    return () => clearInterval(id);
  }, [pageIndex, isPaused, autoPlayMs, count, next]);

  // Keyboard controls //
  useEffect(() => {
    const el = viewportRef.current;
    if (!el || count === 0) return;
    
    const onKey = (e) => {
      if (e.key === "ArrowRight") { 
        e.preventDefault(); 
        next(); 
      } else if (e.key === "ArrowLeft") { 
        e.preventDefault(); 
        prev(); 
      } else if (e.key === "Home") { 
        e.preventDefault(); 
        goTo(0); 
      } else if (e.key === "End") { 
        e.preventDefault(); 
        goTo(count - 1); 
      } else if (e.key === "Escape") {
        e.preventDefault();
        setExpandedEventId(null);
      }
    };
    
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [next, prev, goTo, count]);

  // Handle event card click - toggle expansion //
  const handleEventClick = useCallback((eventId) => {
    setExpandedEventId(prev => prev === eventId ? null : eventId);
  }, []);

  // Proper drag/swipe handling //
  const SWIPE_THRESHOLD = 50;
  const VELOCITY_THRESHOLD = 300;
  
  const handleDragEnd = useCallback((event, info) => {
    if (count === 0) return;
    
    const { offset, velocity } = info;
    
    if (Math.abs(offset.x) > SWIPE_THRESHOLD || Math.abs(velocity.x) > VELOCITY_THRESHOLD) {
      if (offset.x < 0) {
        next();
      } else {
        prev();
      }
    }
    // The animation will handle snapping back automatically //
  }, [count, next, prev]);

  return (
    <section
      className="w-full max-w-7xl mx-auto"
      role="region"
      aria-roledescription="carousel"
      aria-label="Recommended events carousel"
    >
      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center p-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent absolute inset-0"></div>
            </div>
            <div className="text-gray-700 font-medium">Discovering amazing events...</div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="flex items-center justify-center p-16 bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl border border-red-100">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <div className="text-red-700 font-semibold text-lg mb-2">Oops! Something went wrong</div>
            <div className="text-sm text-red-600 mb-6 bg-red-100 p-3 rounded-lg">{error}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* No events state */}
      {!loading && !error && count === 0 && (
        <div className="flex items-center justify-center p-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl border border-gray-100">
          <div className="text-center max-w-md">
            <div className="text-8xl mb-6 animate-bounce">📅</div>
            <div className="text-2xl text-gray-700 font-bold mb-3">No Events Yet</div>
            <div className="text-gray-500 leading-relaxed">
              Stay tuned! Amazing events are coming your way. 
              Check back soon for exciting opportunities to connect and learn.
            </div>
          </div>
        </div>
      )}

      {/* Carousel - Enhanced */}
      {!loading && !error && count > 0 && (
        <div
          ref={viewportRef}
          tabIndex={0}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-gray-50 shadow-2xl ring-1 ring-black/5 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
          data-testid="carousel-viewport"
        >
          {/* motion.div with proper x animation */}
          <motion.div
            ref={trackRef}
            className="flex"
            style={{ 
              width: count * viewportWidth,
              x // This connects the motion value to the element //
            }}
            drag="x"
            dragConstraints={{
              left: -(count - 1) * viewportWidth,
              right: 0,
            }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            aria-live="polite"
            data-testid="carousel-track"
          >
            {list.map((event, i) => (
              <div 
                key={event.id ?? i} 
                style={{ width: viewportWidth }} 
                className="shrink-0 flex items-center justify-center p-8"
              >
                {/* Better card spacing and centering */}
                <div className="w-full max-w-4xl">
                  <EventCardDiv 
                    event={event} 
                    registered={event.registered || registered}
                    isExpanded={expandedEventId === (event.id ?? i)}
                    onToggle={() => handleEventClick(event.id ?? i)}
                  />
                </div>
              </div>
            ))}
          </motion.div>

          {/* Navigation arrows - Enhanced and only show if more than 1 event */}
          {count > 1 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-between p-6">
              <button
                type="button"
                onClick={prev}
                disabled={!loop && pageIndex === 0}
                className="pointer-events-auto group inline-flex items-center justify-center rounded-full bg-white/95 backdrop-blur-md shadow-xl ring-1 ring-black/10 hover:bg-white hover:shadow-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30 w-14 h-14 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 z-10"
                aria-label="Previous event"
              >
                <span className="text-2xl text-gray-600 group-hover:text-gray-800 transition-colors">←</span>
              </button>
              <button
                type="button"
                onClick={next}
                disabled={!loop && pageIndex === count - 1}
                className="pointer-events-auto group inline-flex items-center justify-center rounded-full bg-white/95 backdrop-blur-md shadow-xl ring-1 ring-black/10 hover:bg-white hover:shadow-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30 w-14 h-14 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 z-10"
                aria-label="Next event"
              >
                <span className="text-2xl text-gray-600 group-hover:text-gray-800 transition-colors">→</span>
              </button>
            </div>
          )}

          {/* Pagination dots - Enhanced and only show if more than 1 event */}
          {count > 1 && (
            <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-3 z-10">
              {Array.from({ length: count }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30 transition-all duration-300 hover:scale-125 ${
                    i === pageIndex 
                      ? "bg-white w-10 h-4 shadow-lg" 
                      : "bg-white/60 w-4 h-4 hover:bg-white/80"
                  }`}
                  aria-label={`Go to event ${i + 1} of ${count}`}
                  aria-pressed={i === pageIndex}
                  data-testid={`dot-${i}`}
                />
              ))}
            </div>
          )}

          {/* Event counter */}
          {count > 1 && (
            <div className="absolute top-6 right-6 bg-black/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
              {pageIndex + 1} / {count}
            </div>
          )}
        </div>
      )}

      {count > 0 && (
        <p className="sr-only" aria-live="polite">
          Showing event {pageIndex + 1} of {count}
          {expandedEventId && ". Event details expanded."}
        </p>
      )}
    </section>
  );
}

// EventCardDiv component with better spacing //
function EventCardDiv({ event, registered = [], isExpanded = false, onToggle }) {
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

  return (
    <motion.div
      role="button"
      aria-expanded={isExpanded}
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onToggle()}
      className="relative w-full mx-auto flex flex-col gap-6 p-8 rounded-3xl bg-white cursor-pointer select-none transition-all duration-300 hover:shadow-2xl border border-gray-100 group"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      {/* Image with overlay gradient */}
      <div className="relative overflow-hidden rounded-2xl">
        <img
          className="w-full aspect-[16/9] object-cover transition-transform duration-500 group-hover:scale-105"
          src={event.image || `https://picsum.photos/seed/${event.id || 'event'}/1200/675`}
          alt={event.title}
          onError={(e) => {
            e.currentTarget.src = `https://picsum.photos/seed/fallback${event.id || Math.random()}/1200/675`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        
        {/* Price tag */}
        <div className="absolute top-6 right-6">
          <span className={`px-6 py-3 rounded-full text-lg font-bold shadow-lg backdrop-blur-sm ${
            isFree 
              ? 'bg-green-500/90 text-white' 
              : 'bg-white/90 text-gray-800'
          }`}>
            {isFree ? "Free" : `$${event.price}`}
          </span>
        </div>

        {/* Expand/collapse hint */}
        <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
          {isExpanded ? "Click to collapse" : "Click for details"}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-6">
        <h2 className="text-4xl font-bold text-gray-900 leading-tight">{event.title}</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-lg text-gray-600">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📍</span>
            <span className="font-medium">{event?.venue?.name || 'Venue TBD'}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🗓️</span>
            <span className="font-medium">{formattedDate} at {formattedTime}</span>
          </div>
        </div>

        {/* Avatars */}
        {registered && registered.length > 0 && (
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {registered.slice(0, 6).map((user, idx) => (
                <img
                  key={user.id}
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-full border-4 border-white shadow-lg"
                  style={{ zIndex: 10 - idx }}
                />
              ))}
              {registered.length > 6 && (
                <div className="w-12 h-12 rounded-full border-4 border-white bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm font-bold flex items-center justify-center shadow-lg">
                  +{registered.length - 6}
                </div>
              )}
            </div>
            <span className="text-lg text-gray-600 font-semibold">
              {registered.length} {registered.length === 1 ? 'person' : 'people'} attending
            </span>
          </div>
        )}
      </div>

      {/*Expandable content using isExpanded prop */}
      <motion.div
        className="overflow-hidden"
        initial={false}
        animate={{ 
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0 
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <div className="pt-6 border-t border-gray-200">
          {/* Tags */}
          {Array.isArray(event.tags) && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-6">
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-sm bg-gradient-to-r from-blue-50 to-purple-50 text-gray-700 px-4 py-2 rounded-full border border-gray-200 font-semibold"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {/* Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 text-base text-gray-600">
            <div>
              <span className="font-bold text-gray-800 text-lg">Company:</span>
              <p className="mt-1 text-lg">{event.company}</p>
            </div>
            <div>
              <span className="font-bold text-gray-800 text-lg">Hosted by:</span>
              <p className="mt-1 text-lg">{event?.organizer?.name ?? "Organizer"}</p>
            </div>
            {event?.venue?.address && (
              <div className="lg:col-span-2">
                <span className="font-bold text-gray-800 text-lg">Location:</span>
                <p className="mt-1 text-lg">{event.venue.address}</p>
              </div>
            )}
          </div>

          <div className="mb-8">
            <span className="font-bold text-gray-800 text-xl block mb-3">About this event:</span>
            <p className="text-gray-700 leading-relaxed text-lg">{event.description}</p>
          </div>

          <button
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-6 px-8 rounded-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-bold text-xl"
            onClick={(e) => {
              e.stopPropagation();
              console.log('Registering for event:', event.id);
            }}
          >
            Register Now
          </button>
        </div>
      </motion.div>

      {/* Expand indicator */}
      <motion.div 
        className="absolute bottom-6 right-6 text-gray-400 bg-white/80 rounded-full p-3 shadow-sm"
        animate={{ rotate: isExpanded ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 10l5 5 5-5z"/>
        </svg>
      </motion.div>
    </motion.div>
  );
}