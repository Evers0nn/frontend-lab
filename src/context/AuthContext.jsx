import React, { createContext, useContext, useMemo, useState } from "react";
import { API_URL, jsonHeaders } from "../config/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const login = async (usuario, senha) => {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, senha }),
    });
    const data = await response.json();
    if (!response.ok || data.status !== "sucesso") {
      throw new Error(data.detail || "Usuário ou senha incorretos!");
    }
    setToken(data.access_token);
    setUser(data.usuario);
    return data.usuario;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const getHeaders = () => jsonHeaders(token);

  const value = useMemo(() => ({ user, token, login, logout, getHeaders }), [user, token]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  return context;
}
