import { create } from "zustand";
import { authApi } from "../services/api";
import { AxiosError } from "axios";
import {
  isLoggedOut,
  forceLogout,
  clearLogoutFlag,
  hasRecentlyLoggedOut,
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
  recentlyLoggedOut: boolean;

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
  recentlyLoggedOut: false,

  login: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null, recentlyLoggedOut: false });

      // Clear any previous logout flags first - do this once
      clearLogoutFlag();
      localStorage.removeItem("FORCE_LOGOUT");
      localStorage.removeItem("logged_out");

      // Clear any stale token that might be causing issues
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");

      console.log("Attempting login for:", email);

      // Perform login request with timeout to prevent hanging
      const loginPromise = authApi.login({ email, password });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Login request timed out")), 15000)
      );

      const response = await Promise.race([loginPromise, timeoutPromise]);

      console.log("Login successful, response:", response);

      // Validate response structure
      if (!response || !response.data) {
        throw new Error("Invalid response from server");
      }

      // Save token to localStorage if provided in response
      if (response.token) {
        console.log("Saving auth token");
        localStorage.setItem("authToken", response.token);
      } else {
        console.warn("No token received from server");
      }

      // Set user data in a single update
      set({
        user: response.data,
        loading: false,
        initialized: true,
        recentlyLoggedOut: false,
      });

      return response; // Return the response for chaining
    } catch (error: unknown) {
      console.error("Login error:", error);

      const apiError = error as ApiError;
      let errorMessage = "Failed to login";

      if (apiError.message === "Login request timed out") {
        errorMessage = "Login request timed out, please try again";
      } else if (apiError.response?.data?.message) {
        errorMessage = apiError.response.data.message;
      } else if (apiError.message) {
        errorMessage = apiError.message;
      }

      set({
        loading: false,
        error: errorMessage,
        initialized: true, // Ensure initialized is set to true even on error
      });
      throw error;
    }
  },

  register: async (name: string, email: string, password: string) => {
    try {
      set({ loading: true, error: null, recentlyLoggedOut: false });

      // Clear any previous logout flags first
      clearLogoutFlag();

      // Clear any existing token to prevent issues
      localStorage.removeItem("authToken");

      const response = await authApi.register({ name, email, password });

      // Validate response
      if (!response || !response.data) {
        throw new Error("Invalid response from server during registration");
      }

      console.log("Registration successful, response:", response);

      // Save token to localStorage if provided in response
      if (response.token) {
        console.log("Saving auth token after registration");
        localStorage.setItem("authToken", response.token);
      } else {
        console.warn("No token received from server during registration");
      }

      // Set user data in a single update to ensure consistency
      set({
        user: response.data,
        loading: false,
        initialized: true,
        recentlyLoggedOut: false,
      });

      return response; // Return the response for chaining
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
        recentlyLoggedOut: true,
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
        recentlyLoggedOut: true,
      });

      // Use the dedicated logout utility for a complete reset
      forceLogout();

      // Extra insurance: use a repeated check after a delay to ensure
      // the logout state persists after any redirects or refreshes
      const ensureLoggedOut = () => {
        set({
          user: null,
          initialized: true,
          loading: false,
          recentlyLoggedOut: true,
        });
      };

      // Set multiple timeouts for redundancy
      setTimeout(ensureLoggedOut, 100);
      setTimeout(ensureLoggedOut, 500);
      setTimeout(ensureLoggedOut, 1000);
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
        recentlyLoggedOut: true,
      });

      // Use force logout even if the API call fails
      forceLogout();

      // Extra insurance with multiple checks
      const ensureLoggedOut = () => {
        set({
          user: null,
          initialized: true,
          loading: false,
          recentlyLoggedOut: true,
        });
      };

      setTimeout(ensureLoggedOut, 100);
      setTimeout(ensureLoggedOut, 500);
      setTimeout(ensureLoggedOut, 1000);
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
    // Always check for recent logout first - highest priority check
    if (hasRecentlyLoggedOut()) {
      console.log(
        "Found recent logout during initialization - staying logged out"
      );
      localStorage.removeItem("authToken");
      set({
        user: null,
        loading: false,
        initialized: true,
        recentlyLoggedOut: true,
      });
      return;
    }

    // Otherwise check regular logout flags
    if (isLoggedOut()) {
      console.log(
        "Found logout flag during initialization - staying logged out"
      );
      localStorage.removeItem("authToken");
      set({
        user: null,
        loading: false,
        initialized: true,
        recentlyLoggedOut: true,
      });
      return;
    }

    if (get().initialized) return;

    try {
      set({ loading: true, error: null });

      // One final check to ensure we don't try to log in after logout
      if (hasRecentlyLoggedOut() || isLoggedOut()) {
        set({
          user: null,
          loading: false,
          initialized: true,
          recentlyLoggedOut: true,
        });
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
            set({
              user: response.data,
              loading: false,
              initialized: true,
              recentlyLoggedOut: false,
            });
          } else {
            // If we don't have valid user data, clear token and set initialized
            localStorage.removeItem("authToken");
            // Also set logout flag to prevent auto-login attempts
            localStorage.setItem("logged_out", "true");
            set({
              user: null,
              loading: false,
              initialized: true,
              recentlyLoggedOut: true,
            });
          }
        } catch (error) {
          // API error during initialization
          console.error("Error during profile fetch:", error);
          localStorage.removeItem("authToken");
          // Also set logout flag to prevent auto-login attempts
          localStorage.setItem("logged_out", "true");
          set({
            user: null,
            loading: false,
            initialized: true,
            recentlyLoggedOut: true,
          });
        }
      } else {
        // No token found, mark as initialized but not logged in
        set({
          user: null,
          loading: false,
          initialized: true,
          recentlyLoggedOut: true,
        });
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
      set({
        user: null,
        loading: false,
        initialized: true,
        recentlyLoggedOut: true,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useAuthStore;
