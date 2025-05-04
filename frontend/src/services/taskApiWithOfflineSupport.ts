// taskApiWithOfflineSupport.ts - Wraps the existing task API with offline support
import { taskApi } from "./api";
import offlineStorage from "./offlineStorage";
import { Task, TaskInput } from "@/stores/taskStore";

// Extend Task interface for offline functionality
interface OfflineTask extends Task {
  pendingSync?: boolean;
  pendingDeletion?: boolean;
  __v?: number;
}

// API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Enhanced task API with offline support
export const taskApiWithOfflineSupport = {
  // Get tasks - will use cache when offline
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
    try {
      // Try to get from network first
      if (offlineStorage.isOnline()) {
        const response = await taskApi.getTasks(params);

        // Cache tasks for offline use
        if (response.success && response.data && Array.isArray(response.data)) {
          response.data.forEach((task: Task) => {
            offlineStorage.saveData(offlineStorage.STORES.TASKS, task);
          });
        }

        return response;
      } else {
        // We're offline, get from IndexedDB
        console.log("Offline mode: Loading tasks from cache");
        const tasks = await offlineStorage.getAllData<OfflineTask>(
          offlineStorage.STORES.TASKS
        );

        // Apply filtering based on params
        let filteredTasks = [...tasks].filter((task) => !task.pendingDeletion);

        if (params) {
          if (params.status) {
            filteredTasks = filteredTasks.filter(
              (task) => task.status === params.status
            );
          }

          if (params.priority) {
            filteredTasks = filteredTasks.filter(
              (task) => task.priority === params.priority
            );
          }

          if (params.assignedTo) {
            filteredTasks = filteredTasks.filter(
              (task) =>
                task.assignedTo && task.assignedTo._id === params.assignedTo
            );
          }

          if (params.creator) {
            filteredTasks = filteredTasks.filter(
              (task) => task.creator && task.creator._id === params.creator
            );
          }

          if (params.search) {
            const searchTerm = params.search.toLowerCase();
            filteredTasks = filteredTasks.filter(
              (task) =>
                task.title.toLowerCase().includes(searchTerm) ||
                (task.description &&
                  task.description.toLowerCase().includes(searchTerm))
            );
          }

          // Sort tasks
          if (params.sortBy) {
            filteredTasks.sort((a, b) => {
              const aValue = a[params.sortBy as keyof OfflineTask];
              const bValue = b[params.sortBy as keyof OfflineTask];

              // Safely compare values that might be undefined
              if (aValue === undefined && bValue === undefined) return 0;
              if (aValue === undefined)
                return params.sortOrder === "asc" ? -1 : 1;
              if (bValue === undefined)
                return params.sortOrder === "asc" ? 1 : -1;

              if (aValue < bValue) return params.sortOrder === "asc" ? -1 : 1;
              if (aValue > bValue) return params.sortOrder === "asc" ? 1 : -1;
              return 0;
            });
          } else {
            // Default sort by updatedAt
            filteredTasks.sort((a, b) => {
              return (
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime()
              );
            });
          }

          // Handle pagination
          const page = params.page || 1;
          const limit = params.limit || 10;
          const start = (page - 1) * limit;
          const end = page * limit;

          const paginatedTasks = filteredTasks.slice(start, end);

          return {
            success: true,
            count: paginatedTasks.length,
            total: filteredTasks.length,
            totalPages: Math.ceil(filteredTasks.length / limit),
            currentPage: page,
            data: paginatedTasks,
          };
        }

        return {
          success: true,
          count: filteredTasks.length,
          total: filteredTasks.length,
          totalPages: 1,
          currentPage: 1,
          data: filteredTasks,
        };
      }
    } catch (error) {
      console.error("Error fetching tasks with offline support:", error);

      // If there's an error (and we're offline), try to get from cache
      try {
        const tasks = await offlineStorage.getAllData<OfflineTask>(
          offlineStorage.STORES.TASKS
        );
        const filteredTasks = tasks.filter((task) => !task.pendingDeletion);

        return {
          success: true,
          count: filteredTasks.length,
          total: filteredTasks.length,
          totalPages: 1,
          currentPage: 1,
          data: filteredTasks,
        };
      } catch (cacheError) {
        console.error("Error fetching from cache:", cacheError);
        return {
          success: false,
          message: "Failed to fetch tasks",
          data: [],
        };
      }
    }
  },

  // Get task by ID - will use cache when offline
  getTaskById: async (id: string) => {
    try {
      // Try to get from network first
      if (offlineStorage.isOnline()) {
        const response = await taskApi.getTaskById(id);

        // Cache task for offline use
        if (response.success && response.data) {
          offlineStorage.saveData(offlineStorage.STORES.TASKS, response.data);
        }

        return response;
      } else {
        // We're offline, get from IndexedDB
        console.log(`Offline mode: Loading task ${id} from cache`);
        const task = await offlineStorage.getData<OfflineTask>(
          offlineStorage.STORES.TASKS,
          id
        );

        if (task && !task.pendingDeletion) {
          return {
            success: true,
            data: task,
          };
        } else {
          return {
            success: false,
            message: "Task not found in offline cache",
          };
        }
      }
    } catch (error) {
      console.error(`Error fetching task ${id} with offline support:`, error);

      // If there's an error (and we're offline), try to get from cache
      try {
        const task = await offlineStorage.getData<OfflineTask>(
          offlineStorage.STORES.TASKS,
          id
        );

        if (task && !task.pendingDeletion) {
          return {
            success: true,
            data: task,
          };
        } else {
          return {
            success: false,
            message: "Task not found in offline cache",
          };
        }
      } catch (cacheError) {
        console.error("Error fetching from cache:", cacheError);
        return {
          success: false,
          message: "Failed to fetch task",
        };
      }
    }
  },

  // Create task - will queue when offline
  createTask: async (taskData: TaskInput) => {
    try {
      if (offlineStorage.isOnline()) {
        const response = await taskApi.createTask(taskData);

        // Cache the new task
        if (response.success && response.data) {
          offlineStorage.saveData(offlineStorage.STORES.TASKS, response.data);
        }

        return response;
      } else {
        // We're offline, create temporary task and queue for sync
        console.log("Offline mode: Queueing task creation for sync");

        // Create a temporary ID for the task
        const tempId = `temp_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 9)}`;

        // Create a temporary task object
        const tempTask: OfflineTask = {
          _id: tempId,
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority || "low",
          status: (taskData.status || "to-do") as
            | "to-do"
            | "in-progress"
            | "completed"
            | "archived",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isRecurring: taskData.isRecurring || false,
          recurrencePattern: taskData.recurrencePattern || "none",
          tags: taskData.tags || [],
          // Add any other required fields with placeholder values
          assignedTo: taskData.assignedTo
            ? {
                _id: taskData.assignedTo,
                name: "Pending Sync",
                email: "pending@example.com",
              }
            : undefined,
          creator: {
            _id: "offline_user",
            name: "You (Offline)",
            email: "offline@example.com",
          },
          pendingSync: true,
          __v: 0,
        };

        // Save to local storage
        await offlineStorage.saveData(offlineStorage.STORES.TASKS, tempTask);

        // Queue for sync when back online
        await offlineStorage.queueTaskOperation(
          `${API_URL}/tasks`,
          "POST",
          taskData
        );

        return {
          success: true,
          message: "Task created offline and queued for sync",
          data: tempTask,
        };
      }
    } catch (error) {
      console.error("Error creating task with offline support:", error);
      return {
        success: false,
        message: "Failed to create task",
      };
    }
  },

  // Update task - will queue when offline
  updateTask: async (id: string, taskData: Partial<TaskInput>) => {
    try {
      if (offlineStorage.isOnline()) {
        const response = await taskApi.updateTask(id, taskData);

        // Update the cached task
        if (response.success && response.data) {
          offlineStorage.saveData(offlineStorage.STORES.TASKS, response.data);
        }

        return response;
      } else {
        // We're offline, update the task in local storage and queue for sync
        console.log(
          `Offline mode: Updating task ${id} locally and queueing for sync`
        );

        // Get the current task from cache
        const existingTask = await offlineStorage.getData<OfflineTask>(
          offlineStorage.STORES.TASKS,
          id
        );

        if (!existingTask) {
          return {
            success: false,
            message: "Task not found in offline cache",
          };
        }

        // Create updated task
        const updatedTask: OfflineTask = {
          ...existingTask,
          ...(taskData as Partial<OfflineTask>),
          updatedAt: new Date().toISOString(),
          // Mark as pending sync
          pendingSync: true,
        };

        // Save to local storage
        await offlineStorage.saveData(offlineStorage.STORES.TASKS, updatedTask);

        // Queue for sync when back online
        await offlineStorage.queueTaskOperation(
          `${API_URL}/tasks/${id}`,
          "PUT",
          taskData
        );

        return {
          success: true,
          message: "Task updated offline and queued for sync",
          data: updatedTask,
        };
      }
    } catch (error) {
      console.error(`Error updating task ${id} with offline support:`, error);
      return {
        success: false,
        message: "Failed to update task",
      };
    }
  },

  // Delete task - will queue when offline
  deleteTask: async (id: string) => {
    try {
      if (offlineStorage.isOnline()) {
        const response = await taskApi.deleteTask(id);

        // Remove from cache if successful
        if (response.success) {
          await offlineStorage.deleteData(offlineStorage.STORES.TASKS, id);
        }

        return response;
      } else {
        // We're offline, mark for deletion and queue for sync
        console.log(
          `Offline mode: Marking task ${id} for deletion and queueing for sync`
        );

        // Get the current task
        const existingTask = await offlineStorage.getData<OfflineTask>(
          offlineStorage.STORES.TASKS,
          id
        );

        if (!existingTask) {
          return {
            success: false,
            message: "Task not found in offline cache",
          };
        }

        // Mark as pending deletion instead of actually deleting
        // This way we can show it as "pending deletion" in the UI
        const markedTask: OfflineTask = {
          ...existingTask,
          pendingDeletion: true,
          updatedAt: new Date().toISOString(),
        };

        // Save marked task to cache
        await offlineStorage.saveData(offlineStorage.STORES.TASKS, markedTask);

        // Queue for sync when back online
        await offlineStorage.queueTaskOperation(
          `${API_URL}/tasks/${id}`,
          "DELETE",
          {}
        );

        return {
          success: true,
          message: "Task marked for deletion offline and queued for sync",
        };
      }
    } catch (error) {
      console.error(`Error deleting task ${id} with offline support:`, error);
      return {
        success: false,
        message: "Failed to delete task",
      };
    }
  },

  // Get task dashboard data - simplified version for offline
  getTaskDashboard: async () => {
    try {
      if (offlineStorage.isOnline()) {
        const response = await taskApi.getTaskDashboard();
        return response;
      } else {
        // We're offline, calculate dashboard data from cached tasks
        console.log(
          "Offline mode: Calculating dashboard data from cached tasks"
        );

        const tasks = await offlineStorage.getAllData<OfflineTask>(
          offlineStorage.STORES.TASKS
        );

        // Filter out tasks marked for deletion
        const activeTasks = tasks.filter((task) => !task.pendingDeletion);

        // Calculate basic stats
        const completedCount = activeTasks.filter(
          (task) => task.status === "completed"
        ).length;
        const inProgressCount = activeTasks.filter(
          (task) => task.status === "in-progress"
        ).length;
        const todoCount = activeTasks.filter(
          (task) => task.status === "to-do"
        ).length;

        // Count by priority
        const tasksByPriority = {
          high: activeTasks.filter((task) => task.priority === "high").length,
          medium: activeTasks.filter((task) => task.priority === "medium")
            .length,
          low: activeTasks.filter((task) => task.priority === "low").length,
        };

        // Count overdue tasks (due date in the past and not completed)
        const now = new Date();
        const overdueCount = activeTasks.filter((task) => {
          if (!task.dueDate || task.status === "completed") return false;
          return new Date(task.dueDate) < now;
        }).length;

        return {
          success: true,
          data: {
            totalTasks: activeTasks.length,
            completedTasks: completedCount,
            inProgressTasks: inProgressCount,
            todoTasks: todoCount,
            overdueTasks: overdueCount,
            tasksByPriority,
            tasksByUser: {}, // Empty for offline mode
            recentActivity: [], // Empty for offline mode
            taskCompletionRate:
              activeTasks.length > 0
                ? (completedCount / activeTasks.length) * 100
                : 0,
          },
        };
      }
    } catch (error) {
      console.error(
        "Error fetching dashboard data with offline support:",
        error
      );

      // Try to calculate from cache
      try {
        const tasks = await offlineStorage.getAllData<OfflineTask>(
          offlineStorage.STORES.TASKS
        );
        const activeTasks = tasks.filter((task) => !task.pendingDeletion);

        const completedCount = activeTasks.filter(
          (task) => task.status === "completed"
        ).length;
        const inProgressCount = activeTasks.filter(
          (task) => task.status === "in-progress"
        ).length;
        const todoCount = activeTasks.filter(
          (task) => task.status === "to-do"
        ).length;

        return {
          success: true,
          data: {
            totalTasks: activeTasks.length,
            completedTasks: completedCount,
            inProgressTasks: inProgressCount,
            todoTasks: todoCount,
            overdueTasks: 0,
            tasksByPriority: {},
            tasksByUser: {},
            recentActivity: [],
            taskCompletionRate:
              activeTasks.length > 0
                ? (completedCount / activeTasks.length) * 100
                : 0,
          },
        };
      } catch (cacheError) {
        console.error("Error calculating dashboard from cache:", cacheError);
        return {
          success: false,
          message: "Failed to fetch dashboard data",
          data: {
            totalTasks: 0,
            completedTasks: 0,
            inProgressTasks: 0,
            todoTasks: 0,
            overdueTasks: 0,
            tasksByPriority: {},
            tasksByUser: {},
            recentActivity: [],
            taskCompletionRate: 0,
          },
        };
      }
    }
  },

  // Clear offline cache - utility function
  clearOfflineCache: async () => {
    try {
      await offlineStorage.clearStore(offlineStorage.STORES.TASKS);
      await offlineStorage.clearStore(offlineStorage.STORES.PENDING_TASKS);
      return {
        success: true,
        message: "Offline task cache cleared successfully",
      };
    } catch (error) {
      console.error("Error clearing offline cache:", error);
      return {
        success: false,
        message: "Failed to clear offline cache",
      };
    }
  },

  // Check if there are pending operations
  hasPendingOperations: async () => {
    try {
      const pendingTasks = await offlineStorage.getAllData(
        offlineStorage.STORES.PENDING_TASKS
      );
      return pendingTasks.length > 0;
    } catch (error) {
      console.error("Error checking pending operations:", error);
      return false;
    }
  },
};

export default taskApiWithOfflineSupport;
