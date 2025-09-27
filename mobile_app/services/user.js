import { setItem, removeItem, getItem } from "../utils/storage";
import { apiFetchTenant } from "./api";
import ENV from "../config";

export async function getDashboard() {
  try {
    const data = await apiFetchTenant("/api/user/dashboard/", {
      method: "GET",
    });
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function createCheckoutLink(data) {
  try {
    const response = await apiFetchTenant("/api/create_checkout_link/", {
      method: "POST",
      body: data,
    });
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getReservationPage(params) {
  try {
    const data = await apiFetchTenant("/api/reservations/", {
      method: "GET",
      params: params,
    });
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getReservations(params) {
  try {
    const data = await apiFetchTenant("/api/account/reservations/", {
      method: "GET",
      params: params,
    });
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function bookSession(sessionId) {
  try {
    const data = await apiFetchTenant(`/api/sessions/${sessionId}/book/`, {
      method: "POST",
      body: {},
    });
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function waitlistSession(sessionId) {
  try {
    const data = await apiFetchTenant(`/api/sessions/${sessionId}/waitlist/`, {
      method: "POST",
      body: {},
    });
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function registerPushToken(pushToken) {
  try {
    const data = await apiFetchTenant("/api/push_tokens/", {
      method: "POST",
      body: {
        token: pushToken,
      },
    });
    return data;
  } catch (error) {
    console.log("Error registrando push token:", error);
    throw error;
  }
}