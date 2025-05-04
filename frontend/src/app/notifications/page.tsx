"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useNotificationStore, {
  Notification,
  NotificationFilter,
} from "@/stores/notificationStore";
import useAuthStore from "@/stores/authStore";
import Link from "next/link";

// Format time utility function
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const NotificationsPage: React.FC = () => {
  const router = useRouter();
  const { user, initialized } = useAuthStore();
  const {
    notifications,
    totalNotifications,
    totalPages,
    currentPage,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationStore();

  // Local filters state
  const [filterReadStatus, setFilterReadStatus] = useState<string>("all");

  // Check authentication
  useEffect(() => {
    if (initialized && !user) {
      router.push("/login");
    }
  }, [initialized, user, router]);

  // Fetch notifications on mount and when filter changes
  useEffect(() => {
    if (initialized && user) {
      const filter: NotificationFilter = { page: 1, limit: 10 };

      if (filterReadStatus !== "all") {
        filter.read = filterReadStatus === "read";
      }

      fetchNotifications(filter);
    }
  }, [initialized, user, filterReadStatus, fetchNotifications]);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;

    const filter: NotificationFilter = { page, limit: 10 };
    if (filterReadStatus !== "all") {
      filter.read = filterReadStatus === "read";
    }

    fetchNotifications(filter);
  };

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    if (notification.task?._id) {
      router.push(`/tasks/${notification.task._id}`);
    }
  };

  // Handle delete notification
  const handleDeleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this notification?")) {
      await deleteNotification(id);
    }
  };

  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterReadStatus(e.target.value);
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    if (confirm("Mark all notifications as read?")) {
      await markAllAsRead();
    }
  };

  // Loading state
  if (!initialized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 mt-16 pt-3 compact-text">
      <div className="mb-4 mt-2">
        <Link href="/dashboard" className="back-btn">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3 md:mb-0">
          Notifications
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <select
            value={filterReadStatus}
            onChange={handleFilterChange}
            className="bg-white border border-gray-300 rounded-md py-1.5 px-3 text-sm shadow-sm"
          >
            <option value="all">All notifications</option>
            <option value="unread">Unread only</option>
            <option value="read">Read only</option>
          </select>
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={handleMarkAllAsRead}
              className="bg-blue-50 text-blue-600 border border-blue-300 rounded-md py-1.5 px-3 text-sm hover:bg-blue-100 transition-colors shadow-sm"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Notifications list */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        {loading ? (
          <div className="p-6 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No notifications
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              You don&apos;t have any notifications yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 flex hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                  !notification.isRead
                    ? "bg-blue-50 border-l-4 border-blue-500"
                    : ""
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900 compact-text">
                        {notification.title}
                      </h4>
                      {!notification.isRead && (
                        <span className="bg-blue-500 h-2 w-2 rounded-full"></span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500 compact-text-sm bg-gray-100 px-2 py-1 rounded">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {notification.message}
                  </p>
                  {notification.task && (
                    <div className="mt-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                      <svg
                        className="w-3.5 h-3.5 mr-1 text-indigo-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      Task: {notification.task.title}
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => handleDeleteNotification(e, notification._id)}
                  className="ml-2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Delete notification"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === index + 1
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Total count */}
      <div className="mt-4 text-center text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">
        Showing{" "}
        {notifications.length > 0
          ? `${Math.min(
              (currentPage - 1) * 10 + 1,
              totalNotifications
            )}-${Math.min(currentPage * 10, totalNotifications)}`
          : 0}{" "}
        of {totalNotifications} notifications
      </div>
    </div>
  );
};

export default NotificationsPage;
