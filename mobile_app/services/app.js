import axios from "axios";
import { store } from "../store";
import { Config } from "../config";
import { log } from "../Helpers";
import AppActions from "../store/App/Actions";
import NavigationService from "../services/NavigationService";
import ENV from "../config";

// --- Variables internas ---
let apiClient = null;
let requestInterceptor = null;
let currentClave = null;
let currentJwt = null;
let alreadyNavigatedToAuth = false;

// --- Construcción de URL base para tenant ---
export const getTenantHostname = ({ clave }) => {
  return {
    baseURL: `${ENV.API_BASE_URL}`,
    host: "localhost",
  };
};

export const getTenantApiConfig = ({ clave }) => {
  const { baseURL, host } = getTenantHostname({ clave });

  return {
    baseURL: `${baseURL}${Config.API_ROOT}`,
    headers: {
      host,
      Accept: "application/json",
      "Content-Type": "application/json",
      "App-Version": global.APP_VERSION,
    },
  };
};

// --- Manejo de errores de respuesta ---
const onErrorResponse = async (error) => {
  const response = error.response;
  const state = store.getState().app;

  if (response) {
    const status = response.status;

    if (status === 403 && response.data?.code === "token_not_valid" && state.jwtRefresh) {
      return reintentarRequest403({
        client: apiClient,
        state,
        requestConfig: { ...error.config },
      });
    }

    if (status === 401 || status === 403) {
      clearApiClient();

      if (!alreadyNavigatedToAuth) {
        alreadyNavigatedToAuth = true;
        store.dispatch(AppActions.setAppState({ jwt: null, jwtRefresh: null }));
        store.dispatch(AppActions.toastMessage({
          type: "error",
          message: "Su sesión ha expirado",
        }));
        NavigationService.navigate("AuthStack");
      }

      return Promise.reject("Su sesión ha expirado.");
    }

    const message = `[${status}] - ${response.data?.detail || "Error inesperado del servidor"}`;
    log(message);
    return Promise.reject(error);
  }

  log("Error sin respuesta del servidor");
  return Promise.reject("Error de conexión con el servidor");
};

// --- Reintentar request luego de refresh ---
const reintentarRequest403 = async ({ client, state, requestConfig }) => {
  const newToken = await renovarToken();

  if (!newToken) {
    return Promise.reject({ response: { data: { detail: "Sesión inválida" } } });
  }

  const authHeader = `Bearer ${newToken}`;

  requestInterceptor = setAuthHeader({ client, authHeader, requestEjectId: requestInterceptor });
  requestConfig.headers["Authorization"] = authHeader;

  try {
    return await client.request(requestConfig);
  } catch (err) {
    clearApiClient();
    return Promise.reject(err);
  }
};

// --- Aplicar nuevo Authorization en interceptor ---
const setAuthHeader = ({ client, authHeader, requestEjectId }) => {
  if (Number.isInteger(requestEjectId)) {
    client.interceptors.request.eject(requestEjectId);
  }

  return client.interceptors.request.use((config) => {
    config.headers["Authorization"] = authHeader;
    return config;
  });
};

// --- Renovar token con jwtRefresh ---
export const renovarToken = async () => {
  const { jwtRefresh } = store.getState().app;

  if (!jwtRefresh) return null;

  try {
    const response = await getApiClient().post("/refresh/", {
      refresh: jwtRefresh,
    });

    const newAccess = response.data.access;
    store.dispatch(AppActions.setAppState({ jwt: newAccess }));
    alreadyNavigatedToAuth = false;
    return newAccess;
  } catch (error) {
    if (!alreadyNavigatedToAuth) {
      alreadyNavigatedToAuth = true;
      store.dispatch(AppActions.setAppState({ jwt: null, jwtRefresh: null }));
      store.dispatch(AppActions.toastMessage({
        type: "error",
        message: "Su sesión ha expirado",
      }));
      NavigationService.navigate("AuthStack");
    }
    return null;
  }
};

// --- Obtener configuraciones desde el backend ---
export const obtenerConfiguraciones = async (configuraciones) => {
  try {
    const client = getApiClient();
    const response = await client.post("/configuraciones/", { configuraciones });
    return response.data;
  } catch (error) {
    log("Error al obtener configuraciones:", error);
    return null;
  }
};

// --- Obtener instancia de cliente API multitenant ---
export const getApiClient = (clave) => {
  const state = store.getState().app;
  const tenantClave = clave || state.clave;
  const jwt = state.jwt;

  if (!tenantClave) throw new Error("Falta la clave del cliente");

  const needsNewInstance =
    !apiClient || currentClave !== tenantClave || currentJwt !== jwt;

  if (needsNewInstance) {
    log("🔄 Creando nueva instancia de API");
    apiClient = axios.create(getTenantApiConfig({ clave: tenantClave }));

    if (jwt) {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;
    }

    apiClient.interceptors.response.use((res) => res, onErrorResponse);

    currentClave = tenantClave;
    currentJwt = jwt;
    alreadyNavigatedToAuth = false;
  }

  return apiClient;
};

// --- Limpiar cliente API global ---
export const clearApiClient = () => {
  apiClient = null;
  requestInterceptor = null;
  currentClave = null;
  currentJwt = null;
  alreadyNavigatedToAuth = false;
};
