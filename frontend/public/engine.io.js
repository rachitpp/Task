/**
 * WebSocket connection helper for Socket.IO
 * This file helps establish and maintain WebSocket connections
 */
(function () {
  if (typeof window !== "undefined") {
    // Ensure WebSocket is available
    if (!window.WebSocket) {
      console.warn(
        "WebSocket not supported in this browser. Falling back to polling."
      );
    } else {
      console.log("WebSocket is supported in this browser.");
    }

    // Helper to check WebSocket connectivity
    window.checkWebSocketConnectivity = function () {
      return new Promise((resolve, reject) => {
        try {
          const ws = new WebSocket("wss://echo.websocket.org");

          ws.onopen = function () {
            ws.close();
            resolve(true);
          };

          ws.onerror = function (err) {
            console.error("WebSocket test error:", err);
            resolve(false);
          };

          // Set timeout
          setTimeout(() => {
            if (ws.readyState !== WebSocket.OPEN) {
              ws.close();
              resolve(false);
            }
          }, 5000);
        } catch (e) {
          console.error("WebSocket test exception:", e);
          resolve(false);
        }
      });
    };
  }
})();
