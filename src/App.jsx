import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MobileShell from "./layouts/MobileShell";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Saved from "./pages/Saved";
import Profile from "./pages/Profile";
import RegisterEventForm from "./pages/RegisterEventForm";
import Unauthenticated from "./pages/Unauthenticated";
import HomeShell from "./pages/HomeShell";

function App() {
  return (
    <Router>
      <Routes>
        {/* unauthenticated route sits outside the shell */}
        <Route path="/" element={<Unauthenticated />} />

        {/* all “tabbed” pages share the shell + bottom nav */}
        <Route element={<MobileShell />}>
          <Route path="/home" element={<Home />} />
          <Route path="/home2" element={<HomeShell />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/me" element={<Profile />} />
          <Route path="/register" element={<RegisterEventForm />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
