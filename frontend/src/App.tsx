import { Route, Routes } from "react-router";
import "./App.css";
import Landingpage from "./pages/Landingpage/Landingpage";
import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";

function App() {
  return (
    <div className="flex flex-col min-h-screen relative">
      <Header />
      <main className="flex flex-grow items-center justify-center">
        <Routes>
          <Route path="/" element={<Landingpage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
