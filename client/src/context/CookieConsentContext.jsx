import { createContext, useContext, useEffect, useState } from "react";
import { getVisitorId } from "../utils/visitorId";
import { POLICY_VERSION } from "../config/legal";

const STORAGE_KEY = "qt_cookie_consent";
const CookieConsentContext = createContext(null);

const defaultCategories = { necessary: true, analytics: false, marketing: false };

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // If the policy has materially changed since they last decided,
    // treat it as no decision yet — this is what re-shows the banner.
    if (parsed.policyVersion !== POLICY_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function CookieConsentProvider({ children }) {
  const [categories, setCategories] = useState(defaultCategories);
  const [hasDecided, setHasDecided] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    const stored = readStored();
    if (stored) {
      setCategories(stored.categories);
      setHasDecided(true);
    }
  }, []);

  const persist = async (nextCategories) => {
    const visitorId = getVisitorId();
    const record = { categories: nextCategories, policyVersion: POLICY_VERSION };

    setCategories(nextCategories);
    setHasDecided(true);
    setPreferencesOpen(false);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {
      // non-fatal — the in-memory state still governs this session
    }

    // Best-effort sync to the backend for the legal audit trail. A
    // failure here shouldn't block the visitor from using the site —
    // their local choice still takes effect either way.
    try {
      await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/consent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ visitorId, categories: nextCategories, policyVersion: POLICY_VERSION }),
        }
      );
    } catch {
      // ignore — non-blocking
    }
  };

  const acceptAll = () => persist({ necessary: true, analytics: true, marketing: true });
  const rejectNonEssential = () => persist({ necessary: true, analytics: false, marketing: false });
  const saveCustom = (partial) =>
    persist({ ...defaultCategories, ...partial, necessary: true });

  const value = {
    categories,
    hasDecided,
    preferencesOpen,
    openPreferences: () => setPreferencesOpen(true),
    closePreferences: () => setPreferencesOpen(false),
    acceptAll,
    rejectNonEssential,
    saveCustom,
  };

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>;
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    throw new Error("useCookieConsent must be used within a <CookieConsentProvider>");
  }
  return ctx;
}
