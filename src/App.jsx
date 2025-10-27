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
        {/* unauthenticated route sits outside the shell */}
        <Route path="/" element={<Unauthenticated />} />
        {/* all “tabbed” pages share the shell + bottom nav */}
        <Route element={<MobileShell />}>
          <Route path="/home" element={<HomeShell />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/me" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="/register" element={<RegisterEventForm />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
