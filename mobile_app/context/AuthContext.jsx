import React, { createContext, useContext, useState, useEffect } from "react";
import { getItem, setItem, removeItem } from "../utils/storage";
import { useRouter } from "expo-router";
import useAuthStore from "../store/authStore"; // ✅ importamos el store de zustand
import ENV from "../config";


const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [state, setState] = useState({
    authenticated: false,
    accessToken: null,
    refreshToken: null,
    company: null,
    user: null,
  });

  // acceso a funciones del store de zustand
  const { setAuth: setAuthStore, clearAuth: clearAuthStore } = useAuthStore.getState();

  // Carga inicial al iniciar la app
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const token = await getItem("accessToken");
        const refresh = await getItem("refreshToken");
        const companyStorage = await getItem("company");
        const userStorage = await getItem("user");

        if (token && companyStorage) {
          const companyData = JSON.parse(companyStorage);
          const userData = JSON.parse(userStorage);

          const auth = {
            authenticated: true,
            accessToken: token,
            refreshToken: refresh,
            company: companyData,
            user: userData,
          };

          setState(auth);
          setAuthStore(auth); 
        } else {
          router.replace("/(auth)/login");
        }
      } catch (error) {
        console.log("Error cargando auth:", error);
        router.replace("/(auth)/login");
      } finally {
        setLoading(false);
      }
    };

    loadAuthData();
  }, []);

  const login = async (data) => {
    let firstCompany = data.instance.company || (data.instance.companies?.[0] || {});
    if (ENV.LOCAL_DEVELOPMENT) {
      const url = new URL(firstCompany.base_url);
      console.log(ENV.TENANT_API_BASE_URL)
      firstCompany.base_url = ENV.TENANT_API_BASE_URL
      firstCompany.host = url.host
    }

    const auth = {
      authenticated: true,
      accessToken: firstCompany.access,
      refreshToken: firstCompany.refresh,
      company: firstCompany,
      user: data.instance,
    };

    setState(auth);
    setAuthStore(auth);


    // Guardar en storage
    await setItem("accessToken", firstCompany.access);
    await setItem("refreshToken", firstCompany.refresh);
    await setItem("company", JSON.stringify(auth.company));
    await setItem("user", JSON.stringify(auth.user));
  };

  const setCompany = async (newCompany) => {
    const updatedState = {
      ...state,
      company: newCompany,
    };

    setState(updatedState);          // Actualiza el contexto
    setAuthStore(updatedState);      // Actualiza el store de zustand
    await setItem("company", JSON.stringify(newCompany)); // Guarda en storage
  };
  const setCompanies = async (companies) => {
    const updatedState = {
      ...state,
      companies: companies,
    };
    setState(updatedState);          // Actualiza el contexto
    setAuthStore(updatedState);      // Actualiza el store de zustand
  };

  const logout = async () => {
    setState({
      authenticated: false,
      accessToken: null,
      refreshToken: null,
      company: null,
      user: null,
    });

    clearAuthStore(); // ✅ limpiar store de zustand

    await removeItem("accessToken");
    await removeItem("refreshToken");
    await removeItem("company");
    await removeItem("user");

    router.replace("/(auth)/login");
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        loading,
        login,
        logout,
        setCompany,
        setCompanies,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
