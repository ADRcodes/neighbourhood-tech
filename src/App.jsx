import Footer from "./components/Footer";
import Nav from "./components/Nav";
import Home from "./pages/Home";
import Unauthenticated from "./pages/Unauthenticated";

function App() {
  return (
    <>
      <Unauthenticated />
      <Home />
    </>
  );
}

export default App;
