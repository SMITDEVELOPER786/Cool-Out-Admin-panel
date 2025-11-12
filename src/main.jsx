import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";  // ✅ ye line add karo

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
