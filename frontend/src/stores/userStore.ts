import { create } from "zustand";
import { userApi } from "../services/api";
import { AxiosError } from "axios";

// Define the user type (already defined in authStore, but repeated here for clarity)
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "manager" | "admin";
}

// Define API error type
type ApiError = AxiosError<{
  message: string;
  success: boolean;
}>;

// Define the user store state and actions
interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchUsers: () => Promise<void>;
  clearError: () => void;
}

// Create the user store
const useUserStore = create<UserState>((set) => ({
  users: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    try {
      set({ loading: true, error: null });
      const response = await userApi.getUsers();
      set({ users: response.data, loading: false });
    } catch (error) {
      const apiError = error as ApiError;
      set({
        loading: false,
        error: apiError.response?.data?.message || "Failed to fetch users",
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useUserStore;
