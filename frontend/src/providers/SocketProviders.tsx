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

    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["polling", "websocket"],
      auth: {
        token: token,
      },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Set socket in state
    setSocket(newSocket);

    // Authenticate socket with user ID
    newSocket.on("connect", () => {
      console.log("Socket connected");
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
        if (Notification.permission === "granted") {
          new Notification(data.data.title, {
            body: data.data.message,
            icon: "/favicon.ico",
          });
        }
        // Request permission if not granted
        else if (Notification.permission !== "denied") {
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
    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    // Handle errors
    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    // Clean up on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [user, initialized, addNotification]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
