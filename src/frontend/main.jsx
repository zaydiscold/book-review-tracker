import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/variables.css";

// Placeholder: inject future global providers (router, sync status, feature flags) here.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
