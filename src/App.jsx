import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Footer from "./components/Footer";
import Nav from "./components/Nav";
import Home from "./pages/Home";
import Unauthenticated from "./pages/Unauthenticated";
import RegisterEventForm from "./pages/RegisterEventForm";
import EventCarousel from "./components/EventCarousel";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Unauthenticated />} />
        <Route path="home" element={<Home />} />
        <Route path="/unauthenticated" element={<Unauthenticated />} />
        <Route path="/register" element={<RegisterEventForm />} />
      </Routes>
    </Router>
  
  );
}

export default App;

