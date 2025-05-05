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
  );
});

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
    const pendingTasksRequests = await getDBData("pendingTasks");

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
  } catch (error) {
    console.error("Error during task sync:", error);
  }
}

// Function to sync notifications actions
async function syncNotifications() {
  try {
    const pendingNotifications = await getDBData("pendingNotifications");

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
      client.postMessage({ type: "SYNC_COMPLETE", category: "notifications" });
    });
  } catch (error) {
    console.error("Error during notification sync:", error);
  }
}

// IndexedDB helper functions
function getDBData(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("taskManagementOfflineDB", 1);

    request.onerror = (event) =>
      reject("IndexedDB error: " + event.target.errorCode);

    request.onsuccess = (event) => {
      const db = event.target.result;

      // Check if the object store exists
      if (!db.objectStoreNames.contains(storeName)) {
        console.warn(`Object store ${storeName} does not exist`);
        return resolve([]);
      }

      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject("Error getting data from IndexedDB");
    };
  });
}

function removeDBData(storeName, id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("taskManagementOfflineDB", 1);

    request.onerror = (event) =>
      reject("IndexedDB error: " + event.target.errorCode);

    request.onsuccess = (event) => {
      const db = event.target.result;

      // Check if the object store exists
      if (!db.objectStoreNames.contains(storeName)) {
        console.warn(`Object store ${storeName} does not exist`);
        return resolve();
      }

      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const deleteRequest = store.delete(id);

      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () =>
        reject("Error deleting data from IndexedDB");
    };
  });
}
