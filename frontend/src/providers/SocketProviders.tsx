"use client";

import React, { createContext, useEffect, useContext, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import useAuthStore from "@/stores/authStore";
import useNotificationStore from "@/stores/notificationStore";

interface SocketContextProps {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextProps>({ socket: null });

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user, initialized } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const [socket, setSocket] = React.useState<Socket | null>(null);
  const [connectionAttempts, setConnectionAttempts] = React.useState(0);
  const maxRetries = 5;

  // Reference to track if component is mounted
  const isMounted = React.useRef(true);

  // Element ID for socket disconnect events
  const socketManagerId = "socket-connection-manager";

  // Force disconnect handler
  const handleForceDisconnect = React.useCallback(() => {
    if (socket) {
      console.log("Force disconnecting socket...");
      socket.disconnect();
      setSocket(null);
    }
  }, [socket]);

  // Set up logout event listener
  React.useEffect(() => {
    // Create socket manager element if it doesn't exist
    let socketManagerElement = document.getElementById(socketManagerId);
    if (!socketManagerElement) {
      socketManagerElement = document.createElement("div");
      socketManagerElement.id = socketManagerId;
      socketManagerElement.style.display = "none";
      document.body.appendChild(socketManagerElement);
    }

    // Add event listener
    socketManagerElement.addEventListener(
      "force-disconnect",
      handleForceDisconnect
    );

    // Cleanup on unmount
    return () => {
      socketManagerElement?.removeEventListener(
        "force-disconnect",
        handleForceDisconnect
      );
      isMounted.current = false;
    };
  }, [handleForceDisconnect]);

  // Main socket connection effect
  useEffect(() => {
    // Clean up previous socket if it exists
    if (socket) {
      socket.disconnect();
    }

    // Only connect to socket if user is authenticated and initialization is complete
    if (!initialized || !user) {
      setSocket(null);
      return;
    }

    // Initialize socket connection
    const SOCKET_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    // Get auth token from localStorage
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

    // Remove any trailing slashes from the URL to prevent namespace errors
    const cleanSocketUrl = SOCKET_URL.replace(/\/$/, "");

    console.log("Connecting to Socket.io server at:", cleanSocketUrl);

    try {
      const newSocket = io(cleanSocketUrl, {
        withCredentials: true,
        transports: ["polling", "websocket"],
        path: "/socket.io", // Explicit path
        auth: {
          token: token,
          userId: user._id, // Add user ID to auth object for authentication
        },
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: maxRetries,
        reconnectionDelay: 1000,
        autoConnect: true,
      });

      // Log connection events for debugging
      newSocket.on("connect_error", (err) => {
        console.warn("Socket connection error:", err.message);
        setConnectionAttempts((prev) => prev + 1);

        if (connectionAttempts >= maxRetries) {
          console.error("Maximum socket connection attempts reached.");
          // Don't keep trying forever - disconnect after max retries
          newSocket.disconnect();
        }
      });

      newSocket.io.on("reconnect_attempt", (attempt) => {
        console.log(`Socket reconnection attempt ${attempt}`);
      });

      newSocket.io.on("reconnect", (attempt) => {
        console.log(`Socket reconnected after ${attempt} attempts`);
        setConnectionAttempts(0); // Reset counter on successful reconnection

        // Re-authenticate on reconnection
        if (user) {
          newSocket.emit("authenticate", user._id);
        }
      });

      newSocket.io.on("reconnect_failed", () => {
        console.error("Socket reconnection failed after all attempts");
      });

      newSocket.io.on("error", (error) => {
        console.error("Socket error:", error);
      });

      // Set socket in state
      if (isMounted.current) {
        setSocket(newSocket);
      }

      // Set up socket connection
      if (newSocket) {
        // Authenticate socket with user ID
        newSocket.on("connect", () => {
          console.log("Socket connected successfully");
          setConnectionAttempts(0); // Reset counter on successful connection

          // Authenticate socket connection with user ID
          newSocket.emit("authenticate", user._id);
        });

        // Handle notifications
        newSocket.on("notification", (data) => {
          console.log("Received notification:", data);
          if (data.type === "new") {
            // Add notification to store
            addNotification(data.data);

            // Show browser notification if supported
            if (Notification && Notification.permission === "granted") {
              new Notification(data.data.title, {
                body: data.data.message,
                icon: "/favicon.ico",
              });
            }
            // Request permission if not granted
            else if (Notification && Notification.permission !== "denied") {
              Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                  new Notification(data.data.title, {
                    body: data.data.message,
                    icon: "/favicon.ico",
                  });
                }
              });
            }
          }
        });

        // Handle disconnect
        newSocket.on("disconnect", (reason) => {
          console.log(`Socket disconnected: ${reason}`);

          // If the server disconnected us, don't try to reconnect automatically
          if (reason === "io server disconnect") {
            // Manual reconnection needed
            setTimeout(() => {
              if (isMounted.current && user) {
                newSocket.connect();
              }
            }, 3000);
          }
        });
      }

      // Clean up on unmount or when dependencies change
      return () => {
        if (newSocket) {
          console.log("Cleaning up socket connection");
          newSocket.disconnect();
        }
      };
    } catch (error) {
      console.error("Error creating socket connection:", error);
      return () => {}; // Return empty cleanup function
    }
  }, [user, initialized, addNotification, connectionAttempts]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
