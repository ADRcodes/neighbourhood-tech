import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import ColorPaletteModalPro from "./ColorPalettePopover";


const cx = (...xs) => xs.filter(Boolean).join(" ");

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/explore", label: "Explore" },
  { to: "/saved", label: "Saved" },
  { to: "/about", label: "About" },
];

function MenuToggleIcon({ open }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5 will-change-transform transition-transform duration-200"
      aria-hidden="true"
    >
      {open ? (
        <>
          <path
            d="M6 6l12 12"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M18 6L6 18"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <path
            d="M4 7h16"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M4 12h16"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M4 17h16"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

function Tab({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cx(
          "px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ease-out",
          isActive
            ? "bg-primary text-onprimary shadow-md shadow-primary/40"
            : "text-text-muted hover:text-text"
        )
      }
      end
    >
      {({ isActive }) => (
        <span
          className={cx(
            "relative flex items-center gap-1 will-change-transform",
            isActive && "translate-y-[-1px]"
          )}
        >
          {children}
        </span>
      )}
    </NavLink>
  );
}

export default function DesktopNav() {
  const [compactMenuOpen, setCompactMenuOpen] = useState(false);
  const [showTabs, setShowTabs] = useState(true);
  const compactTriggerRef = useRef(null);
  const compactMenuRef = useRef(null);
  const compactMenuId = "desktop-nav-compact-menu";

  useEffect(() => {
    const handleClick = (event) => {
      if (
        compactMenuRef.current &&
        compactTriggerRef.current &&
        !compactMenuRef.current.contains(event.target) &&
        !compactTriggerRef.current.contains(event.target)
      ) {
        setCompactMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setCompactMenuOpen(false);
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
    const tabThreshold = window.matchMedia("(min-width: 1100px)");

    const syncTabs = (event) => setShowTabs(event.matches);

    syncTabs(tabThreshold);

    tabThreshold.addEventListener("change", syncTabs);

    return () => {
      tabThreshold.removeEventListener("change", syncTabs);
    };
  }, []);

  useEffect(() => {
    if (showTabs) {
      setCompactMenuOpen(false);
    }
  }, [showTabs]);

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
                <Tab key={link.to} to={link.to}>
                  {link.label}
                </Tab>
              ))}
            </nav>
          )}

          {/* Right: Theme + Actions */}
          <div className="flex items-center gap-3">
            {showTabs ? (
              <div className="hidden md:block">
                <ColorPaletteModalPro />
              </div>
            ) : (
              <div className="relative">
                <button
                  ref={compactTriggerRef}
                  type="button"
                  onClick={() => setCompactMenuOpen((prev) => !prev)}
                  aria-haspopup="true"
                  aria-controls={compactMenuId}
                  aria-expanded={compactMenuOpen}
                  className={cx(
                    "inline-flex items-center gap-2 rounded-full border border-brand-200/60 bg-surface px-3 py-2 text-sm font-semibold text-text transition-colors duration-150 ease-out will-change-transform",
                    "hover:border-brand-200 hover:text-primary hover:bg-surface/95",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
                    compactMenuOpen && "border-primary/50 text-primary shadow-[0_16px_28px_-18px_rgba(220,73,102,0.3)]"
                  )}
                >
                  <MenuToggleIcon open={compactMenuOpen} />
                  <span>Menu</span>
                </button>
                {compactMenuOpen && (
                  <div
                    id={compactMenuId}
                    ref={compactMenuRef}
                    role="menu"
                    className="absolute right-0 mt-3 w-30 overflow-hidden rounded-2xl border border-brand-200/70 bg-surface shadow-[0_20px_46px_-24px_rgba(16,24,40,0.55)] ring-1 ring-black/5"
                  >
                    <div className="py-0">
                      {LINKS.map((link) => (
                        <NavLink
                          key={link.to}
                          to={link.to}
                          role="menuitem"
                          onClick={() => setCompactMenuOpen(false)}
                          className={({ isActive }) =>
                            cx(
                              "block px-4 py-2.5 text-sm transition-colors text-center",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                              isActive
                                ? "bg-primary/10 text-primary font-semibold hover:bg-accent/20"
                                : "text-text-muted hover:text-text hover:bg-accent/30"
                            )
                          }
                        >
                          {link.label}
                        </NavLink>
                      ))}
                    </div>
                    <div className="border-t border-brand-200/60 px-4 py-3">
                      <div className="text-xs text-center font-semibold uppercase tracking-[0.12em] text-text-muted">
                        Theme
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-text">
                        <ColorPaletteModalPro />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <NavLink
              to="/register"
              className="inline-flex items-center gap-2 rounded-full bg-primary text-onprimary text-sm font-semibold px-4 py-2 shadow-[0_16px_30px_-18px_rgba(220,73,102,0.9)] hover:shadow-[0_18px_36px_-16px_rgba(220,73,102,1)] hover:translate-y-[-1px] active:translate-y-0 transition-transform will-change-transform"
            >
              <span className="text-lg">＋</span>
              <span>Create Event</span>
            </NavLink>

            <NavLink
              to="/me"
              className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text transition-colors"
            >
              <div className="h-9 w-9 rounded-full border border-brand-200/70 bg-surface/80 grid place-items-center shadow-[0_10px_24px_-16px_rgba(16,24,40,0.45)]">
                <span className="text-lg">👤</span>
              </div>
              <span>Profile</span>
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  );
}
