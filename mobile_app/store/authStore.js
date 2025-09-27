// authStore.js
import { create } from "zustand";

const useAuthStore = create((set, get) => ({
  user: null,
  companies: [],
  company: null,
  accessToken: null,
  refreshToken: null,
  tenant: null,

  setAuth: (data) => set((state) => ({ ...state, ...data })),
  clearAuth: () =>
    set({
      user: null,
      companies: [],
      company: null,
      accessToken: null,
      refreshToken: null,
      tenant: null,
    }),
  getAuth: () => get(),
}));

export default useAuthStore;
