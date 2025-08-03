import React, { createContext, useContext, useState, useEffect } from "react";
import { getItem, removeItem } from "@/utils/storage";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setAuthenticated] = useState(null);

  const logout = async () => {
    await removeItem("accessToken");
    await removeItem("refreshToken");
    setAuthenticated(false);
  };

  useEffect(() => {
    async function checkToken() {
      const token = await getItem("accessToken");
      setAuthenticated(!!token);
    }
    checkToken();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
