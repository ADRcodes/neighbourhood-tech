import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSupabaseSession } from "../auth/supabase.jsx";
import { supabase } from "../supabase/client";
import { listSavedEvents, upsertSavedEvent, deleteSavedEvent } from "../api/supabase";
import { mapSupabaseEvent } from "../api/events";
import { coerceEvent } from "../api/normalize";

const SavedEventsContext = createContext(null);

function normalizeRows(rows) {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row) => {
      if (!row?.event) return null;
      const normalized = coerceEvent(mapSupabaseEvent(row.event));
      return { event: normalized, status: row.status || "interested" };
    })
    .filter(Boolean);
}

export function SavedEventsProvider({ children }) {
  const hasSupabase = Boolean(supabase);
  const { user, ready } = useSupabaseSession();
  const userId = user?.id ?? null;
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!userId || !hasSupabase) {
      setEntries([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const rows = await listSavedEvents(userId);
      setEntries(normalizeRows(rows));
    } catch (err) {
      console.error("Failed to load saved events", err);
      setError(err.message || "Unable to load saved events");
    } finally {
      setLoading(false);
    }
  }, [userId, hasSupabase]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!userId) {
      setEntries([]);
    }
  }, [userId]);

  const updateStatus = useCallback(
    async (eventId, status) => {
      if (!userId || !hasSupabase) return;
      await upsertSavedEvent({ userId, eventId, status });
      setEntries((prev) =>
        prev.map((entry) =>
          entry.event.id === eventId ? { ...entry, status } : entry
        )
      );
    },
    [userId, hasSupabase]
  );

  const removeSaved = useCallback(
    async (eventId) => {
      if (!userId || !hasSupabase) return;
      await deleteSavedEvent({ userId, eventId });
      setEntries((prev) => prev.filter((entry) => entry.event.id !== eventId));
    },
    [userId, hasSupabase]
  );

  const value = useMemo(
    () => ({
      entries,
      loading,
      error,
      refresh: load,
      updateStatus,
      removeSaved,
      user,
      ready,
      hasSupabase,
    }),
    [entries, loading, error, load, updateStatus, removeSaved, user, ready, hasSupabase]
  );

  return <SavedEventsContext.Provider value={value}>{children}</SavedEventsContext.Provider>;
}

export function useSavedEvents() {
  const context = useContext(SavedEventsContext);
  if (!context) {
    throw new Error("useSavedEvents must be used within a SavedEventsProvider");
  }
  return context;
}
