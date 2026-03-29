import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  fetchAdminMe,
  loginAdmin,
  logoutAdmin,
} from "@/api/authApi";

type AdminAuthContextValue = {
  isAdmin: boolean;
  adminReady: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAdmin: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminReady, setAdminReady] = useState(false);

  const refreshAdmin = useCallback(async () => {
    try {
      const me = await fetchAdminMe();
      setIsAdmin(me.admin !== null);
    } catch {
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await refreshAdmin();
      setAdminReady(true);
    })();
  }, [refreshAdmin]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const me = await loginAdmin(email, password);
      const ok = me.admin !== null;
      setIsAdmin(ok);
      return ok;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutAdmin();
    setIsAdmin(false);
  }, []);

  const value = useMemo(
    () => ({
      isAdmin,
      adminReady,
      login,
      logout,
      refreshAdmin,
    }),
    [isAdmin, adminReady, login, logout, refreshAdmin]
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return ctx;
}
