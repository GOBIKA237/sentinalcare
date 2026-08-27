import React, { createContext, useContext, useEffect, useState } from "react";
import { getStoredUser, login as apiLogin, logout as apiLogout, fetchMe } from "../api/auth";
import { getTokens } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { accessToken } = getTokens();
    if (!accessToken) {
      setLoading(false);
      return;
    }
    fetchMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(serviceNumber, password) {
    const loggedInUser = await apiLogin(serviceNumber, password);
    setUser(loggedInUser);
    return loggedInUser;
  }

  async function logout() {
    await apiLogout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
