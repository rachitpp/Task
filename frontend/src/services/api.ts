import axios from "axios";
import { TaskInput } from "@/stores/taskStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Create an axios instance with custom defaults
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies (JWT)
});

// Auth services
export const authApi = {
  register: async (userData: {
    name: string;
    email: string;
    password: string;
  }) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  login: async (userData: { email: string; password: string }) => {
    const response = await api.post("/auth/login", userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/auth/me");
    return response.data;
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
    // Ensure withCredentials is always set to true for cross-origin requests
    config.withCredentials = true;

    // If there's JWT token in localStorage, add it to headers
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error cases
    if (error.response) {
      // Unauthorized - redirect to login if not already there
      if (
        error.response.status === 401 &&
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
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
          window.location.href = "/login";

          // Reset redirect count after 5 seconds
          setTimeout(() => {
            localStorage.setItem("authRedirectCount", "0");
          }, 5000);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
