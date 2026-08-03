import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { adminLogin, adminLogout, getAdminMe } from "../../api/client";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await getAdminMe();
      setStaff(data);
    } catch {
      setStaff(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (payload) => {
    const data = await adminLogin(payload);
    setStaff(data);
    return data;
  };

  const logout = async () => {
    await adminLogout().catch(() => {});
    setStaff(null);
  };

  return (
    <AdminAuthContext.Provider value={{ staff, loading, login, logout, refresh }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within an <AdminAuthProvider>");
  }
  return ctx;
}
