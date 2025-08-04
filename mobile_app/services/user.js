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