import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import { useSupabaseSession } from "../auth/supabase.jsx";
import {
  deleteSavedEvent,
  listEventPreferences,
  upsertSavedEvent,
} from "../api/supabase";
import { normalizeEventId } from "../utils/ids";

const AUTH_REQUIRED_ERROR = "AUTH_REQUIRED";

export function useEventPreferences() {
  const { user } = useSupabaseSession();
  const [statusByEvent, setStatusByEvent] = useState({});
  const [loading, setLoading] = useState(false);
  const userId = user?.id ?? null;

  const load = useCallback(async () => {
    if (!supabase || !userId) {
      setStatusByEvent({});
      return;
    }
    setLoading(true);
    try {
      const rows = await listEventPreferences(userId);
      const next = {};
      rows.forEach((row) => {
        if (row.event_id) {
          next[row.event_id] = row.status || "interested";
        }
      });
      setStatusByEvent(next);
    } catch (error) {
      console.error("Failed to load event preferences", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const setPreference = useCallback(
    async (eventId, status, normalizedId) => {
      if (!supabase) {
        throw new Error("Supabase is not configured");
      }
      if (!userId) {
        const err = new Error("Sign in required");
        err.code = AUTH_REQUIRED_ERROR;
        throw err;
      }
      const targetId = normalizedId ?? normalizeEventId(eventId);
      if (!targetId) return;

      if (!status) {
        await deleteSavedEvent({ userId, eventId: targetId });
        setStatusByEvent((prev) => {
          const next = { ...prev };
          delete next[targetId];
          return next;
        });
        return;
      }

      await upsertSavedEvent({ userId, eventId: targetId, status });
      setStatusByEvent((prev) => ({ ...prev, [targetId]: status }));
    },
    [userId]
  );

  return {
    statusByEvent,
    setPreference,
    loading,
    ready: Boolean(supabase),
    AUTH_REQUIRED_ERROR,
  };
}
