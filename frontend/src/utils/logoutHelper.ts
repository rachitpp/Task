/**
 * Complete logout utility to ensure all user data is cleared
 */

// Set up a constant for the last logout tracking key
const LAST_LOGOUT_KEY = "last_logout_timestamp";
const LOGOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

// Force a complete logout, clearing all storage and redirecting to login
export const forceLogout = async () => {
  console.log("Performing complete logout...");

  // Track logout time first - before clearing storage
  const logoutTime = Date.now();
  try {
    // Use multiple storage locations to ensure at least one persists
    localStorage.setItem(LAST_LOGOUT_KEY, logoutTime.toString());
    sessionStorage.setItem(LAST_LOGOUT_KEY, logoutTime.toString());

    // Also set as a cookie for extra reliability
    document.cookie = `${LAST_LOGOUT_KEY}=${logoutTime};path=/;max-age=300`;
  } catch (e) {
    console.error("Error setting logout timestamp:", e);
  }

  // 1. Clear all browser storage
  try {
    // Save the logout timestamp first
    const logoutTimestamp = Date.now().toString();

    // Clear localStorage but preserve logout signal
    const logoutTimeValue = localStorage.getItem(LAST_LOGOUT_KEY);
    localStorage.clear();
    localStorage.setItem(LAST_LOGOUT_KEY, logoutTimeValue || logoutTimestamp);
    localStorage.setItem("logout_timestamp", logoutTimestamp);
    localStorage.setItem("logged_out", "true");
    localStorage.setItem("FORCE_LOGOUT", "true");

    // Clear sessionStorage but preserve logout signal
    const sessionLogoutTimeValue = sessionStorage.getItem(LAST_LOGOUT_KEY);
    sessionStorage.clear();
    sessionStorage.setItem(
      LAST_LOGOUT_KEY,
      sessionLogoutTimeValue || logoutTimestamp
    );
    sessionStorage.setItem("logout_timestamp", logoutTimestamp);
    sessionStorage.setItem("FORCE_LOGOUT", "true");

    // Remove all cookies except the logout tracking cookie
    document.cookie.split(";").forEach(function (c) {
      if (!c.trim().startsWith(LAST_LOGOUT_KEY)) {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      }
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

  // 3. For extra certainty, set logout flags again after all operations
  try {
    // Set multiple flags to ensure at least one persists
    localStorage.setItem("logged_out", "true");
    localStorage.setItem("FORCE_LOGOUT", "true");
    sessionStorage.setItem("FORCE_LOGOUT", "true");

    // Remove auth token explicitly
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
  } catch (e) {
    console.error("Error setting final logout flags:", e);
  }

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

// Check if user has logged out recently (within the defined duration)
export const hasRecentlyLoggedOut = (): boolean => {
  try {
    // Check from multiple possible storage locations
    const lsLogoutTime = localStorage.getItem(LAST_LOGOUT_KEY);
    const ssLogoutTime = sessionStorage.getItem(LAST_LOGOUT_KEY);

    // Get cookie value if exists
    const cookieLogoutTime = document.cookie
      .split(";")
      .find((c) => c.trim().startsWith(`${LAST_LOGOUT_KEY}=`))
      ?.split("=")[1];

    // Use the most recent logout time from any source
    const logoutTimeStr = lsLogoutTime || ssLogoutTime || cookieLogoutTime;

    if (logoutTimeStr) {
      const logoutTime = parseInt(logoutTimeStr);
      const timeSinceLogout = Date.now() - logoutTime;

      // If logged out within the configured duration, consider as "recently logged out"
      return timeSinceLogout < LOGOUT_DURATION_MS;
    }
  } catch (e) {
    console.error("Error checking recent logout:", e);
  }

  return false;
};

// Function to check if user is forcibly logged out
export const isLoggedOut = () => {
  // First check if user has recently logged out
  if (hasRecentlyLoggedOut()) {
    return true;
  }

  // Then check conventional flags
  const hasLogoutFlag =
    localStorage.getItem("logged_out") === "true" ||
    localStorage.getItem("FORCE_LOGOUT") === "true" ||
    sessionStorage.getItem("FORCE_LOGOUT") === "true";

  // Also check for auth token absence as an indicator of logout
  const hasNoAuthToken = !localStorage.getItem("authToken");

  return hasLogoutFlag || hasNoAuthToken;
};

// Function to clear the logged out flag (call when login successful)
export const clearLogoutFlag = () => {
  localStorage.removeItem("logged_out");
  localStorage.removeItem("FORCE_LOGOUT");
  sessionStorage.removeItem("FORCE_LOGOUT");
  localStorage.removeItem("logout_timestamp");
  sessionStorage.removeItem("logout_timestamp");

  // Also clear the dedicated logout tracking
  localStorage.removeItem(LAST_LOGOUT_KEY);
  sessionStorage.removeItem(LAST_LOGOUT_KEY);

  // Clear the cookie if it exists
  document.cookie = `${LAST_LOGOUT_KEY}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};
