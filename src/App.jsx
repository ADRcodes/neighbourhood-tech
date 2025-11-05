import { HashRouter as Router, Routes, Route } from "react-router-dom";
import MobileShell from "./layouts/MobileShell";
import Explore from "./pages/Explore";
import Saved from "./pages/Saved";
import Profile from "./pages/Profile";
import RegisterEventForm from "./pages/RegisterEventForm";
import Unauthenticated from "./pages/Unauthenticated";
import HomeShell from "./pages/HomeShell";
import About from "./pages/About";

function App() {
  return (
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
          <Route path="register" element={<RegisterEventForm />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
