import React, { cloneElement } from "react";
import { NavLink } from "react-router-dom";
const cx = (...xs) => xs.filter(Boolean).join(" ");

const Icons = {
  Home: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M3 10.5 12 3l9 7.5v9a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 19.5v-9Z" stroke="currentColor" strokeWidth="1.6" /><path d="M9 21v-6a3 3 0 0 1 6 0v6" stroke="currentColor" strokeWidth="1.6" /></svg>),
  Search: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" /><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>),
  Plus: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>),
  Saved: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M6.5 3.5h11a1.5 1.5 0 0 1 1.5 1.5v15l-7-4-7 4V5a1.5 1.5 0 0 1 1.5-1.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>),
  User: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" /><path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>),
};

function NavItem({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cx(
          "flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
          isActive ? "text-indigo-600" : "text-gray-500 hover:text-gray-700"
        )
      }
    >
      {({ isActive }) => (
        <>
          {cloneElement(icon, {
            className: cx("h-6 w-6", isActive ? "text-indigo-600" : "text-gray-500"),
          })}
          <span className="leading-none">{label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50">
      <div className="relative mx-auto w-full max-w-screen-sm px-4 pb-[max(env(safe-area-inset-bottom),12px)]">
        <div className="relative h-16 rounded-2xl bg-white/95 backdrop-blur shadow-lg border border-gray-200">
          <div className="grid grid-cols-5 h-full">
            <NavItem to="/home2" label="Home" icon={<Icons.Home />} />
            <NavItem to="/explore" label="Explore" icon={<Icons.Search />} />
            <div className="relative">
              <NavLink
                to="/register"
                aria-label="Create event"
                className="absolute left-1/2 -translate-x-1/2 -top-2 inline-flex h-14 w-14 items-center justify-center rounded-full shadow-xl border bg-indigo-600 text-white border-indigo-600 active:scale-95 transition"
              >
                <Icons.Plus className="h-7 w-7" />
              </NavLink>
            </div>
            <NavItem to="/saved" label="Saved" icon={<Icons.Saved />} />
            <NavItem to="/me" label="Profile" icon={<Icons.User />} />
          </div>
        </div>
      </div>
    </nav>
  );
}
