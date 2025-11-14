import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { requireSupabase, supabase } from "../supabase/client";

const SessionContext = createContext({ session: null, user: null, ready: !supabase });

export function SupabaseSessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) {
      setChecking(false);
      return undefined;
    }

    let active = true;
    (async () => {
      try {
        // no bootstrap exchange here; handled once in App before provider mounts
        const { data } = await supabase.auth.getSession();
        if (!active) return;
        setSession(data.session ?? null);
      } catch (err) {
        console.error("Supabase session init error", err);
      } finally {
        if (active) setChecking(false);
      }
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
    });

    return () => {
      active = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({ session, user: session?.user ?? null, ready: Boolean(supabase) && !checking }),
    [session, checking]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSupabaseSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSupabaseSession must be used within SupabaseSessionProvider");
  }
  return ctx;
}

function authClient() {
  return requireSupabase().auth;
}

export async function signInWithPassword({ email, password }) {
  const { data, error } = await authClient().signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data.user;
}

export async function signUpWithPassword({ email, password, name }) {
  const { data, error } = await authClient().signUp({
    email,
    password,
    options: {
      data: name ? { full_name: name } : undefined,
    },
  });
  if (error) throw new Error(error.message);
  return data.user;
}

export async function signOut() {
  const { error } = await authClient().signOut();
  if (error) throw new Error(error.message);
}
