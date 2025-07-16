import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { router } from "./routes";
import "./globals.css";
import { clientId } from "./lib/config";

// ✅ Google Client-ID aus Umgebungsvariablen holen
// const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!clientId) {
  throw new Error("❌ VITE_GOOGLE_CLIENT_ID ist nicht gesetzt!");
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("❌ Root-Element 'root' nicht gefunden!");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <RouterProvider router={router} />
    </GoogleOAuthProvider>
  </React.StrictMode>
);