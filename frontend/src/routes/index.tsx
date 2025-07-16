import { createBrowserRouter } from "react-router";
import App from "../App";
import Landingpage from "../pages/Landingpage";
import Loginpage from "../pages/Loginpage";
import Registerpage from "../pages/Registerpage";
import Publicpoll from "../pages/Publicpoll";
import Userpage from "../pages/User/Userpage";
import NotFound from "../pages/NotFound";
import Datepoll from "../pages/CustomPoll/Datepoll";
import ManagePoll from "../pages/User/ManagePoll";
import Imagepoll from "../pages/CustomPoll/Imagepoll";
import Textpoll from "../pages/CustomPoll/Textpoll";
import QuickpollResult from "../pages/Quickpoll/QuickpollResult";
import QuickpollVote from "../pages/Quickpoll/QuickpollVote";
import TextpollVote from "../pages/CustomPoll/CustomPollVote";
import Polloverview from "@/pages/Polloverview";
import ProtectedRoute from "../components/ProtectedRoute";
import CustomPollResult from "../pages/CustomPoll/CustomPollResult";

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
      { path: "quickpoll/vote/:id", element: <QuickpollVote /> },
      { path: "publicpoll", element: <Publicpoll /> },
      { path: "custompoll/vote/:id", element: <TextpollVote /> },
      { path: "custompoll/result/:id", element: <CustomPollResult /> },
      {
        path: "user/:id",
        element: (
          <ProtectedRoute>
            <Userpage />
          </ProtectedRoute>
        ),
      },
      {
        path: "user/polls/:id",
        element: (
          <ProtectedRoute>
            <ManagePoll />
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
            <Datepoll />
          </ProtectedRoute>
        ),
      },
      {
        path: "imagepoll",
        element: (
          <ProtectedRoute>
            <Imagepoll />
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
  {
    path: "*",
    element: <NotFound />,
  },
]);
