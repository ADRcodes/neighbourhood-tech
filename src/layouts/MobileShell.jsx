// src/layouts/MobileShell.jsx
import { Outlet } from "react-router-dom";
import DesktopNav from "../components/DesktopNav";
import BottomNav from "../components/BottomNav";

export default function MobileShell() {
  return (
    <div className="min-h-dvh bg-gray-50">
      {/* desktop top nav */}
      <DesktopNav />

      {/* leave space: bottom nav on mobile, top bar on desktop */}
      <main className="pb-24 md:pb-0">
        <div className=" mx-auto">
          <Outlet />
        </div>
      </main>

      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
