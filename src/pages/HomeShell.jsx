// src/pages/HomeShell.jsx

import { useEvents } from "../lib/hooks/useEvents";
import HomeMobile from "./HomeMobile";
import HomeDesktop from "./HomeDesktop";
import { DEFAULT_USE_API } from "../lib/config";

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

  // Pass the same state into both views; CSS decides which one shows
  const props = {
    featured: recommended,
    events: filtered,
    activeTags: chips,
    onToggleTag: toggleChip,
    availableTags: tagOptions,
    activeSources: sourceFilters,
    onToggleSource: toggleSource,
    availableSources: sourceOptions,
    searchTerm,
    onSearchChange: setSearchTerm,
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
