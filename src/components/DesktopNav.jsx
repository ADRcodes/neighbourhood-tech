import { NavLink } from "react-router-dom";
import ColorPaletteModalPro from "./ColorPalettePopover";


const cx = (...xs) => xs.filter(Boolean).join(" ");

function Tab({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cx(
          "px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200",
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
            "relative flex items-center gap-1",
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
  return (
    <header className="hidden md:block sticky top-0 z-50 pt-4">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between gap-6 rounded-full border border-brand-200/70 bg-surface/85 backdrop-blur-xl shadow-[0_18px_40px_-24px_rgba(16,24,40,0.55)] px-6 py-3 text-text">
          {/* Left: Logo / brand */}
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-2xl bg-primary text-onprimary grid place-items-center font-semibold shadow-[0_8px_20px_-12px_rgba(220,73,102,0.9)] transition-transform group-hover:scale-105">
              NT
            </div>
            <div className="flex flex-col">
              <span className="text-sm uppercase tracking-[0.25em] text-text-muted">Neighbourhood</span>
              <span className="-mt-1 text-lg font-semibold group-hover:text-primary transition-colors">Tech</span>
            </div>
          </NavLink>

          {/* Center: Tabs */}
          <nav
            aria-label="Primary"
            className="hidden lg:flex items-center gap-1 rounded-full border border-brand-200/60 bg-surface/95 px-1 py-1 shadow-inner"
          >
            <Tab to="/">Home</Tab>
            <Tab to="/explore">Explore</Tab>
            <Tab to="/saved">Saved</Tab>
            <Tab to="/about">About</Tab>
          </nav>

          {/* Right: Theme + Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:block">
              <ColorPaletteModalPro />
            </div>

            <NavLink
              to="/register"
              className="inline-flex items-center gap-2 rounded-full bg-primary text-onprimary text-sm font-semibold px-4 py-2 shadow-[0_16px_30px_-18px_rgba(220,73,102,0.9)] hover:shadow-[0_18px_36px_-16px_rgba(220,73,102,1)] hover:translate-y-[-1px] active:translate-y-0 transition-transform"
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
