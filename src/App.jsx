import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Footer from "./components/Footer";
// import Nav from "./components/Nav";
import Home from "./pages/Home";
import Unauthenticated from "./pages/Unauthenticated";
import RegisterEventForm from "./pages/RegisterEventForm";
import Home2 from "./pages/Home2";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Unauthenticated />} />
        <Route path="home" element={<Home />} />
        <Route path="home2" element={<Home2 />} />
        <Route path="/unauthenticated" element={<Unauthenticated />} />
        <Route path="/register" element={<RegisterEventForm />} />
      </Routes>
    </Router>
  );
}

export default App;
