import { Outlet } from "react-router";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import "./App.css";

function App() {
  return (
    <div className="flex flex-col min-h-screen relative">
      <Header />
      <main className="flex flex-grow items-start justify-center">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default App;
