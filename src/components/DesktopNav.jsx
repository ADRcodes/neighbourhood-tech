import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import ColorPaletteModalPro from "./ColorPalettePopover";


const cx = (...xs) => xs.filter(Boolean).join(" ");

function Tab({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cx(
          "px-3 py-2 text-sm font-medium rounded-md transition-colors",
          isActive
            ? "text-indigo-600"
            : "text-gray-600 hover:text-gray-900"
        )
      }
      end
    >
      {({ isActive }) => (
        <span
          className={cx(
            "relative",
            isActive && "after:absolute after:-bottom-2 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-600"
          )}
        >
          {children}
        </span>
      )}
    </NavLink>
  );
}

export default function DesktopNav() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // optional tiny search that routes to /explore?q=...
  const onSearchKey = (e) => {
    if (e.key === "Enter") {
      const q = e.currentTarget.value.trim();
      navigate(q ? `/explore?q=${encodeURIComponent(q)}` : "/explore");
    }
  };

  return (
    <header className="hidden md:block sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-6">
        <div className="h-16 flex items-center justify-between">
          {/* Left: Logo / brand */}
          <NavLink to="/home2" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white grid place-items-center font-bold">NT</div>
            <span className="text-lg font-semibold text-gray-800 group-hover:text-gray-900">
              Neighbourhood Tech
            </span>
          </NavLink>

          {/* Center: Tabs */}
          <nav aria-label="Primary" className="flex items-center gap-1">
            <Tab to="/home2">Home</Tab>
            <Tab to="/explore">Explore</Tab>
            <Tab to="/saved">Saved</Tab>
            <Tab to="/about">About</Tab>
          </nav>

          {/* Right: Search + Actions */}
          <div className="flex items-center gap-3">
            <ColorPaletteModalPro />
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">⌕</span>
              <input
                type="search"
                defaultValue={params.get("q") || ""}
                onKeyDown={onSearchKey}
                placeholder="Search events…"
                className="w-56 pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-300 bg-white/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <NavLink
              to="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold px-4 py-2 shadow-sm hover:bg-indigo-700 active:scale-[0.99] transition"
            >
              <span>＋</span> Create Event
            </NavLink>

            <NavLink
              to="/me"
              className="ml-1 inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
            >
              <div className="h-8 w-8 rounded-full bg-gray-200 grid place-items-center text-gray-500">👤</div>
              <span>Profile</span>
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  );
}
