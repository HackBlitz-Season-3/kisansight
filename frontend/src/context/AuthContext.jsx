import { createContext, useContext, useState } from "react";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ks_user")); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem("ks_token") || "");

  const login = (tok, usr) => {
    setToken(tok); setUser(usr);
    localStorage.setItem("ks_token", tok);
    localStorage.setItem("ks_user", JSON.stringify(usr));
  };

  const logout = () => {
    setToken(""); setUser(null);
    localStorage.removeItem("ks_token");
    localStorage.removeItem("ks_user");
  };

  return <AuthCtx.Provider value={{ user, token, login, logout }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
