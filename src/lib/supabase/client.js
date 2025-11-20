import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublicKey =
  import.meta.env.VITE_SUPABASE_PUBLIC_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabasePublicKey) {
  console.warn(
    "Supabase environment variables are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLIC_KEY (or legacy VITE_SUPABASE_ANON_KEY)."
  );
}

const storage = typeof window !== "undefined" ? window.localStorage : undefined;

export const supabase =
  supabaseUrl && supabasePublicKey
    ? createClient(supabaseUrl, supabasePublicKey, {
      auth: {
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
        flowType: "pkce",
        storage,
      },
    })
    : null;

if (typeof window !== "undefined" && supabase) {
  window.supabaseClient = supabase;
}

export function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase client is not configured");
  }
  return supabase;
}
