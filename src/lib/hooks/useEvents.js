import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { DEFAULT_USE_API } from "../config";
import { supabase } from "../supabase/client";
import { fetchEvents, fetchLocalEvents } from "../api/events";
import {
  filterEvents,
  recommendedOf,
  buildTagOptions,
  buildSourceOptions,
  buildLocationOptions,
} from "../utils/events";
import { MOCK_EVENTS } from "../../data/mockEvents";

/**
 * useEvents – fetches events (API or mocks), manages tag chips, exposes derived lists.
 * @param {object} opts
 * @param {boolean} opts.useApi          default true (from config)
 * @param {boolean} opts.fallbackToMocks if API fails, show mocks instead
 * @param {string[]} opts.initialChips   initial selected chip keys
 */
export function useEvents({ useApi = DEFAULT_USE_API, fallbackToMocks = true, initialChips = [] } = {}) {
  const usingSupabase = useApi && Boolean(supabase);
  const allowMockFallback = fallbackToMocks && !usingSupabase;
  const [events, setEvents] = useState([]);
  const [chips, setChips] = useState(initialChips);
  const [sourceFilters, setSourceFilters] = useState([]);
  const [locationFilters, setLocationFilters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);

  const abortRef = useRef(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setError(null);
    setWarning(null);

    try {
      const list = useApi
        ? await fetchEvents({ signal: ctrl.signal })
        : await fetchLocalEvents({ signal: ctrl.signal });

      if (!list.length && allowMockFallback) {
        setWarning("No events found — showing mock data.");
        setEvents(MOCK_EVENTS);
        return;
      }

      setEvents(list);
    } catch (e) {
      setError(String(e));
      if (allowMockFallback) {
        setWarning(
          useApi
            ? "API unavailable — showing mock data."
            : "Local events unavailable — showing mock data."
        );
        setEvents(MOCK_EVENTS);
      } else {
        setEvents([]);
      }
    } finally {
      setLoading(false);
    }
  }, [useApi, fallbackToMocks]);

  useEffect(() => {
    load();
    // cleanup
    return () => abortRef.current?.abort();
  }, [useApi, load]);

  const toggleChip = useCallback((key) => {
    setChips((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }, []);

  const toggleSource = useCallback((key) => {
    setSourceFilters((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }, []);

  const toggleLocation = useCallback((key) => {
    setLocationFilters((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  const filtered = useMemo(
    () =>
      filterEvents(events, {
        tags: chips,
        sources: sourceFilters,
        locations: locationFilters,
        search: searchTerm,
      }),
    [events, chips, sourceFilters, locationFilters, searchTerm]
  );
  const recommended = useMemo(() => recommendedOf(events, 12), [events]);
  const tagOptions = useMemo(() => buildTagOptions(events), [events]);
  const sourceOptions = useMemo(() => buildSourceOptions(events), [events]);
  const locationOptions = useMemo(() => buildLocationOptions(events), [events]);

  return {
    data: events,
    filtered,
    recommended,
    chips,
    setChips,
    toggleChip,
    sourceFilters,
    toggleSource,
    locationFilters,
    toggleLocation,
    searchTerm,
    setSearchTerm,
    tagOptions,
    sourceOptions,
    locationOptions,
    loading,
    error,
    warning,
    refetch: load,
  };
}
