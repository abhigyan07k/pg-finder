import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId="561317886132-53dtcv6suk2h4290dg1b3l3d4o5196g0.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>,
);
