import { Route, Routes } from "react-router";
import "./App.css";
import Landingpage from "./pages/Landingpage/Landingpage";
import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";

function App() {
  return (
    <>
      <Header />
      <section>
        <Routes>
          <Route path="/" element={<Landingpage />} />
        </Routes>
      </section>
      <Footer />
    </>
  );
}

export default App;
