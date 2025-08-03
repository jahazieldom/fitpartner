import axios from "axios";
import { getItem } from "../utils/storage";
import ENV from "../config";

/**
 * BASE URL de la API pública
 */
const DEFAULT_API_BASE_URL = `${ENV.API_BASE_URL}/api`;

/**
 * Obtiene encabezados de autorización
 */
async function getAuthHeaders(token = null) {
  const accessToken = token || (await getItem("accessToken"));
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

/**
 * Llama a la API pública
 * @param {string} endpoint - Ej: '/login'
 * @param {object} options - { method, body, headers }
 * @param {string|null} token - JWT personalizado si lo deseas
 */
export async function apiFetch(endpoint, options = {}, token = null) {
  const headers = {
    "Content-Type": "application/json",
    "Host": "localhost",
    ...(await getAuthHeaders(token)),
    ...options.headers,
  };

  try {
    const response = await axios.request({
      url: `${DEFAULT_API_BASE_URL}${endpoint}`,
      method: options.method || "GET",
      data: options.body || null,
      headers,
    });

    return response.data;
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || null;
    throw { status, data };
  }
}

/**
 * Llama a la API del tenant (automáticamente desde localStorage)
 * @param {string} endpoint - Ej: '/clientes/'
 * @param {object} options - { method, body, headers }
 */
export async function apiFetchTenant(endpoint, options = {}) {
  const baseUrl = await getItem("tenantBaseUrl");
  const token = await getItem("accessToken");
  const host = await getItem("tenantHost"); // opcional

  if (!baseUrl || !token) {
    throw new Error("Faltan datos para llamar la API del tenant");
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...(host && { Host: host }),
    ...options.headers,
  };

  let url = `${baseUrl}${endpoint}`
  
  console.log("=============")
  console.log(url)
  console.log(headers)
  console.log("=============")

  try {
    const response = await axios.request({
      url: url,
      method: options.method || "GET",
      data: options.body || null,
      headers,
    });

    return response.data;
  } catch (error) {
    console.log(error)
    const status = error.response?.status || 500;
    const data = error.response?.data || null;
    throw { status, data };
  }
}
