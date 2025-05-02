"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useNotificationStore, { Notification } from "@/stores/notificationStore";
import useAuthStore from "@/stores/authStore";

// Simple utility to format time relative to now (replacing date-fns dependency)
const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Time constants
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;

  // Calculate the appropriate time unit
  if (seconds < minute) {
    return "just now";
  } else if (seconds < hour) {
    const minutes = Math.floor(seconds / minute);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  } else if (seconds < day) {
    const hours = Math.floor(seconds / hour);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  } else if (seconds < week) {
    const days = Math.floor(seconds / day);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  } else if (seconds < month) {
    const weeks = Math.floor(seconds / week);
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  } else if (seconds < year) {
    const months = Math.floor(seconds / month);
    return `${months} ${months === 1 ? "month" : "months"} ago`;
  } else {
    const years = Math.floor(seconds / year);
    return `${years} ${years === 1 ? "year" : "years"} ago`;
  }
};

const NotificationDropdown: React.FC = () => {
  const router = useRouter();
  const { user, initialized } = useAuthStore();
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    loading,
  } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications when dropdown is opened
  useEffect(() => {
    if (isOpen && initialized && user) {
      fetchNotifications({ limit: 5 });
    }
  }, [isOpen, initialized, user, fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle notification click
  const handleNotificationClick = async (
    notificationId: string,
    taskId?: string
  ) => {
    await markAsRead(notificationId);
    if (taskId) {
      router.push(`/tasks/${taskId}`);
    }
    setIsOpen(false);
  };

  // Conditionally render null if not authenticated
  if (!initialized || !user) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 relative"
      >
        <span className="sr-only">View notifications</span>
        <svg
          className="w-6 h-6"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
        </svg>
        {unreadCount > 0 && (
          <div className="absolute inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full -top-1 -right-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 overflow-hidden bg-white divide-y divide-gray-100 rounded-lg shadow-lg w-80">
          <div className="flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No notifications
              </div>
            ) : (
              notifications.map((notification: Notification) => (
                <div
                  key={notification._id}
                  onClick={() =>
                    handleNotificationClick(
                      notification._id,
                      notification.task?._id
                    )
                  }
                  className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                    !notification.isRead ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <span className="font-medium text-sm text-gray-900">
                      {notification.title}
                    </span>
                    <span className="ml-auto text-xs text-gray-500">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {notification.message}
                  </p>
                  {!notification.isRead && (
                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full ml-1"></span>
                  )}
                </div>
              ))
            )}
          </div>
          <Link
            href="/notifications"
            className="block px-4 py-2 text-sm text-center text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            Show all notifications
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
