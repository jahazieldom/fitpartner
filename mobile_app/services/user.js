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