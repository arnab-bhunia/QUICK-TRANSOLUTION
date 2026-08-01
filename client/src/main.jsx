// import { StrictMode } from "react";
// import { createRoot } from "react-dom/client";
// import "./index.css";
// import App from "./App.jsx";
// import { applyTheme } from "./config/theme.js";
// import { site } from "./config/site.js";

// applyTheme();

// document.title = `${site.companyName} | ${site.tagline}`;
// createRoot(document.getElementById("root")).render(
//   <StrictMode>
//     <App />
//   </StrictMode>
// );
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { applyTheme } from "./config/theme.js";
import { site } from "./config/site.js";
import { AlertProvider } from "./context/AlertContext.jsx";

applyTheme();

document.title = `${site.companyName} | ${site.tagline}`;
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AlertProvider>
        <App />
      </AlertProvider>
    </BrowserRouter>
  </StrictMode>
);