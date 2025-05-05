/**
 * Complete logout utility to ensure all user data is cleared
 */

// Force a complete logout, clearing all storage and redirecting to login
export const forceLogout = async () => {
  console.log("Performing complete logout...");

  // 1. Clear all browser storage
  try {
    // Clear localStorage
    localStorage.clear();

    // Clear sessionStorage
    sessionStorage.clear();

    // Add a strong logout signal
    sessionStorage.setItem("FORCE_LOGOUT", "true");
    localStorage.setItem("FORCE_LOGOUT", "true");
    localStorage.setItem("logged_out", "true");

    // Remove all cookies
    document.cookie.split(";").forEach(function (c) {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // Try to delete IndexedDB
    try {
      const dbDeleteRequest = indexedDB.deleteDatabase(
        "taskManagementOfflineDB"
      );
      dbDeleteRequest.onsuccess = () =>
        console.log("IndexedDB successfully deleted");
      dbDeleteRequest.onerror = () => console.error("Error deleting IndexedDB");
    } catch (e) {
      console.error("Error accessing IndexedDB:", e);
    }

    // Clear cache API if available
    try {
      if ("caches" in window) {
        caches.keys().then((names) => {
          names.forEach((name) => {
            caches.delete(name);
          });
        });
      }
    } catch (e) {
      console.error("Error clearing cache:", e);
    }
  } catch (error) {
    console.error("Error clearing browser storage:", error);
  }

  // 2. Close any socket connections
  try {
    const socketElement = document.getElementById("socket-connection-manager");
    if (socketElement) {
      socketElement.dispatchEvent(new CustomEvent("force-disconnect"));
    }
  } catch (error) {
    console.error("Error disconnecting sockets:", error);
  }

  // 3. For extra certainty, add a logout flag
  localStorage.setItem("logged_out", "true");

  // 4. Force reload and redirect to login page
  console.log("Redirecting to login page...");

  // Use a more aggressive reload approach
  try {
    // Force a full page reload with cache clearing
    window.location.href = "/login?t=" + new Date().getTime();
  } catch (e) {
    console.error("Error during redirect:", e);
    // Fallback
    window.location.replace("/login");
  }
};

// Hard reload the page to clear any React component state
export const hardReload = (path: string = window.location.pathname) => {
  // Add cache-busting parameter
  const url =
    path + (path.includes("?") ? "&" : "?") + "_=" + new Date().getTime();

  try {
    // Attempt to use location.replace for a clean reload
    window.location.replace(url);
  } catch (e) {
    // Fallback to basic href
    window.location.href = url;
  }
};

// Function to check if user is forcibly logged out
export const isLoggedOut = () => {
  return (
    localStorage.getItem("logged_out") === "true" ||
    localStorage.getItem("FORCE_LOGOUT") === "true" ||
    sessionStorage.getItem("FORCE_LOGOUT") === "true"
  );
};

// Function to clear the logged out flag (call when login successful)
export const clearLogoutFlag = () => {
  localStorage.removeItem("logged_out");
  localStorage.removeItem("FORCE_LOGOUT");
  sessionStorage.removeItem("FORCE_LOGOUT");
};
