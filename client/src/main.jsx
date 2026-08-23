import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { applyTheme } from "./config/theme.js";
import { site } from "./config/site.js";
import { AlertProvider } from "./context/AlertContext.jsx";
import { ClientAuthProvider } from "./context/ClientAuthContext.jsx";
import { CookieConsentProvider } from "./context/CookieConsentContext.jsx";

applyTheme();

document.title = `${site.companyName} | ${site.tagline}`;
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AlertProvider>
        <ClientAuthProvider>
          <CookieConsentProvider>
            <App />
          </CookieConsentProvider>
        </ClientAuthProvider>
      </AlertProvider>
    </BrowserRouter>
  </StrictMode>
);
