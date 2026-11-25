import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiFetch } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setError("");
    try {
      const data = await apiFetch("/auth/me");
      setUser(data?.user || null);
    } catch (err) {
      // Only auth failures mean the session is gone; transient errors keep it.
      if ([401, 403].includes(err?.status)) setUser(null);
      else setError(err?.message || "We could not verify your session.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (email, password) => {
    const data = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    setUser(data?.user || null);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await apiFetch("/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) });
    setUser(data?.user || null);
    return data;
  };

  const logout = async () => {
    try { await apiFetch("/auth/logout", { method: "POST" }); } catch {}
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, refresh, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
