import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../services/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    setUser(authApi.getSession());
    setInitializing(false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      initializing,
      signup: async (payload) => {
        const u = await authApi.signup(payload);
        setUser(u);
        return u;
      },
      login: async (payload) => {
        const u = await authApi.login(payload);
        setUser(u);
        return u;
      },
      logout: async () => {
        await authApi.logout();
        setUser(null);
      },
    }),
    [user, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
