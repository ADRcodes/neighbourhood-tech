import React, { cloneElement, useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { useSupabaseSession, signOut } from "../lib/auth/supabase.jsx";
import { supabase } from "../lib/supabase/client";
import ColorPaletteModalPro from "./ColorPalettePopover";
const cx = (...xs) => xs.filter(Boolean).join(" ");

const Icons = {
  Home: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M3 10.5 12 3l9 7.5v9a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 19.5v-9Z" stroke="currentColor" strokeWidth="1.6" /><path d="M9 21v-6a3 3 0 0 1 6 0v6" stroke="currentColor" strokeWidth="1.6" /></svg>),
  Search: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" /><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>),
  Plus: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>),
  Saved: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M6.5 3.5h11a1.5 1.5 0 0 1 1.5 1.5v15l-7-4-7 4V5a1.5 1.5 0 0 1 1.5-1.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>),
  User: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" /><path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>),
  Info: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="M12 8v.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M11.5 12.5h1v4h-1z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>),
};

function NavItem({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cx(
          "flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
          isActive ? "text-primary" : "text-text-muted hover:text-text"
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cx(
              "grid h-9 w-9 place-items-center rounded-full border transition-all",
              isActive
                ? "bg-primary/10 border-primary/30"
                : "bg-transparent border-transparent"
            )}
          >
            {cloneElement(icon, {
              className: cx("h-5 w-5", isActive ? "text-primary" : "text-text-muted"),
            })}
          </span>
          <span className="leading-none">{label}</span>
        </>
      )}
    </NavLink>
  );
}

const NavButton = React.forwardRef(function NavButton(
  { label, icon, onClick, disabled, active },
  ref
) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      ref={ref}
      className={cx(
        "flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors w-full",
        disabled ? "text-text-muted/70" : active ? "text-primary" : "text-text-muted hover:text-text"
      )}
    >
      <span
        className={cx(
          "grid h-9 w-9 place-items-center rounded-full border transition-all",
          active ? "bg-primary/10 border-primary/30" : "bg-transparent border-transparent"
        )}
      >
        {cloneElement(icon, {
          className: cx("h-5 w-5", active ? "text-primary" : "text-text-muted"),
        })}
      </span>
      <span className="leading-none">{label}</span>
    </button>
  );
});

export default function BottomNav() {
  const hasSupabase = Boolean(supabase);
  const { user, ready } = useSupabaseSession();
  const [signingOut, setSigningOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

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
        menuRef.current &&
        triggerRef.current &&
        !menuRef.current.contains(event.target) &&
        !triggerRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
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
    if (!user) setMenuOpen(false);
  }, [user]);

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50">
      <div className="relative mx-auto w-full max-w-screen-sm px-4 pb-[max(env(safe-area-inset-bottom),12px)]">
        <div className="relative h-16 rounded-2xl bg-surface/92 backdrop-blur-xl shadow-[0_22px_45px_-26px_rgba(16,24,40,0.65)] border border-brand-200/80 text-text">
          <div className="grid grid-cols-5 h-full">
            <NavItem to="/" label="Home" icon={<Icons.Home />} />
            <NavItem to="/saved" label="Saved" icon={<Icons.Saved />} />
            <div className="relative">
              <NavLink
                to="/register"
                aria-label="Create event"
                className="absolute left-1/2 -translate-x-1/2 -top-2 inline-flex h-14 w-14 items-center justify-center rounded-full shadow-xl border border-primary bg-primary text-onprimary active:scale-95 transition"
              >
                <Icons.Plus className="h-7 w-7" />
              </NavLink>
            </div>
            <NavItem to="/about" label="About" icon={<Icons.Info />} />
            {!hasSupabase ? (
              <NavItem to="/auth" label="Sign in" icon={<Icons.User />} />
            ) : !ready ? (
              <NavButton label="Loading" icon={<Icons.User />} disabled onClick={() => { }} />
            ) : user ? (
              <div className="relative flex align-middle">
                <NavButton
                  label="More"
                  icon={<Icons.User />}
                  onClick={() => setMenuOpen((prev) => !prev)}
                  active={menuOpen}
                  ref={triggerRef}
                />
                <div
                  ref={menuRef}
                  className={cx(
                    "absolute bottom-[calc(100%+12px)] right-[70px] translate-x-1/2 w-max rounded-2xl border border-brand-200/60 bg-surface shadow-[0_24px_40px_-28px_rgba(16,24,40,0.7)] p-3",
                    "origin-bottom transition-all duration-200 ease-out",
                    menuOpen
                      ? "opacity-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 translate-y-2 pointer-events-none"
                  )}
                  style={{ willChange: "transform, opacity" }}
                >
                  <ColorPaletteModalPro />
                  <NavLink
                    to="/me"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-text hover:bg-primary/5"
                  >
                    {/* <Icons.User className="h-4 w-4" /> */}
                    Profile
                  </NavLink>

                  <button
                    type="button"
                    className={cx(
                      "w-full rounded-full px-3 py-2 text-sm font-semibold transition-colors",
                      signingOut ? "text-text-muted cursor-wait" : "text-primary hover:bg-primary/10"
                    )}
                    onClick={() => {
                      setMenuOpen(false);
                      handleSignOut();
                    }}
                    disabled={signingOut}
                  >
                    {signingOut ? "Signing out…" : "Sign out"}
                  </button>
                </div>
              </div>
            ) : (
              <NavItem to="/auth" label="Sign in" icon={<Icons.User />} />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
