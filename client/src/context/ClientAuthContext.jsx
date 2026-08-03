import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { clientSignup, clientLogin, clientLogout, getClientMe } from "../api/client";

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

  const signup = async (payload) => {
    const data = await clientSignup(payload);
    setCustomer(data);
    return data;
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
    <ClientAuthContext.Provider value={{ customer, loading, signup, login, logout, refresh }}>
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
