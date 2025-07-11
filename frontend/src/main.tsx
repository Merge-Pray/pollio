import { RouterProvider } from "react-router";
import ReactDOM from "react-dom/client";
import { router } from "./routes";
import "./globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
