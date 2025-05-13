import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { TaskInput } from "@/stores/taskStore";
import { trackApiCall } from "@/utils/performanceMonitor";

// Extend AxiosRequestConfig to include metadata
declare module "axios" {
  export interface AxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}

// Update this URL to your Render.com backend URL
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://task2-backend-uptm.onrender.com/api";

// Check if the API is available, if not use localhost fallback
const checkApiAvailability = async () => {
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-cache",
    });
    return true;
  } catch (error) {
    console.error("API not available, using fallback:", error);
    return false;
  }
};

// Create an axios instance with custom defaults
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies (JWT)
  timeout: 15000, // 15 seconds timeout
});

// Simple in-memory cache for GET requests
const cache = new Map<string, { timestamp: number; data: any }>();
const CACHE_DURATION = 60000; // 1 minute cache duration

// Helper to get cached data or fetch new data
const getCachedData = async <T>(
  key: string,
  fetchFunction: () => Promise<T>
): Promise<T> => {
  const now = Date.now();
  const cachedItem = cache.get(key);

  if (cachedItem && now - cachedItem.timestamp < CACHE_DURATION) {
    return cachedItem.data;
  }

  // Fetch fresh data
  const data = await fetchFunction();

  // Cache the result
  cache.set(key, {
    timestamp: now,
    data,
  });

  return data;
};

// Auth services
export const authApi = {
  checkHealth: async () => {
    try {
      const response = await api.get("/health", { timeout: 5000 });
      return {
        status: "available",
        message: response.data?.message || "API is available",
      };
    } catch (error) {
      console.error("API health check failed:", error);
      return {
        status: "unavailable",
        message: "API is unavailable",
      };
    }
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
  }) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  login: async (userData: { email: string; password: string }) => {
    // Clear any cached user data on login
    Array.from(cache.keys())
      .filter((key) => key.includes("/auth/me"))
      .forEach((key) => cache.delete(key));

    try {
      console.log("Making login request to:", `${API_URL}/auth/login`);
      const response = await api.post("/auth/login", userData);
      console.log("Login API response:", response.data);

      // Validate token in response
      if (!response.data.token) {
        console.warn("No token received in login response");
      }

      return response.data;
    } catch (error) {
      console.error("Login API error:", error);
      // Enhance error message
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          throw new Error(
            "Network error. Please check your internet connection."
          );
        } else if (error.response.status === 401) {
          throw new Error("Invalid email or password. Please try again.");
        } else if (error.response.status >= 500) {
          throw new Error("Server error. Please try again later.");
        }
      }
      throw error;
    }
  },

  logout: async () => {
    // Clear entire cache on logout
    cache.clear();

    try {
      const response = await api.post("/auth/logout");
      return response.data;
    } catch (error) {
      console.error("Logout error:", error);
      // Return a successful response even if API call fails
      // This ensures client-side logout works regardless of API
      return { success: true, message: "Logged out locally" };
    }
  },

  getProfile: async () => {
    const cacheKey = "/auth/me";
    return getCachedData(cacheKey, async () => {
      const response = await api.get("/auth/me");
      return response.data;
    });
  },

  updateProfile: async (userData: {
    name?: string;
    email?: string;
    password?: string;
    notificationPreferences?: {
      email?: boolean;
      inApp?: boolean;
    };
  }) => {
    // Clear profile cache when updating
    Array.from(cache.keys())
      .filter((key) => key.includes("/auth/me"))
      .forEach((key) => cache.delete(key));

    const response = await api.put("/auth/me", userData);
    return response.data;
  },
};

// Task services
export const taskApi = {
  getTasks: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    search?: string;
    assignedTo?: string;
    creator?: string;
    dueDate?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => {
    const response = await api.get("/tasks", { params });
    return response.data;
  },

  getTaskById: async (id: string) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (taskData: TaskInput) => {
    const response = await api.post("/tasks", taskData);
    return response.data;
  },

  updateTask: async (id: string, taskData: Partial<TaskInput>) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  deleteTask: async (id: string) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  getTaskDashboard: async () => {
    const response = await api.get("/tasks/dashboard");
    return response.data;
  },
};

// Notification services
export const notificationApi = {
  getNotifications: async (params?: {
    page?: number;
    limit?: number;
    read?: boolean;
  }) => {
    try {
      const response = await api.get("/notifications", { params });
      return response.data;
    } catch (error) {
      // Return empty data structure on error to avoid UI breakage
      console.error("Error fetching notifications:", error);
      return {
        success: false,
        count: 0,
        total: 0,
        totalPages: 0,
        currentPage: 1,
        data: [],
      };
    }
  },

  getUnreadCount: async () => {
    try {
      const response = await api.get("/notifications/unread-count");
      return response.data;
    } catch (error) {
      // Return zero count on error to avoid UI breakage
      console.error("Error fetching unread count:", error);
      return { success: false, count: 0 };
    }
  },

  markAsRead: async (id: string) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch("/notifications/read-all");
    return response.data;
  },

  deleteNotification: async (id: string) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};

// User services
export const userApi = {
  getUsers: async () => {
    // Use the assignable users endpoint accessible to all authenticated users
    const response = await api.get("/users/assignable");
    return response.data;
  },

  getUserById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  updateUser: async (
    id: string,
    userData: {
      name?: string;
      email?: string;
      password?: string;
      role?: "user" | "manager" | "admin";
      notificationPreferences?: {
        email?: boolean;
        inApp?: boolean;
      };
    }
  ) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  updateUserRole: async (id: string, role: "user" | "manager" | "admin") => {
    const response = await api.patch(`/users/${id}/role`, { role });
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/test/${id}`);
    return response.data;
  },
};

// Add request interceptor to handle errors globally
api.interceptors.request.use(
  (config) => {
    // Add timestamp to track request duration
    config.metadata = { startTime: Date.now() };

    // Ensure withCredentials is always set to true for cross-origin requests
    config.withCredentials = true;

    // If there's JWT token in localStorage, add it to headers
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add timestamp to GET requests to prevent browser caching
    if (config.method?.toLowerCase() === "get") {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    // Calculate request duration and track it
    const requestDuration =
      Date.now() - (response.config.metadata?.startTime || Date.now());
    const url = response.config.url || "unknown";
    trackApiCall(url, requestDuration);

    return response;
  },
  (error) => {
    // Track failed requests too
    if (error.config && error.config.metadata) {
      const requestDuration =
        Date.now() - (error.config.metadata.startTime || Date.now());
      const url = error.config.url || "unknown";
      trackApiCall(`${url}:failed`, requestDuration);
    }

    // Network errors or timeout
    if (error.code === "ECONNABORTED" || !error.response) {
      console.error("Network error or timeout:", error.message);
      return Promise.reject({
        response: {
          data: {
            success: false,
            message:
              "Network error or server timeout. Please check your connection and try again.",
          },
        },
      });
    }

    // Handle specific error cases
    if (error.response) {
      // Unauthorized - redirect to login if not already there
      if (
        error.response.status === 401 &&
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        // Clear cache on auth errors
        cache.clear();

        // Use localStorage to prevent infinite loops
        const redirectCount = parseInt(
          localStorage.getItem("authRedirectCount") || "0"
        );
        if (redirectCount < 2) {
          // Allow max 2 redirects within short time
          localStorage.setItem(
            "authRedirectCount",
            (redirectCount + 1).toString()
          );

          // Set a logout flag to prevent auto-login attempts
          localStorage.setItem("logged_out", "true");

          // Redirect to login
          window.location.href = "/login";

          // Reset redirect count after 5 seconds
          setTimeout(() => {
            localStorage.setItem("authRedirectCount", "0");
          }, 5000);
        }
      }

      // Server errors
      if (error.response.status >= 500) {
        console.error("Server error:", error.response.data);
        error.response.data = {
          ...error.response.data,
          message:
            error.response.data?.message ||
            "Server error. Please try again later.",
        };
      }
    }

    return Promise.reject(error);
  }
);

export default api;
