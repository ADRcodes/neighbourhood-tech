// src/pages/HomeShell.jsx

import { useEvents } from "../lib/hooks/useEvents";
import Home2 from "./Home2";
import HomeDesktop from "./HomeDesktop";

export default function HomeShell() {
  const {
    filtered,         // events after chip filters
    recommended,      // "featured" candidates
    chips,            // active chips
    toggleChip,
    loading,
    error,
    warning,
  } = useEvents({
    useApi: true,
    fallbackToMocks: true,
    initialChips: [],
  });

  // Pass the same state into both views; CSS decides which one shows
  const props = {
    featured: recommended,
    events: filtered,
    activeTags: chips,
    onToggleTag: toggleChip,
    loading,
    error,
    warning,
  };

  return (
    <>
      <div className="md:hidden">
        <Home2 {...props} />
      </div>
      <div className="hidden md:block">
        <HomeDesktop {...props} />
      </div>
    </>
  );
}
