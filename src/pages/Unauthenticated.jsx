import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NetworkingStock from "../assets/NetworkingStock.jpg";
import NTlogo from "../assets/NTlogo.png";
import { signInWithPassword, signUpWithPassword } from "../lib/auth/supabase.jsx";
import { supabase } from "../lib/supabase/client";

const OAUTH_PROVIDERS = [
  { id: "google", label: "Continue with Google", icon: "G" },
  { id: "github", label: "Continue with GitHub", icon: "GH" },
  { id: "apple", label: "Continue with Apple", icon: "" },
];

export default function Unauthenticated() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const ensureSupabase = () => {
    if (!supabase) {
      setError("Supabase is not configured. Set VITE_SUPABASE_URL + VITE_SUPABASE_PUBLIC_KEY.");
      return false;
    }
    return true;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailPassword = async () => {
    if (!ensureSupabase()) return;
    setStatus(mode === "login" ? "Logging in…" : "Creating account…");
    setError("");
    try {
      if (mode === "login") {
        await signInWithPassword({ email: formData.email, password: formData.password });
      } else {
        await signUpWithPassword({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        });
      }
      navigate("/");
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setStatus("");
    }
  };

  const handleOAuth = async (provider) => {
    if (!ensureSupabase()) return;
    setError("");
    setStatus(`Redirecting to ${provider}…`);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
          flow: "pkce",
        },
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      console.error("OAuth error:", err);
      setError(err.message || "Unable to start sign-in");
      setStatus("");
    }
  };

  const disabled = !supabase || Boolean(status);

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    setStatus("");
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 py-10 md:py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-8 rounded-[32px] border border-brand-200/70 bg-surface/80 p-5 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.9)] backdrop-blur-2xl md:grid-cols-[1.1fr_0.9fr] md:p-10">
        <section className="rounded-[28px] bg-gradient-to-br from-brand-400/90 via-brand-300/70 to-accent/80 p-8 text-onprimary shadow-[0_20px_60px_-40px_rgba(15,23,42,0.9)]">
          <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-onprimary/80">
            <img src={NTlogo} alt="Out & About Events" className="h-12 w-12 rounded-2xl border border-white/30 bg-white/20 p-2" />
            Out &amp; About Events
          </div>
          <div className="mt-8 space-y-4">
            <h1 className="text-3xl font-bold leading-tight md:text-4xl">
              Create, discover, and share events around your city.
            </h1>
            <p className="text-onprimary/80 md:text-lg">
              Build community through curated programming, token-driven design, and Supabase-backed auth.
            </p>
          </div>
          <div className="mt-8 overflow-hidden rounded-3xl border border-white/20">
            <img
              src={NetworkingStock}
              alt="Networking meetup"
              className="h-64 w-full object-cover"
              loading="lazy"
            />
          </div>
        </section>

        <section className="flex flex-col rounded-[28px] border border-brand-200/70 bg-surface/95 p-6 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.85)]">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">{mode === "login" ? "Welcome back" : "Join Out & About Events"}</p>
            <h2 className="text-2xl font-semibold text-text">{mode === "login" ? "Sign in to Out & About Events" : "Create your account"}</h2>
            <p className="text-sm text-text-muted">
              {supabase ? "Use email or keep going with a provider." : "Auth is offline — missing Supabase env vars."}
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {error && <p className="rounded-2xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
            {status && <p className="rounded-2xl border border-brand-200 bg-brand-100/70 px-3 py-2 text-sm text-text">{status}</p>}
          </div>

          <div className="mt-6 space-y-3">
            {mode === "register" && (
              <div className="space-y-1">
                <label htmlFor="name" className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
                  Display name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Alex, Riley, …"
                  className="w-full rounded-2xl border border-brand-200/70 bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={disabled}
                />
              </div>
            )}
            <div className="space-y-1">
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-brand-200/70 bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.email}
                onChange={handleChange}
                disabled={disabled}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="w-full rounded-2xl border border-brand-200/70 bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.password}
                onChange={handleChange}
                disabled={disabled}
              />
            </div>

            <button
              type="button"
              onClick={handleEmailPassword}
              disabled={disabled}
              className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-onprimary shadow-[0_18px_40px_-24px_rgba(220,73,102,0.8)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mode === "login" ? "Sign in" : "Create account"}
            </button>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-text-muted">
              <span className="h-px flex-1 bg-brand-200/60" />
              <span>Or continue with</span>
              <span className="h-px flex-1 bg-brand-200/60" />
            </div>
            <div className="grid gap-2">
              {OAUTH_PROVIDERS.map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => handleOAuth(provider.id)}
                  disabled={disabled}
                  className="inline-flex w-full items-center justify-between rounded-2xl border border-brand-200/80 bg-surface px-4 py-3 text-sm font-semibold text-text shadow-[0_12px_30px_-24px_rgba(15,23,42,0.7)] transition hover:border-brand-300/80 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="inline-flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-100/70 text-sm font-bold text-text">
                      {provider.icon}
                    </span>
                    {provider.label}
                  </span>
                  <span aria-hidden className="text-lg text-text-muted">
                    →
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-6 text-center text-sm text-text-muted">
            {mode === "login" ? (
              <>
                Need an account?{" "}
                <button
                  type="button"
                  className="font-semibold text-text underline-offset-4 hover:underline"
                  onClick={() => changeMode("register")}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="font-semibold text-text underline-offset-4 hover:underline"
                  onClick={() => changeMode("login")}
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
