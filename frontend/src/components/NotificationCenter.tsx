"use client";

import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import useAuthStore from "@/stores/authStore";
import useNotificationStore from "@/stores/notificationStore";
import type { Notification } from "@/stores/notificationStore";

/**
 * NotificationCenter component - Handles real-time notifications using Socket.io
 * and displays them to the user
 */
const NotificationCenter: React.FC = () => {
  const { user, initialized } = useAuthStore();
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    addNotification,
  } = useNotificationStore();

  const [isOpen, setIsOpen] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Connect to socket when component mounts and user is authenticated
  useEffect(() => {
    // Only proceed if user is authenticated and initialization is complete
    if (initialized && user?._id) {
      // Fetch existing notifications
      fetchNotifications();
      fetchUnreadCount();

      // Initialize socket connection
      const socket = io(
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
        {
          withCredentials: true,
        }
      );

      socketRef.current = socket;

      // Authenticate user with socket
      socket.emit("authenticate", user._id);

      // Listen for new notifications
      socket.on("notification", (notification: Notification) => {
        // Add the new notification to the store
        addNotification(notification);
        // Show browser notification if supported
        showBrowserNotification(notification);
      });

      // Clean up on unmount
      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    }
  }, [
    user?._id,
    initialized,
    fetchNotifications,
    fetchUnreadCount,
    addNotification,
  ]);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Show browser notification if supported
  const showBrowserNotification = (notification: Notification) => {
    // Check if browser supports notifications and permission is granted
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      new Notification(notification.title, {
        body: notification.message,
      });
    }
    // Request permission if not denied
    else if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission !== "denied"
    ) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(notification.title, {
            body: notification.message,
          });
        }
      });
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification._id);

    // Handle navigation based on notification type
    if (notification.task) {
      window.location.href = `/tasks/${notification.task._id}`;
    }

    setIsOpen(false);
  };

  const togglePopover = () => {
    setIsOpen(!isOpen);

    // Mark notifications as read when opening
    if (!isOpen && unreadCount > 0) {
      // You might want to avoid marking all as read automatically
      // depending on your UX design
    }
  };

  // Format notification time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) {
      return "just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  // If user isn't authenticated yet, don't render anything
  if (!initialized || !user) {
    return null;
  }

  return (
    <div className="relative" ref={popoverRef}>
      <button
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
        onClick={togglePopover}
        aria-label="Notifications"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50">
          <div className="p-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => {
                  if (confirm("Mark all notifications as read?")) {
                    // Implement markAllAsRead functionality
                  }
                }}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                    notification.isRead ? "bg-white" : "bg-blue-50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {notification.message}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatTime(notification.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2 border-t border-gray-200 bg-gray-50 text-center">
            <button
              onClick={() => {
                window.location.href = "/notifications";
                setIsOpen(false);
              }}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
