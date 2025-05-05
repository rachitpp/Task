// Service worker for Task Management System
const CACHE_NAME = "taskmanagement-cache-v1";

// Resources we want to cache
const STATIC_CACHE_URLS = [
  "/",
  "/login",
  "/register",
  "/offline",
  "/favicon.ico",
  "/manifest.json",
];

// Database configuration
const DB_NAME = "taskManagementOfflineDB";
const DB_VERSION = 1;
const STORES = ["pendingTasks", "pendingNotifications"];

// Installation of service worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Cache opened");
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => self.skipWaiting()) // Activate SW immediately
      .then(() => {
        // Ensure DB is initialized with proper object stores
        return initializeDatabase();
      })
  );
});

// Initialize IndexedDB with required object stores
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create object stores if they don't exist
      STORES.forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          console.log(`Creating object store: ${storeName}`);
          db.createObjectStore(storeName, { keyPath: "id" });
        }
      });
    };

    request.onsuccess = () => {
      console.log("Database initialized successfully");
      resolve();
    };

    request.onerror = (event) => {
      console.error("Error initializing database:", event.target.error);
      resolve(); // Resolve anyway to not block SW installation
    };
  });
}

// Activation of service worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Clearing old cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Take control of clients immediately
});

// Strategy: Network first, falling back to cache
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests and browser extensions
  if (
    event.request.method !== "GET" ||
    !event.request.url.startsWith(self.location.origin)
  ) {
    return;
  }

  // Skip API calls for now - we'll handle them differently
  if (event.request.url.includes("/api/")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response to store in cache and return the original
        const responseClone = response.clone();

        // Only cache successful responses
        if (response.ok) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }

        return response;
      })
      .catch(() => {
        // If network request fails, try to serve from cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // If not in cache, try to serve the offline page
          if (event.request.headers.get("accept").includes("text/html")) {
            return caches.match("/offline");
          }

          // Fallback for other resources
          return new Response("Resource not available offline", {
            status: 503,
            statusText: "Service Unavailable",
          });
        });
      })
  );
});

// Handle background sync for offline data
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-tasks") {
    event.waitUntil(syncTasks());
  } else if (event.tag === "sync-notifications") {
    event.waitUntil(syncNotifications());
  }
});

// Function to sync pending tasks
async function syncTasks() {
  try {
    // Ensure object store exists before trying to access
    if (await ensureObjectStore(DB_NAME, "pendingTasks")) {
      const pendingTasksRequests = await getDBData("pendingTasks");

      if (pendingTasksRequests.length === 0) {
        console.log("No pending tasks to sync");
        return;
      }

      await Promise.all(
        pendingTasksRequests.map(async (request) => {
          try {
            const { url, method, body, id } = request;
            const response = await fetch(url, {
              method,
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(body),
            });

            if (response.ok) {
              // If successful, remove from pending queue
              await removeDBData("pendingTasks", id);
            }
          } catch (error) {
            console.error("Error syncing task:", error);
          }
        })
      );

      // Notify clients that sync is complete
      const clients = await self.clients.matchAll();
      clients.forEach((client) => {
        client.postMessage({ type: "SYNC_COMPLETE", category: "tasks" });
      });
    } else {
      console.log("No pending tasks to sync - store not ready");
    }
  } catch (error) {
    console.error("Error during task sync:", error);
  }
}

// Function to sync notifications actions
async function syncNotifications() {
  try {
    // Ensure object store exists before trying to access
    if (await ensureObjectStore(DB_NAME, "pendingNotifications")) {
      const pendingNotifications = await getDBData("pendingNotifications");

      if (pendingNotifications.length === 0) {
        console.log("No pending notifications to sync");
        return;
      }

      await Promise.all(
        pendingNotifications.map(async (notification) => {
          try {
            const { url, method, body, id } = notification;
            const response = await fetch(url, {
              method,
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(body),
            });

            if (response.ok) {
              // If successful, remove from pending queue
              await removeDBData("pendingNotifications", id);
            }
          } catch (error) {
            console.error("Error syncing notification:", error);
          }
        })
      );

      // Notify clients that sync is complete
      const clients = await self.clients.matchAll();
      clients.forEach((client) => {
        client.postMessage({
          type: "SYNC_COMPLETE",
          category: "notifications",
        });
      });
    } else {
      console.log("No pending notifications to sync - store not ready");
    }
  } catch (error) {
    console.error("Error during notification sync:", error);
  }
}

// Check if object store exists and is accessible
async function ensureObjectStore(dbName, storeName) {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(dbName);

      request.onerror = () => {
        console.log(`Error checking object store ${storeName}`);
        resolve(false);
      };

      request.onsuccess = (event) => {
        const db = event.target.result;
        const exists = db.objectStoreNames.contains(storeName);
        db.close();

        if (!exists) {
          console.log(`Object store ${storeName} does not exist yet`);
          // Try to create the store
          initializeDatabase().then(() => resolve(false));
        } else {
          resolve(true);
        }
      };
    } catch (error) {
      console.error("Error in ensureObjectStore:", error);
      resolve(false);
    }
  });
}

// IndexedDB helper functions
function getDBData(storeName) {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error("IndexedDB error:", event.target.error);
        // Return empty array instead of rejecting
        resolve([]);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: "id" });
        }
      };

      request.onsuccess = (event) => {
        try {
          const db = event.target.result;

          // Check if the object store exists
          if (!db.objectStoreNames.contains(storeName)) {
            console.warn(`Object store ${storeName} does not exist`);
            db.close();
            return resolve([]);
          }

          try {
            const transaction = db.transaction(storeName, "readonly");
            const store = transaction.objectStore(storeName);

            transaction.onerror = (e) => {
              console.error("Transaction error:", e.target.error);
              db.close();
              resolve([]);
            };

            const getAllRequest = store.getAll();

            getAllRequest.onsuccess = () => {
              db.close();
              resolve(getAllRequest.result);
            };

            getAllRequest.onerror = (e) => {
              console.error("Error getting data:", e.target.error);
              db.close();
              resolve([]);
            };
          } catch (transactionError) {
            console.error("Error creating transaction:", transactionError);
            db.close();
            resolve([]);
          }
        } catch (dbError) {
          console.error("Error with database:", dbError);
          resolve([]);
        }
      };
    } catch (outerError) {
      console.error("Outer error with IndexedDB:", outerError);
      resolve([]);
    }
  });
}

function removeDBData(storeName, id) {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error("IndexedDB error:", event.target.error);
        resolve();
      };

      request.onsuccess = (event) => {
        try {
          const db = event.target.result;

          // Check if the object store exists
          if (!db.objectStoreNames.contains(storeName)) {
            console.warn(`Object store ${storeName} does not exist`);
            db.close();
            return resolve();
          }

          try {
            const transaction = db.transaction(storeName, "readwrite");
            const store = transaction.objectStore(storeName);

            transaction.onerror = (e) => {
              console.error("Transaction error:", e.target.error);
              db.close();
              resolve();
            };

            const deleteRequest = store.delete(id);

            deleteRequest.onsuccess = () => {
              db.close();
              resolve();
            };

            deleteRequest.onerror = (e) => {
              console.error("Error deleting data:", e.target.error);
              db.close();
              resolve();
            };
          } catch (transactionError) {
            console.error("Error creating transaction:", transactionError);
            db.close();
            resolve();
          }
        } catch (dbError) {
          console.error("Error with database:", dbError);
          resolve();
        }
      };
    } catch (outerError) {
      console.error("Outer error with IndexedDB:", outerError);
      resolve();
    }
  });
}
