import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);   // logged-in user object
  const [loading, setLoading] = useState(true);   // checking session on mount

  // On app load, check if there's already a valid token in localStorage
  useEffect(() => {
    const token = localStorage.getItem("moviemate_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    api.me()
      .then((data) => setUser(data.user))
      .catch(() => {
        setUser(null);
        localStorage.removeItem("moviemate_token");
      })
      .finally(() => setLoading(false));
  }, []);


  const login = async (username, password) => {
    const data = await api.login({ username, password });
    setUser(data.user);
    return data.user;
  };

  const register = async (username, email, password) => {
    const data = await api.register({ username, email, password });
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const isAdmin = user?.role === "admin";
  const isLoggedIn = Boolean(user);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
