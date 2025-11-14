import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  listSavedEvents,
  deleteSavedEvent,
  upsertSavedEvent,
} from "../lib/api/supabase";
import { mapSupabaseEvent } from "../lib/api/events";
import { coerceEvent } from "../lib/api/normalize";
import { useSupabaseSession } from "../lib/auth/supabase.jsx";
import { supabase } from "../lib/supabase/client";

const STATUS_OPTIONS = [
  { value: "going", label: "Going" },
  { value: "interested", label: "Interested" },
  { value: "not_interested", label: "Not interested" },
];

const STATUS_BADGE_STYLES = {
  going: "bg-success/15 text-success border-success/30",
  interested: "bg-warning/15 text-warning border-warning/30",
  not_interested: "bg-text/10 text-text-muted border-text/15",
};

const Saved = () => {
  const navigate = useNavigate();
  const hasSupabase = Boolean(supabase);
  const { user, ready } = useSupabaseSession();
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(null);
  const [error, setError] = useState("");
  const [entries, setEntries] = useState([]);

  const load = useCallback(async () => {
    if (!user) {
      setEntries([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const rows = await listSavedEvents(user.id);
      const mapped = rows
        .map((row) => {
          if (!row.event) return null;
          const normalized = coerceEvent(mapSupabaseEvent(row.event));
          return { event: normalized, status: row.status || "interested" };
        })
        .filter(Boolean);
      setEntries(mapped);
    } catch (err) {
      console.error("Failed to load saved events", err);
      setError(err.message || "Unable to load saved events");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusChange = useCallback(async (eventId, status) => {
    if (!user) return;
    setPending(`${eventId}:${status}`);
    setError("");
    try {
      await upsertSavedEvent({ userId: user.id, eventId, status });
      await load();
    } catch (err) {
      console.error("Failed to update", err);
      setError(err.message || "Unable to update status");
    } finally {
      setPending(null);
    }
  }, [load, user]);

  const handleRemove = useCallback(async (eventId) => {
    if (!user) return;
    setPending(`delete:${eventId}`);
    setError("");
    try {
      await deleteSavedEvent({ userId: user.id, eventId });
      await load();
    } catch (err) {
      console.error("Failed to remove saved event", err);
      setError(err.message || "Unable to remove event");
    } finally {
      setPending(null);
    }
  }, [load, user]);

  const content = useMemo(() => {
    if (!hasSupabase) {
      return (
        <div className="rounded-2xl border border-brand-200 bg-surface p-4 text-sm text-text">
          Supabase is not configured. Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your env to enable saved events.
        </div>
      );
    }

    if (!ready || loading) {
      return <p className="text-sm text-text-muted">Loading your saved events…</p>;
    }

    if (!user) {
      return (
        <div className="space-y-3 text-sm text-text">
          <p>You need an account to save events.</p>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-semibold text-onprimary hover:opacity-95"
            onClick={() => navigate("/auth")}
          >
            Sign in to manage saved events
          </button>
        </div>
      );
    }

    if (!entries.length) {
      return <p className="text-sm text-text-muted">No saved events yet.</p>;
    }

    return (
      <div className="space-y-4">
        {entries.map(({ event, status }) => {
          const formattedDate = event.date
            ? new Date(event.date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Date TBA";
          const statusClasses = STATUS_BADGE_STYLES[status] || STATUS_BADGE_STYLES.interested;
          return (
            <div
              key={event.id}
              className="rounded-3xl border border-brand-200 bg-surface/95 p-4 shadow-[0_8px_32px_-24px_rgba(15,23,42,0.85)]"
            >
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <p className="text-xs text-text-muted">{formattedDate}</p>
                    <h3 className="text-lg font-semibold text-text">{event.title}</h3>
                    {event.venue?.name && (
                      <p className="text-sm text-text-muted">📍 {event.venue.name}</p>
                    )}
                  </div>
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses}`}>
                    {STATUS_OPTIONS.find((opt) => opt.value === status)?.label || "Interested"}
                  </span>
                </div>
                <p className="text-sm text-text-muted line-clamp-2">{event.description || "More details coming soon."}</p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleStatusChange(event.id, opt.value)}
                    disabled={pending === `${event.id}:${opt.value}`}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                      status === opt.value
                        ? "bg-primary text-onprimary border-primary"
                        : "bg-surface text-text border-brand-200/80 hover:bg-primary/10"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleRemove(event.id)}
                  disabled={pending === `delete:${event.id}`}
                  className="ml-auto text-xs font-semibold text-danger hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }, [entries, hasSupabase, handleRemove, handleStatusChange, loading, navigate, pending, ready, user]);

  return (
    <div className="px-4 py-6 space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Library</p>
        <h1 className="text-2xl font-bold text-text">Saved events</h1>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      {content}
    </div>
  );
};

export default Saved;
