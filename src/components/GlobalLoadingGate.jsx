import { useLocation } from "react-router-dom";
import LoadingScreen from "./LoadingScreen";
import { useEventsContext } from "../lib/context/EventsProvider";
import { useSavedEvents } from "../lib/context/SavedEventsProvider";

export default function GlobalLoadingGate() {
  const location = useLocation();
  const { loading: eventsLoading } = useEventsContext();
  const { loading: savedLoading, ready: savedReady, hasSupabase } = useSavedEvents();

  const onSavedPage = location?.pathname?.startsWith("/saved");
  const showSavedLoader = onSavedPage && hasSupabase && (savedLoading || !savedReady);
  const show = eventsLoading || showSavedLoader;

  if (!show) return null;

  const message = showSavedLoader
    ? "Refreshing your saved list…"
    : "Warming up Out & About Events…";
  const subtext = showSavedLoader
    ? "Pulling your saved statuses."
    : "Fetching events, tags, and recommendations.";

  return <LoadingScreen show message={message} subtext={subtext} />;
}
