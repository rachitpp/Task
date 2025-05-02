import { create } from "zustand";
import { taskApi } from "../services/api";
import { AxiosError } from "axios";

// Define the task type
export interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: "low" | "medium" | "high";
  status: "to-do" | "in-progress" | "completed" | "archived";
  creator: {
    _id: string;
    name: string;
    email: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  isRecurring: boolean;
  recurrencePattern: "daily" | "weekly" | "monthly" | "none";
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// API task input type (different from the response Task type)
export interface TaskInput {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: "low" | "medium" | "high";
  status?: "to-do" | "in-progress" | "completed" | "archived";
  assignedTo?: string; // This is a user ID string, not an object
  isRecurring?: boolean;
  recurrencePattern?: "daily" | "weekly" | "monthly" | "none";
  tags?: string[];
}

// Define the task filter type
export interface TaskFilter {
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
}

// Define the task dashboard type
export interface TaskDashboard {
  overview: {
    assignedTasks: number;
    createdTasks: number;
    overdueTasks: number;
  };
  tasksByStatus: Record<string, number>;
  tasksByPriority: Record<string, number>;
  recentTasks: Task[];
}

// Define error type
type ApiError = AxiosError<{
  message: string;
  success: boolean;
}>;

// Define the task store state and actions
interface TaskState {
  tasks: Task[];
  task: Task | null;
  dashboard: TaskDashboard | null;
  totalTasks: number;
  totalPages: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
  filter: TaskFilter;

  // Actions
  fetchTasks: (filter?: TaskFilter) => Promise<void>;
  fetchTaskById: (id: string) => Promise<void>;
  fetchTask: (id: string) => Promise<void>;
  createTask: (taskData: TaskInput) => Promise<void>;
  updateTask: (id: string, taskData: Partial<TaskInput>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  fetchDashboard: () => Promise<void>;
  setFilter: (filter: TaskFilter) => void;
  clearError: () => void;
  resetTasks: () => void;
}

// Create the task store
const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  task: null,
  dashboard: null,
  totalTasks: 0,
  totalPages: 1,
  currentPage: 1,
  loading: false,
  error: null,
  filter: {
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  },

  fetchTasks: async (filter?: TaskFilter) => {
    try {
      set({ loading: true, error: null });
      const queryFilter = filter
        ? { ...get().filter, ...filter }
        : get().filter;

      const response = await taskApi.getTasks(queryFilter);

      set({
        tasks: response.data,
        totalTasks: response.total,
        totalPages: response.totalPages,
        currentPage: response.currentPage,
        loading: false,
        filter: queryFilter,
      });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({
        loading: false,
        error: apiError.response?.data?.message || "Failed to fetch tasks",
      });
    }
  },

  fetchTaskById: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const response = await taskApi.getTaskById(id);
      set({ task: response.data, loading: false });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({
        loading: false,
        error: apiError.response?.data?.message || "Failed to fetch task",
      });
    }
  },

  fetchTask: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const response = await taskApi.getTaskById(id);
      set({ task: response.data, loading: false });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({
        loading: false,
        error: apiError.response?.data?.message || "Failed to fetch task",
      });
    }
  },

  createTask: async (taskData: TaskInput) => {
    try {
      set({ loading: true, error: null });
      await taskApi.createTask(taskData);
      await get().fetchTasks(); // Refresh task list
      set({ loading: false });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({
        loading: false,
        error: apiError.response?.data?.message || "Failed to create task",
      });
    }
  },

  updateTask: async (id: string, taskData: Partial<TaskInput>) => {
    try {
      set({ loading: true, error: null });
      await taskApi.updateTask(id, taskData);

      // Update task in state if it's the currently selected task
      const currentTask = get().task;
      if (currentTask && currentTask._id === id) {
        // Always fetch the complete task after update to ensure we have the correct data
        // This is especially important for assignedTo which is different in API vs UI
        const response = await taskApi.getTaskById(id);
        set({ task: response.data });
      }

      // Refresh task list
      await get().fetchTasks();
      set({ loading: false });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({
        loading: false,
        error: apiError.response?.data?.message || "Failed to update task",
      });
    }
  },

  deleteTask: async (id: string) => {
    try {
      set({ loading: true, error: null });
      await taskApi.deleteTask(id);

      // Clear current task if it's the deleted one
      const currentTask = get().task;
      if (currentTask && currentTask._id === id) {
        set({ task: null });
      }

      // Update task list by removing the deleted task
      set((state: TaskState) => ({
        tasks: state.tasks.filter((task: Task) => task._id !== id),
        totalTasks: state.totalTasks - 1,
        loading: false,
      }));
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({
        loading: false,
        error: apiError.response?.data?.message || "Failed to delete task",
      });
    }
  },

  fetchDashboard: async () => {
    try {
      set({ loading: true, error: null });
      const response = await taskApi.getTaskDashboard();
      set({ dashboard: response.data, loading: false });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({
        loading: false,
        error: apiError.response?.data?.message || "Failed to fetch dashboard",
      });
    }
  },

  setFilter: (filter: TaskFilter) => {
    set({ filter: { ...get().filter, ...filter } });
  },

  clearError: () => {
    set({ error: null });
  },

  // Reset tasks state when navigating away
  resetTasks: () => {
    set({
      tasks: [],
      totalTasks: 0,
      totalPages: 1,
      currentPage: 1,
      error: null,
      filter: {
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      },
    });
  },
}));

export default useTaskStore;
