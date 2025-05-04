// offlineStorage.ts - IndexedDB implementation for offline capability

// Define types for our data
interface PendingOperation {
  id?: number;
  url: string;
  method: string;
  body: unknown;
  timestamp: number;
}

interface UserDataEntry {
  key: string;
  data: Record<string, unknown>;
}

// Define database structure
const DB_NAME = "taskManagementOfflineDB";
const DB_VERSION = 1;
const STORES = {
  TASKS: "tasks",
  PENDING_TASKS: "pendingTasks",
  NOTIFICATIONS: "notifications",
  PENDING_NOTIFICATIONS: "pendingNotifications",
  USER_DATA: "userData",
};

// Open database connection
export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // Create object stores on database initialization/upgrade
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create stores with appropriate indexes if they don't exist
      if (!db.objectStoreNames.contains(STORES.TASKS)) {
        const taskStore = db.createObjectStore(STORES.TASKS, {
          keyPath: "_id",
        });
        // Create indexes for common queries
        taskStore.createIndex("status", "status", { unique: false });
        taskStore.createIndex("priority", "priority", { unique: false });
        taskStore.createIndex("assignedTo", "assignedTo._id", {
          unique: false,
        });
        taskStore.createIndex("dueDate", "dueDate", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.PENDING_TASKS)) {
        const pendingTasksStore = db.createObjectStore(STORES.PENDING_TASKS, {
          keyPath: "id",
          autoIncrement: true,
        });
        pendingTasksStore.createIndex("timestamp", "timestamp", {
          unique: false,
        });
      }

      if (!db.objectStoreNames.contains(STORES.NOTIFICATIONS)) {
        const notificationStore = db.createObjectStore(STORES.NOTIFICATIONS, {
          keyPath: "_id",
        });
        notificationStore.createIndex("isRead", "isRead", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.PENDING_NOTIFICATIONS)) {
        const pendingNotificationsStore = db.createObjectStore(
          STORES.PENDING_NOTIFICATIONS,
          {
            keyPath: "id",
            autoIncrement: true,
          }
        );
        pendingNotificationsStore.createIndex("timestamp", "timestamp", {
          unique: false,
        });
      }

      if (!db.objectStoreNames.contains(STORES.USER_DATA)) {
        db.createObjectStore(STORES.USER_DATA, { keyPath: "key" });
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onerror = (event) => {
      reject(
        `Error opening database: ${(event.target as IDBOpenDBRequest).error}`
      );
    };
  });
};

// Generic function to add/update data in a store
export const saveData = <T>(
  storeName: string,
  data: T
): Promise<IDBValidKey> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(`Error saving data to ${storeName}`);
      };

      // Close the database when transaction is complete
      transaction.oncomplete = () => {
        db.close();
      };
    } catch (error) {
      reject(`Database error: ${error}`);
    }
  });
};

// Generic function to retrieve data from a store
export const getData = <T>(
  storeName: string,
  key: IDBValidKey
): Promise<T | null> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(`Error getting data from ${storeName}`);
      };

      // Close the database when transaction is complete
      transaction.oncomplete = () => {
        db.close();
      };
    } catch (error) {
      reject(`Database error: ${error}`);
    }
  });
};

// Generic function to retrieve all data from a store
export const getAllData = <T>(storeName: string): Promise<T[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(`Error getting all data from ${storeName}`);
      };

      // Close the database when transaction is complete
      transaction.oncomplete = () => {
        db.close();
      };
    } catch (error) {
      reject(`Database error: ${error}`);
    }
  });
};

// Function to delete data from a store
export const deleteData = (
  storeName: string,
  key: IDBValidKey
): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(`Error deleting data from ${storeName}`);
      };

      // Close the database when transaction is complete
      transaction.oncomplete = () => {
        db.close();
      };
    } catch (error) {
      reject(`Database error: ${error}`);
    }
  });
};

// Function to clear all data from a store
export const clearStore = (storeName: string): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(`Error clearing ${storeName}`);
      };

      // Close the database when transaction is complete
      transaction.oncomplete = () => {
        db.close();
      };
    } catch (error) {
      reject(`Database error: ${error}`);
    }
  });
};

// Queue a task operation to be executed when back online
export const queueTaskOperation = (
  url: string,
  method: string,
  body: unknown
): Promise<IDBValidKey> => {
  const pendingTask: PendingOperation = {
    url,
    method,
    body,
    timestamp: new Date().getTime(),
  };

  return saveData(STORES.PENDING_TASKS, pendingTask);
};

// Queue a notification operation to be executed when back online
export const queueNotificationOperation = (
  url: string,
  method: string,
  body: unknown
): Promise<IDBValidKey> => {
  const pendingNotification: PendingOperation = {
    url,
    method,
    body,
    timestamp: new Date().getTime(),
  };

  return saveData(STORES.PENDING_NOTIFICATIONS, pendingNotification);
};

// Check if the app is online
export const isOnline = (): boolean => {
  return typeof navigator !== "undefined" && navigator.onLine;
};

// Save current user data
export const saveCurrentUser = (
  userData: Record<string, unknown>
): Promise<IDBValidKey> => {
  return saveData<UserDataEntry>(STORES.USER_DATA, {
    key: "currentUser",
    data: userData,
  });
};

// Get current user data
export const getCurrentUser = async (): Promise<Record<
  string,
  unknown
> | null> => {
  const result = await getData<UserDataEntry>(STORES.USER_DATA, "currentUser");
  return result ? result.data : null;
};

// Add event listeners for online/offline status
export const setupConnectivityListeners = (
  onOnline: () => void,
  onOffline: () => void
): (() => void) => {
  if (typeof window !== "undefined") {
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    // Return cleanup function
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }
  return () => {};
};

// Type definition for ServiceWorkerRegistration with sync property
interface SyncServiceWorkerRegistration extends ServiceWorkerRegistration {
  sync: {
    register: (tag: string) => Promise<void>;
  };
}

// Register for background sync if supported
export const registerBackgroundSync = async (): Promise<boolean> => {
  if ("serviceWorker" in navigator && "SyncManager" in window) {
    try {
      const registration = (await navigator.serviceWorker
        .ready) as SyncServiceWorkerRegistration;
      await registration.sync.register("sync-tasks");
      await registration.sync.register("sync-notifications");
      return true;
    } catch (error) {
      console.error("Background sync registration error:", error);
      return false;
    }
  }
  return false;
};

export default {
  STORES,
  saveData,
  getData,
  getAllData,
  deleteData,
  clearStore,
  queueTaskOperation,
  queueNotificationOperation,
  isOnline,
  saveCurrentUser,
  getCurrentUser,
  setupConnectivityListeners,
  registerBackgroundSync,
};
