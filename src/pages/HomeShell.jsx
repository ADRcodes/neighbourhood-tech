// src/pages/HomeShell.jsx

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEvents } from "../lib/hooks/useEvents";
import HomeMobile from "./HomeMobile";
import HomeDesktop from "./HomeDesktop";
import { DEFAULT_USE_API } from "../lib/config";
import { useEventPreferences } from "../lib/hooks/useEventPreferences";
import { normalizeEventId } from "../lib/utils/ids";

export default function HomeShell() {
  const {
    filtered,         // events after chip filters
    recommended,      // "featured" candidates
    chips,            // active chips
    toggleChip,
    sourceFilters,
    toggleSource,
    searchTerm,
    setSearchTerm,
    tagOptions,
    sourceOptions,
    loading,
    error,
    warning,
  } = useEvents({
    useApi: DEFAULT_USE_API,
    fallbackToMocks: true,
    initialChips: [],
  });
  const navigate = useNavigate();
  const { statusByEvent, setPreference, AUTH_REQUIRED_ERROR } = useEventPreferences();
  const [showNotInterested, setShowNotInterested] = useState(false);

  const { visibleEvents, notInterestedEvents, visibleFeatured } = useMemo(() => {
    if (!Array.isArray(filtered)) {
      return { visibleEvents: [], notInterestedEvents: [], visibleFeatured: [] };
    }

    const statusMap = statusByEvent || {};
    const isNotInterested = (event) => {
      const id = normalizeEventId(event?.id ?? event?.eventId);
      if (!id) return false;
      return statusMap[id] === "not_interested";
    };

    const visible = [];
    const hidden = [];
    filtered.forEach((event) => {
      if (isNotInterested(event)) hidden.push(event);
      else visible.push(event);
    });

    const featuredList = Array.isArray(recommended)
      ? recommended.filter((event) => !isNotInterested(event))
      : [];

    return { visibleEvents: visible, notInterestedEvents: hidden, visibleFeatured: featuredList };
  }, [filtered, recommended, statusByEvent]);

  useEffect(() => {
    if (!notInterestedEvents.length && showNotInterested) {
      setShowNotInterested(false);
    }
  }, [notInterestedEvents.length, showNotInterested]);

  const handlePreference = async (eventId, normalizedId, status) => {
    try {
      await setPreference(eventId, status, normalizedId);
    } catch (error) {
      if (error?.code === AUTH_REQUIRED_ERROR) {
        navigate("/auth");
      } else {
        console.error("Failed to set preference", error);
      }
    }
  };

  // Pass the same state into both views; CSS decides which one shows
  const props = {
    featured: visibleFeatured,
    events: visibleEvents,
    notInterestedEvents,
    showNotInterested,
    onToggleNotInterested: () => setShowNotInterested((prev) => !prev),
    activeTags: chips,
    onToggleTag: toggleChip,
    availableTags: tagOptions,
    activeSources: sourceFilters,
    onToggleSource: toggleSource,
    availableSources: sourceOptions,
    searchTerm,
    onSearchChange: setSearchTerm,
    eventPreferences: statusByEvent,
    onSelectPreference: handlePreference,
    loading,
    error,
    warning,
  };

  return (
    <>
      <div className="md:hidden">
        <HomeMobile {...props} />
      </div>
      <div className="hidden md:block">
        <HomeDesktop {...props} />
      </div>
    </>
  );
}
