import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import ColorPaletteModalPro from "./ColorPalettePopover";
import { useSupabaseSession, signOut } from "../lib/auth/supabase.jsx";
import { supabase } from "../lib/supabase/client";

const cx = (...xs) => xs.filter(Boolean).join(" ");

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/saved", label: "Saved" },
  { to: "/calendar", label: "Calendar" },
  { to: "/about", label: "About" },
  { to: "/register", label: "Add Event", accent: true },
];

const ACCOUNT_LINKS = [
  { to: "/me", label: "Profile" },
  { to: "/saved", label: "Saved" },
];

function Tab({ to, children, accent, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cx(
          "px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ease-out",
          accent
            ? "bg-brand-complement text-oncomplement shadow-md shadow-primary/40 hover:opacity-65"
            : isActive
              ? "bg-primary text-onprimary shadow-md shadow-primary/40"
              : "text-text-muted hover:text-text/40"
        )
      }
      end
    >
      {({ isActive }) => (
        <span
          className={cx(
            "relative flex items-center gap-1 will-change-transform",
            !accent && isActive && "translate-y-[-1px]"
          )}
        >
          {icon ? <span className="text-base leading-none">{icon}</span> : null}
          {children}
        </span>
      )}
    </NavLink>
  );
}

export default function DesktopNav() {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [showTabs, setShowTabs] = useState(true);
  const accountTriggerRef = useRef(null);
  const accountMenuRef = useRef(null);
  const accountMenuId = "desktop-nav-account-menu";
  const { user, ready } = useSupabaseSession();
  const [signingOut, setSigningOut] = useState(false);
  const hasSupabase = Boolean(supabase);

  const handleSignOut = async () => {
    if (!hasSupabase || signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to sign out", error);
    } finally {
      setSigningOut(false);
    }
  };

  useEffect(() => {
    const handleClick = (event) => {
      if (
        accountMenuRef.current &&
        accountTriggerRef.current &&
        !accountMenuRef.current.contains(event.target) &&
        !accountTriggerRef.current.contains(event.target)
      ) {
        setAccountMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
      }
    };

    window.addEventListener("click", handleClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setAccountMenuOpen(false);
    }
  }, [user]);

  useEffect(() => {
    const tabThreshold = window.matchMedia("(min-width: 900px)");

    const syncTabs = (event) => setShowTabs(event.matches);

    syncTabs(tabThreshold);

    tabThreshold.addEventListener("change", syncTabs);

    return () => {
      tabThreshold.removeEventListener("change", syncTabs);
    };
  }, []);

  return (
    <header className="hidden md:block sticky top-2 z-50">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between gap-6 rounded-full border border-brand-200/70 bg-surface/85 backdrop-blur-xl shadow-[0_18px_40px_-24px_rgba(16,24,40,0.55)] px-6 py-3 text-text">
          {/* Left: Logo / brand */}
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-2xl bg-primary text-onprimary grid place-items-center font-semibold shadow-[0_8px_20px_-12px_rgba(220,73,102,0.9)] transition-transform will-change-transform group-hover:scale-105">
              NT
            </div>
            <div className="flex flex-col">
              <span className="text-sm uppercase tracking-[0.25em] text-text-muted">Neighbourhood</span>
              <span className="-mt-1 text-lg font-semibold group-hover:text-primary transition-colors">Tech</span>
            </div>
          </NavLink>

          {/* Center: Tabs */}
          {showTabs && (
            <nav
              aria-label="Primary"
              className="hidden md:flex items-center gap-1 rounded-full border border-brand-200/60 bg-surface/95 px-1 py-1 shadow-inner"
            >
              {LINKS.map((link) => (
                <Tab key={link.to} to={link.to} accent={link.accent} icon={link.icon}>
                  {link.label}
                </Tab>
              ))}
            </nav>
          )}

          {/* Right: Theme + Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <ColorPaletteModalPro />
            </div>

            {!hasSupabase ? (
              <NavLink
                to="/auth"
                className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text transition-colors"
              >
                <div className="h-9 w-9 rounded-full border border-brand-200/70 bg-surface/80 grid place-items-center shadow-[0_10px_24px_-16px_rgba(16,24,40,0.45)]">
                  <span className="text-lg">👤</span>
                </div>
                <span>Sign in</span>
              </NavLink>
            ) : !ready ? (
              <div className="text-xs font-semibold text-text-muted px-3">Checking session…</div>
            ) : user ? (
              <div className="relative">
                <button
                  type="button"
                  ref={accountTriggerRef}
                  onClick={() => setAccountMenuOpen((prev) => !prev)}
                  aria-haspopup="true"
                  aria-expanded={accountMenuOpen}
                  aria-controls={accountMenuId}
                  className={cx(
                    "inline-flex items-center gap-2 rounded-full border border-brand-200/70 bg-surface px-1.5 py-1 pr-3 text-left shadow-[0_10px_24px_-20px_rgba(16,24,40,0.6)] transition",
                    "hover:border-primary/60 hover:text-primary",
                    accountMenuOpen && "border-primary/60 text-primary"
                  )}
                >
                  <span className="sr-only">Toggle account menu</span>
                  <div className="h-9 w-9 rounded-full bg-primary/15 text-primary grid place-items-center font-semibold">
                    {(user.user_metadata?.full_name || user.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <svg
                    className={cx(
                      "h-4 w-4 transition-transform duration-200",
                      accountMenuOpen && "rotate-180"
                    )}
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 7l5 5 5-5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <div
                  id={accountMenuId}
                  ref={accountMenuRef}
                  role="menu"
                  aria-hidden={!accountMenuOpen}
                  className={cx(
                    "absolute right-0 mt-3 w-max overflow-hidden rounded-2xl border border-brand-200/70 bg-surface shadow-[0_20px_46px_-24px_rgba(16,24,40,0.55)] ring-1 ring-black/5 origin-top-right transition-all duration-200 ease-out",
                    accountMenuOpen
                      ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                      : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
                  )}
                  style={{ willChange: "transform, opacity" }}
                >
                  {!showTabs && (
                    <div className="py-1 border-b border-brand-200/60">
                      {LINKS.map((link) => (
                        <NavLink
                          key={link.to}
                          to={link.to}
                          role="menuitem"
                          onClick={() => setAccountMenuOpen(false)}
                          className={({ isActive }) =>
                            cx(
                              "flex items-center gap-2 px-4 py-2 text-sm transition-colors",
                              isActive
                                ? "text-primary font-semibold"
                                : "text-text-muted hover:text-text hover:bg-primary/5"
                            )
                          }
                        >
                          {link.icon ? <span className="text-base">{link.icon}</span> : null}
                          {link.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                  <div className="py-1">
                    {ACCOUNT_LINKS.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        role="menuitem"
                        onClick={() => setAccountMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-text-muted hover:text-text hover:bg-primary/5 transition-colors"
                      >
                        {item.label}
                      </NavLink>
                    ))}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        handleSignOut();
                      }}
                      disabled={signingOut}
                      className={cx(
                        "w-full text-left px-4 py-2 text-sm font-semibold transition-colors",
                        signingOut
                          ? "text-text-muted cursor-wait"
                          : "text-primary hover:bg-primary/10"
                      )}
                    >
                      {signingOut ? "Signing out…" : "Sign out"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <NavLink
                to="/auth"
                className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text transition-colors"
              >
                <div className="h-9 w-9 rounded-full border border-brand-200/70 bg-surface/80 grid place-items-center shadow-[0_10px_24px_-16px_rgba(16,24,40,0.45)]">
                  <span className="text-lg">👤</span>
                </div>
                <span>Sign in</span>
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
