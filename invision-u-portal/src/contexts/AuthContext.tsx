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
  fetchMe,
  loginApplicant,
  logoutApplicant,
  registerApplicant,
} from "@/api/authApi";

export type UserProfile = {
  id: string;
  fullName: string;
  phone: string;
  iin: string;
  email: string;
};

export type RegisterInput = {
  fullName: string;
  phone: string;
  iin: string;
  email: string;
  password: string;
};

type AuthContextValue = {
  user: UserProfile | null;
  hasApplication: boolean;
  authReady: boolean;
  refreshMe: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [hasApplication, setHasApplication] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  const refreshMe = useCallback(async () => {
    try {
      const me = await fetchMe();
      if (me.user) {
        setUser({
          id: me.user.id,
          fullName: me.user.fullName,
          phone: me.user.phone,
          iin: me.user.iin,
          email: me.user.email,
        });
        setHasApplication(me.hasApplication);
      } else {
        setUser(null);
        setHasApplication(false);
      }
    } catch {
      setUser(null);
      setHasApplication(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await refreshMe();
      setAuthReady(true);
    })();
  }, [refreshMe]);

  const login = useCallback(async (email: string, password: string) => {
    const me = await loginApplicant(email, password);
    if (!me.user) throw new Error("Invalid credentials");
    setUser({
      id: me.user.id,
      fullName: me.user.fullName,
      phone: me.user.phone,
      iin: me.user.iin,
      email: me.user.email,
    });
    setHasApplication(me.hasApplication);
  }, []);

  const register = useCallback(async (data: RegisterInput) => {
      const me = await registerApplicant({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone,
        iin: data.iin,
      });
      if (!me.user) throw new Error("Registration failed");
      setUser({
        id: me.user.id,
        fullName: me.user.fullName,
        phone: me.user.phone,
        iin: me.user.iin,
        email: me.user.email,
      });
      setHasApplication(me.hasApplication);
  }, []);

  const logout = useCallback(async () => {
    await logoutApplicant();
    setUser(null);
    setHasApplication(false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      hasApplication,
      authReady,
      refreshMe,
      login,
      register,
      logout,
    }),
    [user, hasApplication, authReady, refreshMe, login, register, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
