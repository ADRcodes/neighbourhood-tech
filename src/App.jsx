import Footer from "./components/Footer";
import Nav from "./components/Nav";
import Home from "./pages/Home";
import Unauthenticated from "./pages/Unauthenticated";
import EventCarousel from "./components/EventCarosel";

function App() {
  return (
    <>
      <Unauthenticated />
      <Home />
      <EventCarousel />
    </>
  );
}

export default App;

