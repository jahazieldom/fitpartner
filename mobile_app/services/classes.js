import { setItem, removeItem, getItem } from "../utils/storage";
import { apiFetchTenant } from "./api";
import ENV from "../config";

export async function getClasses() {
  try {
    const data = await apiFetchTenant("/api/classes/", {
      method: "GET",
    });
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}