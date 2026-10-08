import React, { createContext, useContext, useState } from "react";
import { API_URL, getAuthHeaders } from "../config/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const login = async (usuario, senha) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario,
          senha,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.status !== "sucesso") {
        throw new Error(
          data.detail || "Usuário ou senha incorretos."
        );
      }

      setToken(data.access_token);
      setUser(data.usuario);

      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const getHeaders = () => getAuthHeaders(token);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        getHeaders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}