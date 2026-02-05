import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSupabaseSession, signOut } from "../lib/auth/supabase.jsx";
import { supabase } from "../lib/supabase/client";
import { useSavedEvents } from "../lib/context/SavedEventsProvider";

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

export default function Profile() {
  const navigate = useNavigate();
  const hasSupabase = Boolean(supabase);
  const { user, ready } = useSupabaseSession();
  const { entries, loading, error } = useSavedEvents();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (err) {
      console.error("Failed to sign out", err);
    }
  };

  const displayName = useMemo(() => {
    return user?.user_metadata?.full_name || user?.email || "Your profile";
  }, [user]);

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/15 text-primary grid place-items-center font-semibold text-2xl">
          {user ? (displayName || "U").charAt(0).toUpperCase() : "U"}
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Profile</p>
          <h1 className="text-2xl font-bold text-text">{displayName}</h1>
          {user?.email && <p className="text-sm text-text-muted">{user.email}</p>}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/saved')}
            className="rounded-ful bg-surface px-3 py-2 text-sm font-semibold border border-brand-200/70"
          >
            Saved
          </button>
          {hasSupabase && (
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-full bg-primary text-onprimary text-sm font-semibold px-3 py-2"
            >
              Sign out
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <section>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Saved</p>
        <h2 className="text-lg font-semibold text-text mt-1">Your saved events</h2>

        {!hasSupabase ? (
          <div className="rounded-2xl border border-brand-200 bg-surface p-4 text-sm text-text">
            Supabase is not configured. Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your env to enable saved events.
          </div>
        ) : !ready || loading ? (
          <p className="text-sm text-text-muted">Loading saved events…</p>
        ) : !user ? (
          <div className="space-y-3 text-sm text-text">
            <p>Sign in to see your saved events.</p>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-semibold text-onprimary hover:opacity-95"
              onClick={() => navigate('/auth')}
            >
              Sign in
            </button>
          </div>
        ) : entries.length === 0 ? (
          <p className="text-sm text-text-muted">No saved events yet. Save a few to see them here.</p>
        ) : (
          <div className="space-y-4 mt-3">
            {entries.map(({ event, status }) => (
              <div key={event.id} className="rounded-3xl border border-brand-200 bg-surface/95 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-text-muted">
                      {event.date ? new Date(event.date).toLocaleString() : "Date TBA"}
                    </p>
                    <h3 className="text-lg font-semibold text-text">{event.title}</h3>
                    {event.venue?.name && <p className="text-sm text-text-muted">📍 {event.venue.name}</p>}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_BADGE_STYLES[status] || STATUS_BADGE_STYLES.interested}`}>
                      {STATUS_OPTIONS.find((opt) => opt.value === status)?.label || "Interested"}
                    </span>
                    {event.url ? (
                      <a
                        href={event.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-primary text-onprimary px-3 py-1 text-sm font-semibold"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-sm text-text-muted">No link</span>
                    )}
                  </div>
                </div>
                {event.description && (
                  <p className="mt-3 text-sm text-text-muted line-clamp-2">{event.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
