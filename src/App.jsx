import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Footer from "./components/Footer";
import Nav from "./components/Nav";
import Home from "./pages/Home";
import Unauthenticated from "./pages/Unauthenticated";
import RegisterEventForm from "./pages/RegisterEventForm";

function App() {
  return (
    <Router>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/unauthenticated" element={<Unauthenticated />} />
        <Route path="/register" element={<RegisterEventForm />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
