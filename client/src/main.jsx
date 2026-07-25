import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { applyTheme } from "./config/theme.js";
import { site } from "./config/site.js";

applyTheme();

document.title = `${site.companyName} | ${site.tagline}`;
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
