import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  clientSignup,
  clientLogin,
  clientLogout,
  getClientMe,
  verifyClientEmailOtp,
  resendClientEmailOtp,
} from "../api/client";

const ClientAuthContext = createContext(null);

export function ClientAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await getClientMe();
      setCustomer(data);
    } catch {
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Deliberately does NOT set `customer` — a fresh signup isn't logged
  // in yet, it's pending email verification. The response here is
  // `{ email, needsVerification: true }`; the signup page uses that to
  // route to the OTP screen. `customer` only gets set once verifyEmail
  // below succeeds (verification doubles as first login).
  const signup = async (payload) => {
    return clientSignup(payload);
  };

  const verifyEmail = async (payload) => {
    const data = await verifyClientEmailOtp(payload);
    setCustomer(data);
    return data;
  };

  const resendOtp = async (payload) => {
    return resendClientEmailOtp(payload);
  };

  const login = async (payload) => {
    const data = await clientLogin(payload);
    setCustomer(data);
    return data;
  };

  const logout = async () => {
    await clientLogout().catch(() => {});
    setCustomer(null);
  };

  return (
    <ClientAuthContext.Provider
      value={{ customer, loading, signup, verifyEmail, resendOtp, login, logout, refresh }}
    >
      {children}
    </ClientAuthContext.Provider>
  );
}

export function useClientAuth() {
  const ctx = useContext(ClientAuthContext);
  if (!ctx) {
    throw new Error("useClientAuth must be used within a <ClientAuthProvider>");
  }
  return ctx;
}
