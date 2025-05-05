import { create } from "zustand";
import { authApi } from "../services/api";
import { AxiosError } from "axios";

// Define the user type
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "manager" | "admin";
  notificationPreferences: {
    email: boolean;
    inApp: boolean;
  };
}

// Define error type
type ApiError = AxiosError<{
  message: string;
  success: boolean;
}>;

// Define the authentication store state and actions
interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (
    userData: Partial<User> & { password?: string }
  ) => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
}

// Create the authentication store
const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  initialized: false,

  login: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      const response = await authApi.login({ email, password });
      set({ user: response.data, loading: false });

      // Save token to localStorage if provided in response
      if (response.token) {
        localStorage.setItem("authToken", response.token);
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({
        loading: false,
        error: apiError.response?.data?.message || "Failed to login",
      });
      throw error;
    }
  },

  register: async (name: string, email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      const response = await authApi.register({ name, email, password });
      set({ user: response.data, loading: false });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({
        loading: false,
        error: apiError.response?.data?.message || "Failed to register",
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      // Signal logout in multiple ways
      if (typeof window !== "undefined") {
        // Signal logout with multiple flags
        localStorage.removeItem("authToken");
        localStorage.clear();
        localStorage.setItem("logged_out", "true");
        sessionStorage.clear();
        sessionStorage.setItem("logged_out", "true");

        // Also try to clear all cookies
        document.cookie.split(";").forEach(function (c) {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(
              /=.*/,
              "=;expires=" + new Date().toUTCString() + ";path=/"
            );
        });

        // Also try to clear the IndexedDB if possible
        try {
          const request = indexedDB.deleteDatabase("taskManagementOfflineDB");
          request.onsuccess = () =>
            console.log("IndexedDB deleted successfully");
          request.onerror = () => console.error("Error deleting IndexedDB");
        } catch (dbError) {
          console.error("Failed to delete IndexedDB:", dbError);
        }
      }

      // First set loading and clear user state
      set({
        loading: true,
        error: null,
        user: null,
        initialized: true,
      });

      // Try to call the API logout endpoint
      try {
        await authApi.logout();
      } catch (apiError) {
        console.error("API logout error:", apiError);
        // Just log the error but continue with client-side logout
      }

      // Finally confirm user is set to null
      set({
        loading: false,
        initialized: true,
        user: null,
      });

      // Force a hard reload to clear any cached state - using a small delay
      if (typeof window !== "undefined") {
        setTimeout(() => {
          window.location.href = "/login";
        }, 100);
      }
    } catch (error: unknown) {
      // Handle errors but still try to clear state
      const apiError = error as ApiError;
      console.error("Logout error:", apiError);

      // Still set user to null even if API call fails
      set({
        loading: false,
        error: apiError.response?.data?.message || "Failed to logout",
        user: null,
        initialized: true,
      });

      // Even if API call fails, we should redirect to login
      if (typeof window !== "undefined") {
        setTimeout(() => {
          window.location.href = "/login";
        }, 100);
      }
    }
  },

  updateProfile: async (userData: Partial<User> & { password?: string }) => {
    try {
      set({ loading: true, error: null });
      const response = await authApi.updateProfile(userData);
      set({ user: response.data, loading: false });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({
        loading: false,
        error: apiError.response?.data?.message || "Failed to update profile",
      });
      throw error;
    }
  },

  initialize: async () => {
    if (get().initialized) return;

    try {
      set({ loading: true, error: null });

      // Check if there's a token in localStorage
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("authToken")
          : null;

      // Only attempt to get profile if we have a token
      if (token) {
        const response = await authApi.getProfile();

        // Only update the state if we have valid user data
        if (response.success && response.data) {
          set({ user: response.data, loading: false, initialized: true });
        } else {
          // If we don't have valid user data, clear token and set initialized to true
          localStorage.removeItem("authToken");
          set({ loading: false, initialized: true });
        }
      } else {
        // No token found, mark as initialized but not logged in
        set({ loading: false, initialized: true });
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      // Don't set error for 401 (unauthorized), as it's expected when not logged in
      if (apiError.response?.status === 401) {
        // Clear invalid token
        localStorage.removeItem("authToken");
      } else if (apiError.response?.status !== 401) {
        set({
          error:
            apiError.response?.data?.message || "Failed to get user profile",
        });
      }
      set({ loading: false, initialized: true });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useAuthStore;
