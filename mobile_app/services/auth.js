import { setItem, removeItem, getItem } from "../utils/storage";
import { apiFetch } from "./api";
import ENV from "../config";

const TOKEN_KEY_ACCESS = "accessToken";
const TOKEN_KEY_REFRESH = "refreshToken";

function getHostFromUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname; // Ej: "example.com" o "localhost:8000"
  } catch (error) {
    console.error("URL inválida:", url);
    return null;
  }
}

async function setUserLocalStorage(user) {
  await setItem('user', JSON.stringify(user));
}

async function setCompanyLocalStorage(company) {
    await setItem(TOKEN_KEY_ACCESS, company.access);
    await setItem(TOKEN_KEY_REFRESH, company.refresh);
    if (ENV.LOCAL_DEVELOPMENT) {
      await setItem("tenantBaseUrl", ENV.TENANT_API_BASE_URL);
    } else {
      await setItem("tenantBaseUrl", company.base_url);
    }
    
    await setItem("tenantHost", getHostFromUrl(company.base_url)); 
    await setItem("currentCompany", JSON.stringify(company)); 
}

export async function login(email, password) {
  try {
    const data = await apiFetch("/login/", {
      method: "POST",
      body: { email, password },
    });

    const company = data.instance.companies[0]
    await setCompanyLocalStorage(company)
    await setUserLocalStorage(data.instance)
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function register(payload) {
  try {
    const data = await apiFetch("/register/", {
      method: "POST",
      body: payload,
    });

    const company = data.instance.companies[0]
    await setCompanyLocalStorage(company)
    await setUserLocalStorage(data.instance)
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function validateEmail(email) {
  try {
    const data = await apiFetch("/validate_email/", {
      method: "POST",
      body: { email },
    });
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getCompanies() {
  try {
    const data = await apiFetch("/companies/", {
      method: "GET",
    });
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function logout(router) {
  await removeItem(TOKEN_KEY_ACCESS);
  await removeItem(TOKEN_KEY_REFRESH);
  router.replace("/(auth)/");
}

export async function refreshToken() {
  const refresh = await getItem(TOKEN_KEY_REFRESH);

  if (!refresh) throw new Error("No refresh token found");

  try {
    const response = await apiFetch("/token/refresh/", {
      method: "POST",
      body: { refresh },
    });

    await setItem(TOKEN_KEY_ACCESS, response.access);
    return response.access;
  } catch (error) {
    console.log("Refresh token failed:", error);
    throw new Error("Failed to refresh token");
  }
}
