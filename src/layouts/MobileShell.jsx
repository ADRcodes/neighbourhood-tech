// src/layouts/MobileShell.jsx
import { Outlet } from "react-router-dom";
import DesktopNav from "../components/DesktopNav";
import BottomNav from "../components/BottomNav";
import GlobalLoadingGate from "../components/GlobalLoadingGate";
import { EventsProvider } from "../lib/context/EventsProvider";
import { SavedEventsProvider } from "../lib/context/SavedEventsProvider";

export default function MobileShell() {
  return (
    <div className="min-h-dvh bg-gray-50">
      {/* desktop top nav */}
      <DesktopNav />

      {/* leave space: bottom nav on mobile, top bar on desktop */}
      <EventsProvider>
        <SavedEventsProvider>
          <GlobalLoadingGate />
          <main className="pb-[var(--bottom-nav-space)] md:pb-0">
            <div className=" mx-auto">
              <Outlet />
            </div>
          </main>
        </SavedEventsProvider>
      </EventsProvider>

      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
