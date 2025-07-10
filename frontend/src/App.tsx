import { Route, Routes } from "react-router";
import "./App.css";
import Landingpage from "./pages/Landingpage";
import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import Loginpage from "./pages/Loginpage";
import Registerpage from "./pages/Registerpage";
import Publicpoll from "./pages/Publicpoll";
import Personalpoll from "./pages/Personalpoll/Personalpoll";
import Userpage from "./pages/User/Userpage";
import NotFound from "./pages/NotFound";
import Datepoll from "./pages/Personalpoll/Datepoll";
import Uservotes from "./pages/User/Uservotes";
import Imagepoll from "./pages/Personalpoll/Imagepoll";
import Textpoll from "./pages/Personalpoll/Textpoll";
import QuickpollResult from "./pages/Quickpoll/QuickpollResult";
import QuickpollDetails from "./pages/Quickpoll/QuickpollDetails";
import QuickpollVote from "./pages/Quickpoll/QuickpollVote";
import TextpollResult from "./pages/Personalpoll/TextpollResult";
import DatepollResult from "./pages/Personalpoll/DatepollResult";
import ImagepollResult from "./pages/Personalpoll/ImagepollResult";
import TextpollVote from "./pages/Personalpoll/TextpollVote";
import DatepollVote from "./pages/Personalpoll/DatepollVote";
import ImagepollVote from "./pages/Personalpoll/ImagepollVote";

function App() {
  return (
    <div className="flex flex-col min-h-screen relative">
      <Header />
      <main className="flex flex-grow items-start justify-center">
        <Routes>
          <Route path="/" element={<Landingpage />} />
          <Route path="/login" element={<Loginpage />} />
          <Route path="/register" element={<Registerpage />} />
          <Route path="/quickpoll/result/:id" element={<QuickpollResult />} />
          <Route path="/quickpoll/details/:id" element={<QuickpollDetails />} />
          <Route path="/quickpoll/vote/:id" element={<QuickpollVote />} />
          <Route path="/publicpoll" element={<Publicpoll />} />
          <Route path="/user/:id" element={<Userpage />} />
          <Route path="/user/votes/:id" element={<Uservotes />} />
          <Route path="/personalpoll" element={<Personalpoll />} />
          <Route path="/textpoll" element={<Textpoll />} />
          <Route path="/datepoll" element={<Datepoll />} />
          <Route path="/imagepoll" element={<Imagepoll />} />
          <Route path="/textpoll/vote/:id" element={<TextpollVote />} />
          <Route path="/datepoll/vote/:id" element={<DatepollVote />} />
          <Route path="/imagepoll/vote/:id" element={<ImagepollVote />} />
          <Route path="/textpoll/result/:id" element={<TextpollResult />} />
          <Route path="/datepoll/result/:id" element={<DatepollResult />} />
          <Route path="/imagepoll/result/:id" element={<ImagepollResult />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
