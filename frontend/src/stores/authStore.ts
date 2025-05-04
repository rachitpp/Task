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
      // First set loading and clear user state
      set({ loading: true, error: null, user: null });

      // Then make the API call
      await authApi.logout();

      // Finally set loading to false but keep initialized true
      set({ loading: false });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({
        loading: false,
        error: apiError.response?.data?.message || "Failed to logout",
      });
      throw error;
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
      const response = await authApi.getProfile();

      // Only update the state if we have valid user data
      if (response.success && response.data) {
        set({ user: response.data, loading: false, initialized: true });
      } else {
        // If we don't have valid user data, set initialized to true but leave user as null
        set({ loading: false, initialized: true });
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      // Don't set error for 401 (unauthorized), as it's expected when not logged in
      if (apiError.response?.status !== 401) {
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
