import { create } from "zustand";
import { authApi } from "../services/api";
import { AxiosError } from "axios";
import {
  isLoggedOut,
  forceLogout,
  clearLogoutFlag,
} from "@/utils/logoutHelper";

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

      // Clear any previous logout flags first
      clearLogoutFlag();

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

      // Clear any previous logout flags first
      clearLogoutFlag();

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

      // Set user to null and confirm initialized state
      set({
        loading: false,
        initialized: true,
        user: null,
      });

      // Use the dedicated logout utility for a complete reset
      forceLogout();
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

      // Use force logout even if the API call fails
      forceLogout();
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

      // Check if user is logged out first using our helper
      if (isLoggedOut()) {
        console.log(
          "Found logout flag during initialization - staying logged out"
        );
        // User is logged out, make sure auth state reflects this
        localStorage.removeItem("authToken");
        set({ user: null, loading: false, initialized: true });
        return;
      }

      // Check if there's a token in localStorage
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("authToken")
          : null;

      // Only attempt to get profile if we have a token and not logged out
      if (token) {
        try {
          const response = await authApi.getProfile();

          // Only update the state if we have valid user data
          if (response.success && response.data) {
            set({ user: response.data, loading: false, initialized: true });
          } else {
            // If we don't have valid user data, clear token and set initialized
            localStorage.removeItem("authToken");
            // Also set logout flag to prevent auto-login attempts
            localStorage.setItem("logged_out", "true");
            set({ user: null, loading: false, initialized: true });
          }
        } catch (error) {
          // API error during initialization
          console.error("Error during profile fetch:", error);
          localStorage.removeItem("authToken");
          // Also set logout flag to prevent auto-login attempts
          localStorage.setItem("logged_out", "true");
          set({ user: null, loading: false, initialized: true });
        }
      } else {
        // No token found, mark as initialized but not logged in
        set({ user: null, loading: false, initialized: true });
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      // Don't set error for 401 (unauthorized), as it's expected when not logged in
      if (apiError.response?.status === 401) {
        // Clear invalid token
        localStorage.removeItem("authToken");
        // Also set logout flag to prevent auto-login attempts
        localStorage.setItem("logged_out", "true");
      } else if (apiError.response?.status !== 401) {
        set({
          error:
            apiError.response?.data?.message || "Failed to get user profile",
        });
      }
      set({ user: null, loading: false, initialized: true });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useAuthStore;
