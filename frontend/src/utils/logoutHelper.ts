/**
 * Optimized logout utility
 */

// Set up a constant for the logout tracking key
const LAST_LOGOUT_KEY = "last_logout_timestamp";
const LOGOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

// Force a complete logout, clearing all storage
export const forceLogout = async () => {
  console.log("Performing logout...");

  try {
    // Track logout time
    const logoutTime = Date.now().toString();

    // Set logout flags in multiple storage locations for reliability
    localStorage.setItem(LAST_LOGOUT_KEY, logoutTime);
    localStorage.setItem("logged_out", "true");

    // Remove auth token
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");

    // Remove cookies (JWT)
    document.cookie.split(";").forEach(function (c) {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // Try to close any socket connections
    const socketElement = document.getElementById("socket-connection-manager");
    if (socketElement) {
      socketElement.dispatchEvent(new CustomEvent("force-disconnect"));
    }

    // Next.js router will handle the navigation in the components using this function
    console.log("Logout complete - will redirect to login page");
  } catch (error) {
    console.error("Error during logout:", error);
  }
};

// Check if user has logged out recently
export const hasRecentlyLoggedOut = (): boolean => {
  try {
    const logoutTimeStr = localStorage.getItem(LAST_LOGOUT_KEY);

    if (logoutTimeStr) {
      const logoutTime = parseInt(logoutTimeStr);
      const timeSinceLogout = Date.now() - logoutTime;
      return timeSinceLogout < LOGOUT_DURATION_MS;
    }
  } catch (e) {
    console.error("Error checking recent logout:", e);
  }

  return false;
};

// Function to check if user is logged out
export const isLoggedOut = (): boolean => {
  // First check if user has recently logged out
  if (hasRecentlyLoggedOut()) {
    return true;
  }

  // Then check conventional flags
  return (
    localStorage.getItem("logged_out") === "true" ||
    !localStorage.getItem("authToken")
  );
};

// Function to clear the logged out flag
export const clearLogoutFlag = (): void => {
  localStorage.removeItem("logged_out");
  localStorage.removeItem(LAST_LOGOUT_KEY);
};
