import { createContext, useContext } from "react";
import { useEvents } from "../hooks/useEvents";
import { DEFAULT_USE_API } from "../config";

const EventsContext = createContext(null);

export function EventsProvider({ children }) {
  const eventsState = useEvents({
    useApi: DEFAULT_USE_API,
    fallbackToMocks: true,
    initialChips: [],
  });

  return <EventsContext.Provider value={eventsState}>{children}</EventsContext.Provider>;
}

export function useEventsContext() {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error("useEventsContext must be used within an EventsProvider");
  }
  return context;
}
