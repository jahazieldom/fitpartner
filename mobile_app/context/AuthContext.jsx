import React, { createContext, useContext, useState, useEffect } from "react";
import { getItem, removeItem } from "@/utils/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setAuthenticated] = useState(null);
  const [user, setUser] = useState(null);

  const logout = async () => {
    await removeItem("accessToken");
    await removeItem("refreshToken");
    setAuthenticated(false);
  };

  useEffect(() => {
    async function checkToken() {
      const token = await getItem("accessToken");
      setAuthenticated(!!token);

      let userData = await getItem('user')
      if (userData) {
        setUser(JSON.parse(userData))
      }

    }
    checkToken();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuthenticated, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
