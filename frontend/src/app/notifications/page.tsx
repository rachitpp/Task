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
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 mt-16 max-w-5xl">
      <div className="mb-4 sm:mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-blue-600 bg-blue-50 rounded-lg transition-all duration-200 hover:bg-blue-100 hover:shadow-sm font-medium text-sm sm:text-base"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
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

      <div className="mb-6 sm:mb-8 bg-gradient-to-r from-indigo-50 to-blue-50 p-4 sm:p-6 rounded-xl shadow-sm border border-blue-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 md:mb-0 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Notifications
          </h1>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <select
              value={filterReadStatus}
              onChange={handleFilterChange}
              className="bg-white border border-gray-300 rounded-lg py-1.5 sm:py-2 px-3 sm:px-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all"
            >
              <option value="all">All notifications</option>
              <option value="unread">Unread only</option>
              <option value="read">Read only</option>
            </select>
            {notifications.some((n) => !n.isRead) && (
              <button
                onClick={handleMarkAllAsRead}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg py-1.5 sm:py-2 px-3 sm:px-4 text-sm hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-sm hover:shadow font-medium whitespace-nowrap"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications list */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
        {loading ? (
          <div className="p-8 sm:p-10 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 font-medium">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="bg-indigo-50 rounded-full p-4 w-16 h-16 sm:w-20 sm:h-20 mx-auto flex items-center justify-center mb-4">
              <svg
                className="h-10 w-10 sm:h-12 sm:w-12 text-indigo-500"
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
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900">
              No notifications
            </h3>
            <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
              You don&apos;t have any notifications yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 sm:p-5 flex hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                  !notification.isRead
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500"
                    : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-gray-900 text-base sm:text-lg break-words">
                        {notification.title}
                      </h4>
                      {!notification.isRead && (
                        <span className="bg-blue-500 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full animate-pulse flex-shrink-0"></span>
                      )}
                    </div>
                    <span className="text-xs sm:text-sm text-gray-600 bg-gray-100 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-sm self-start flex-shrink-0">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-700 leading-relaxed break-words">
                    {notification.message}
                  </p>
                  {notification.task && (
                    <div className="mt-3 inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-100 shadow-sm">
                      <svg
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-indigo-500"
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
                      <span className="truncate max-w-[150px] sm:max-w-[200px] md:max-w-xs">
                        Task: {notification.task.title}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => handleDeleteNotification(e, notification._id)}
                  className="ml-2 sm:ml-3 text-gray-400 hover:text-red-500 p-1.5 sm:p-2 rounded-full hover:bg-red-50 transition-colors self-start flex-shrink-0"
                  aria-label="Delete notification"
                >
                  <svg
                    className="h-4 w-4 sm:h-5 sm:w-5"
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
        <div className="flex justify-center mt-6 sm:mt-8 overflow-x-auto">
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-white px-3 sm:px-5 py-2 sm:py-3 rounded-xl shadow-md border border-gray-200">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-sm ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100 transition-colors"
              }`}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg transition-all duration-200 text-sm ${
                  currentPage === index + 1
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-sm ${
                currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100 transition-colors"
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Total count */}
      <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-600 bg-gradient-to-r from-gray-50 to-blue-50 py-2 sm:py-3 px-4 sm:px-6 rounded-xl shadow-sm border border-blue-100">
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
