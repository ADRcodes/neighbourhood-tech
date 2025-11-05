import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { DEFAULT_USE_API } from "../config";
import { fetchEvents } from "../api/events";
import { filterEvents, recommendedOf } from "../utils/events";
import { MOCK_EVENTS } from "../../data/mockEvents";

/**
 * useEvents – fetches events (API or mocks), manages tag chips, exposes derived lists.
 * @param {object} opts
 * @param {boolean} opts.useApi          default true (from config)
 * @param {boolean} opts.fallbackToMocks if API fails, show mocks instead
 * @param {string[]} opts.initialChips   initial selected chip keys
 */
export function useEvents({ useApi = DEFAULT_USE_API, fallbackToMocks = true, initialChips = [] } = {}) {
  const [events, setEvents] = useState(useApi ? [] : MOCK_EVENTS);
  const [chips, setChips] = useState(initialChips);
  const [loading, setLoading] = useState(useApi);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);

  const abortRef = useRef(null);

  const load = useCallback(async () => {
    if (!useApi) return; // using mocks
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setError(null);
    setWarning(null);

    try {
      const list = await fetchEvents({ signal: ctrl.signal });
      setEvents(list);
    } catch (e) {
      setError(String(e));
      if (fallbackToMocks) {
        setWarning("API unavailable — showing mock data.");
        setEvents(MOCK_EVENTS);
      }
    } finally {
      setLoading(false);
    }
  }, [useApi, fallbackToMocks]);

  useEffect(() => {
    if (useApi) load();
    // cleanup
    return () => abortRef.current?.abort();
  }, [useApi, load]);

  const toggleChip = useCallback((key) => {
    setChips((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }, []);

  const filtered = useMemo(() => filterEvents(events, chips), [events, chips]);
  const recommended = useMemo(() => recommendedOf(events, 12), [events]);

  return {
    data: events,
    filtered,
    recommended,
    chips,
    setChips,
    toggleChip,
    loading,
    error,
    warning,
    refetch: load,
  };
}
