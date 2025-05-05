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

  // Small delay to allow storage clearing to complete
  setTimeout(() => {
    window.location.href = "/login";
  }, 100);
};

// Function to check if user is forcibly logged out
export const isLoggedOut = () => {
  return localStorage.getItem("logged_out") === "true";
};

// Function to clear the logged out flag (call when login successful)
export const clearLogoutFlag = () => {
  localStorage.removeItem("logged_out");
};
