import axios from "axios";
import authStore from "../store/authStore"; // importamos el store directamente
import ENV from "../config";

/**
 * Llama a la API pública
 */
export async function apiFetch(endpoint, options = {}, token = null) {
  // Tomamos el token del parámetro o del store
  const accessToken = token || authStore.getState().accessToken;
  
  if (ENV.LOCAL_DEVELOPMENT) {
    if (!options.headers) {
      options.headers = {}
    }
    options.headers["Host"] = "localhost"
  }

  const headers = {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  };

  try {
    const response = await axios.request({
      url: `${ENV.API_BASE_URL}/api${endpoint}`,
      method: options.method || "GET",
      data: options.body || null,
      headers,
      timeout: options.timeout || 10000,
    });

    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

/**
 * Llama a la API del tenant usando el store
 */
export async function apiFetchTenant(endpoint, options = {}, ctx = null) {
  const state = ctx || authStore.getState();
  console.log(state)
  const { company, accessToken } = state;

  if (!company?.base_url || !accessToken) {
    throw new Error("Faltan datos para llamar la API del tenant");
  }

  if (ENV.LOCAL_DEVELOPMENT) {
    if (!options.headers) {
      options.headers = {}
    }
    options.headers["Host"] = company.host
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
    ...(company.host ? { Host: company.host } : {}),
    ...options.headers,
  };

  try {
    const response = await axios.request({
      url: `${company.base_url}${endpoint}`,
      method: options.method || "GET",
      data: options.body || null,
      headers,
      timeout: options.timeout || 10000,
    });

    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

/**
 * Manejo centralizado de errores Axios
 */
function handleAxiosError(error) {
  let status = error.response?.status || 500;
  let data = error.response?.data || null;

  if (axios.isAxiosError(error)) {
    console.log("Request failed:", {
      url: error.request._url,
      method: error.config?.method?.toUpperCase(),
      headers: error.config?.headers,
      body: error.config?.data,
      status: error.response?.status,
    });

    if (!error.response && error.request) {
      data = "Sin respuesta del servidor";
    } else if (!error.response && !error.request) {
      data = error.message;
    }
  } else {
    console.error("Unknown error:", error);
  }

  throw { status, data };
}
