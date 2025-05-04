"use client";

import { useEffect, useState } from "react";
import offlineStorage from "@/services/offlineStorage";

// Type definition for ServiceWorkerRegistration with sync property
interface SyncServiceWorkerRegistration extends ServiceWorkerRegistration {
  sync: {
    register: (tag: string) => Promise<void>;
  };
}

export default function ServiceWorkerRegistration() {
  const [isOnline, setIsOnline] = useState(true);
  const [showReloadPrompt, setShowReloadPrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(
    null
  );

  // Register service worker and handle updates
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Initial online status
      setIsOnline(navigator.onLine);

      // Listen for service worker state changes
      const handleServiceWorkerUpdate = (reg: ServiceWorkerRegistration) => {
        if (reg.waiting) {
          setWaitingWorker(reg.waiting);
          setShowReloadPrompt(true);
        }
      };

      // Register the service worker
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/service-worker.js")
          .then((reg) => {
            console.log("Service Worker registered with scope:", reg.scope);

            // Check if there's a waiting service worker
            if (reg.waiting) {
              handleServiceWorkerUpdate(reg);
            }

            // Handle new updates
            reg.onupdatefound = () => {
              const installingWorker = reg.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (
                    installingWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                  ) {
                    handleServiceWorkerUpdate(reg);
                  }
                };
              }
            };

            // Register for background sync if supported
            offlineStorage.registerBackgroundSync().then((success) => {
              if (success) {
                console.log("Background sync registered successfully");
              }
            });
          })
          .catch((error) => {
            console.error("Service Worker registration failed:", error);
          });
      });

      // Set up online/offline listeners
      const handleOnline = () => {
        setIsOnline(true);
        console.log("App is online. Syncing data...");
        // Trigger a sync when coming back online
        if ("SyncManager" in window) {
          navigator.serviceWorker.ready.then((registration) => {
            (registration as SyncServiceWorkerRegistration).sync.register(
              "sync-tasks"
            );
            (registration as SyncServiceWorkerRegistration).sync.register(
              "sync-notifications"
            );
          });
        }
      };

      const handleOffline = () => {
        setIsOnline(false);
        console.log("App is offline. Some features may be limited.");
      };

      const cleanup = offlineStorage.setupConnectivityListeners(
        handleOnline,
        handleOffline
      );

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "SYNC_COMPLETE") {
          console.log(`Sync complete for: ${event.data.category}`);
          // You can dispatch actions or update state here based on sync results
        }
      });

      return () => {
        cleanup();
      };
    }
  }, []);

  // Handle clicking the reload button for service worker updates
  const handleReload = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
      setShowReloadPrompt(false);
      window.location.reload();
    }
  };

  return (
    <>
      {/* Offline notification */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 p-3 bg-yellow-500 text-white rounded-lg shadow-lg z-50 flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>You&apos;re offline. Some features may be limited.</span>
        </div>
      )}

      {/* Update prompt */}
      {showReloadPrompt && (
        <div className="fixed bottom-4 right-4 p-4 bg-blue-600 text-white rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between">
            <div className="mr-4">
              <p className="font-medium">App update available!</p>
              <p className="text-sm">Reload to update.</p>
            </div>
            <button
              onClick={handleReload}
              className="px-3 py-1 bg-white text-blue-600 rounded hover:bg-blue-100"
            >
              Reload
            </button>
          </div>
        </div>
      )}
    </>
  );
}
