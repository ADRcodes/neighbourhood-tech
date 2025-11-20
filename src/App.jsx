import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MobileShell from "./layouts/MobileShell";
import Explore from "./pages/Explore";
import Saved from "./pages/Saved";
import Profile from "./pages/Profile";
import RegisterEventForm from "./pages/RegisterEventForm";
import Unauthenticated from "./pages/Unauthenticated";
import HomeShell from "./pages/HomeShell";
import About from "./pages/About";
import ColorAbout from "./pages/ColorAbout";
import { SupabaseSessionProvider } from "./lib/auth/supabase.jsx";
import { supabase } from "./lib/supabase/client";

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function boot() {
      if (typeof window === "undefined") return;
      const url = new URL(window.location.href);
      if (url.searchParams.has("code")) {
        try {
          await supabase.auth.exchangeCodeForSession(url.toString());
        } catch (err) {
          console.error("Supabase bootstrap exchange failed", err);
        } finally {
          url.searchParams.delete("code");
          url.searchParams.delete("state");
          window.history.replaceState({}, document.title, `${url.origin}${url.pathname}`);
        }
      }
      setReady(true);
    }

    boot();
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <SupabaseSessionProvider>
      <Router>
        <Routes>
        {/* auth screen is optional; homepage stays public */}
        <Route path="/auth" element={<Unauthenticated />} />
          {/* all “tabbed” pages share the shell + bottom nav */}
          <Route path="/" element={<MobileShell />}>
            <Route index element={<HomeShell />} />
            <Route path="explore" element={<Explore />} />
            <Route path="saved" element={<Saved />} />
            <Route path="me" element={<Profile />} />
            <Route path="about" element={<About />} />
            <Route path="color-about" element={<ColorAbout />} />
            <Route path="register" element={<RegisterEventForm />} />
          </Route>
        </Routes>
      </Router>
    </SupabaseSessionProvider>
  );
}

export default App;
