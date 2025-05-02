import { create } from "zustand";
import { notificationApi } from "../services/api";
import { AxiosError } from "axios";

// Define the notification type
export interface Notification {
  _id: string;
  recipient: string;
  sender?: {
    _id: string;
    name: string;
    email: string;
  };
  type:
    | "task-assigned"
    | "task-updated"
    | "task-completed"
    | "task-deadline"
    | "task-status-change"
    | "system";
  title: string;
  message: string;
  task?: {
    _id: string;
    title: string;
    description?: string;
  };
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

// Define error type
type ApiError = AxiosError<{
  message: string;
  success: boolean;
}>;

// Define the notification filter type
export interface NotificationFilter {
  page?: number;
  limit?: number;
  read?: boolean;
}

// Define notification store state and actions
interface NotificationState {
  notifications: Notification[];
  totalNotifications: number;
  totalPages: number;
  currentPage: number;
  unreadCount: number;
  loading: boolean;
  error: string | null;
  filter: NotificationFilter;

  // Actions
  fetchNotifications: (filter?: NotificationFilter) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  setFilter: (filter: NotificationFilter) => void;
  clearError: () => void;
  addNotification: (notification: Notification) => void;
}

// Create the notification store
const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  totalNotifications: 0,
  totalPages: 0,
  currentPage: 1,
  unreadCount: 0,
  loading: false,
  error: null,
  filter: {
    page: 1,
    limit: 10,
  },

  fetchNotifications: async (filter?: NotificationFilter) => {
    try {
      set({ loading: true, error: null });
      const queryFilter = filter
        ? { ...get().filter, ...filter }
        : get().filter;

      const response = await notificationApi.getNotifications(queryFilter);

      set({
        notifications: response.data,
        totalNotifications: response.total,
        totalPages: response.totalPages,
        currentPage: response.currentPage,
        loading: false,
        filter: queryFilter,
      });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({
        loading: false,
        error:
          apiError.response?.data?.message || "Failed to fetch notifications",
      });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await notificationApi.getUnreadCount();
      set({ unreadCount: response.count });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error("Failed to fetch unread count:", apiError);
      // Don't update the error state to avoid blocking UI
    }
  },

  markAsRead: async (id: string) => {
    try {
      set({ loading: true, error: null });
      await notificationApi.markAsRead(id);

      // Update notification in state
      set((state: NotificationState) => ({
        notifications: state.notifications.map((notification: Notification) =>
          notification._id === id
            ? { ...notification, isRead: true }
            : notification
        ),
        loading: false,
        // Decrement unread count if the notification was unread
        unreadCount: state.notifications.find((n) => n._id === id && !n.isRead)
          ? state.unreadCount - 1
          : state.unreadCount,
      }));

      // Update unread count
      await get().fetchUnreadCount();
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({
        loading: false,
        error:
          apiError.response?.data?.message ||
          "Failed to mark notification as read",
      });
    }
  },

  markAllAsRead: async () => {
    try {
      set({ loading: true, error: null });
      await notificationApi.markAllAsRead();

      // Update all notifications in state
      set((state: NotificationState) => ({
        notifications: state.notifications.map(
          (notification: Notification) => ({
            ...notification,
            isRead: true,
          })
        ),
        unreadCount: 0,
        loading: false,
      }));
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({
        loading: false,
        error:
          apiError.response?.data?.message ||
          "Failed to mark all notifications as read",
      });
    }
  },

  deleteNotification: async (id: string) => {
    try {
      set({ loading: true, error: null });
      await notificationApi.deleteNotification(id);

      // Remove notification from state
      set((state: NotificationState) => {
        const deletedNotification = state.notifications.find(
          (n: Notification) => n._id === id
        );
        const wasUnread = deletedNotification && !deletedNotification.isRead;

        return {
          notifications: state.notifications.filter(
            (n: Notification) => n._id !== id
          ),
          totalNotifications: state.totalNotifications - 1,
          unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount,
          loading: false,
        };
      });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({
        loading: false,
        error:
          apiError.response?.data?.message || "Failed to delete notification",
      });
    }
  },

  setFilter: (filter: NotificationFilter) => {
    set({ filter: { ...get().filter, ...filter } });
  },

  clearError: () => {
    set({ error: null });
  },

  // New action to add a notification received from websocket
  addNotification: (notification: Notification) => {
    set((state: NotificationState) => {
      // Check if notification already exists in the state
      const exists = state.notifications.some(
        (n) => n._id === notification._id
      );

      if (exists) {
        return state; // No change needed
      }

      // Add the new notification at the beginning of the list
      return {
        notifications: [notification, ...state.notifications],
        totalNotifications: state.totalNotifications + 1,
        unreadCount: state.unreadCount + 1, // Increment unread count
      };
    });
  },
}));

export default useNotificationStore;
