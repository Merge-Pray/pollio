import { createBrowserRouter } from "react-router";
import App from "../App";
import Landingpage from "../pages/Landingpage";
import Loginpage from "../pages/Loginpage";
import Registerpage from "../pages/Registerpage";
import Publicpoll from "../pages/Publicpoll";
import Personalpoll from "../pages/Personalpoll/Personalpoll";
import Userpage from "../pages/User/Userpage";
import NotFound from "../pages/NotFound";
import Datepoll from "../pages/Personalpoll/Datepoll";
import Uservotes from "../pages/User/Uservotes";
import Imagepoll from "../pages/Personalpoll/Imagepoll";
import Textpoll from "../pages/Personalpoll/Textpoll";
import QuickpollResult from "../pages/Quickpoll/QuickpollResult";
import QuickpollDetails from "../pages/Quickpoll/QuickpollDetails";
import QuickpollVote from "../pages/Quickpoll/QuickpollVote";
import TextpollResult from "../pages/Personalpoll/TextpollResult";
import DatepollResult from "../pages/Personalpoll/DatepollResult";
import ImagepollResult from "../pages/Personalpoll/ImagepollResult";
import TextpollVote from "../pages/Personalpoll/TextpollVote";
import DatepollVote from "../pages/Personalpoll/DatepollVote";
import ImagepollVote from "../pages/Personalpoll/ImagepollVote";
import Polloverview from "@/pages/Polloverview";
import ProtectedRoute from "../components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Landingpage /> },
      { path: "login", element: <Loginpage /> },
      { path: "register", element: <Registerpage /> },
      { path: "quickpoll/result/:id", element: <QuickpollResult /> },
      { path: "quickpoll/details/:id", element: <QuickpollDetails /> },
      { path: "quickpoll/vote/:id", element: <QuickpollVote /> },
      { path: "publicpoll", element: <Publicpoll /> },
      {
        path: "user/:id",
        element: (
          <ProtectedRoute>
            <Userpage />{" "}
          </ProtectedRoute>
        ),
      },
      {
        path: "user/votes/:id",
        element: (
          <ProtectedRoute>
            {" "}
            <Uservotes />{" "}
          </ProtectedRoute>
        ),
      },
      {
        path: "personalpoll",
        element: (
          <ProtectedRoute>
            {" "}
            <Personalpoll />{" "}
          </ProtectedRoute>
        ),
      },
      {
        path: "textpoll",
        element: (
          <ProtectedRoute>
            <Textpoll />
          </ProtectedRoute>
        ),
      },
      {
        path: "datepoll",
        element: (
          <ProtectedRoute>
            {" "}
            <Datepoll />
          </ProtectedRoute>
        ),
      },
      {
        path: "imagepoll",
        element: (
          <ProtectedRoute>
            {" "}
            <Imagepoll />{" "}
          </ProtectedRoute>
        ),
      },
      {
        path: "textpoll/vote/:id",
        element: (
          <ProtectedRoute>
            {" "}
            <TextpollVote />{" "}
          </ProtectedRoute>
        ),
      },
      {
        path: "datepoll/vote/:id",
        element: (
          <ProtectedRoute>
            {" "}
            <DatepollVote />
          </ProtectedRoute>
        ),
      },
      {
        path: "imagepoll/vote/:id",
        element: (
          <ProtectedRoute>
            <ImagepollVote />{" "}
          </ProtectedRoute>
        ),
      },
      {
        path: "textpoll/result/:id",
        element: (
          <ProtectedRoute>
            {" "}
            <TextpollResult />{" "}
          </ProtectedRoute>
        ),
      },
      {
        path: "datepoll/result/:id",
        element: (
          <ProtectedRoute>
            <DatepollResult />
          </ProtectedRoute>
        ),
      },
      {
        path: "imagepoll/result/:id",
        element: (
          <ProtectedRoute>
            <ImagepollResult />{" "}
          </ProtectedRoute>
        ),
      },
      {
        path: "polloverview",
        element: (
          <ProtectedRoute>
            <Polloverview />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
