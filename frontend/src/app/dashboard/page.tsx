"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import useAuthStore from "@/stores/authStore";
import useTaskStore from "@/stores/taskStore";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { user } = useAuthStore();
  const { dashboard, fetchDashboard, loading } = useTaskStore();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading || !dashboard) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-10 h-10 border-t-4 border-blue-600 border-solid rounded-full animate-spin mb-3"></div>
          <div className="text-sm font-medium text-gray-500">
            Loading dashboard...
          </div>
        </div>
      </div>
    );
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-3"
      >
        <h1
          className="text-lg font-semibold text-gray-800 mb-1 hyphens-auto overflow-visible"
          style={{
            wordWrap: "break-word",
            hyphens: "auto",
            overflowWrap: "break-word",
          }}
        >
          Welcome, <span className="inline">{user?.name || "User"}</span>!
        </h1>
        <p className="text-sm text-gray-600">
          Here&apos;s an overview of your tasks and activities
        </p>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 mb-3">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 p-2.5 rounded-md shadow-sm border border-blue-200 hover:shadow-md transition-all duration-300 flex flex-col"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-blue-600 mb-0.5">
                Assigned Tasks
              </p>
              <h3 className="text-xl font-bold text-gray-800">
                {dashboard.overview.assignedTasks}
              </h3>
            </div>
            <div className="bg-blue-100 p-1.5 rounded-full shrink-0">
              <svg
                className="w-4 h-4 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
          </div>
          <Link href="/tasks/assigned" className="mt-auto">
            <div className="text-blue-600 text-xs font-medium mt-2 hover:underline flex items-center">
              View all assigned tasks
              <svg
                className="w-3 h-3 ml-1"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 p-2.5 rounded-md shadow-sm border border-purple-200 hover:shadow-md transition-all duration-300 flex flex-col"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-purple-600 mb-0.5">
                Created Tasks
              </p>
              <h3 className="text-xl font-bold text-gray-800">
                {dashboard.overview.createdTasks}
              </h3>
            </div>
            <div className="bg-purple-100 p-1.5 rounded-full shrink-0">
              <svg
                className="w-4 h-4 text-purple-600"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
          </div>
          <Link href="/tasks/my-tasks" className="mt-auto">
            <div className="text-purple-600 text-xs font-medium mt-2 hover:underline flex items-center">
              View your created tasks
              <svg
                className="w-3 h-3 ml-1"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="bg-gradient-to-br from-green-50 to-green-100 p-2.5 rounded-md shadow-sm border border-green-200 hover:shadow-md transition-all duration-300 flex flex-col"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-green-600 mb-0.5">
                Completed Tasks
              </p>
              <h3 className="text-xl font-bold text-gray-800">
                {dashboard.tasksByStatus?.completed || 0}
              </h3>
            </div>
            <div className="bg-green-100 p-1.5 rounded-full shrink-0">
              <svg
                className="w-4 h-4 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
          </div>
          <Link href="/tasks?status=completed" className="mt-auto">
            <div className="text-green-600 text-xs font-medium mt-2 hover:underline flex items-center">
              View completed tasks
              <svg
                className="w-3 h-3 ml-1"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-2.5 rounded-md shadow-sm border border-yellow-200 hover:shadow-md transition-all duration-300 flex flex-col"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-yellow-600 mb-0.5">
                Overdue Tasks
              </p>
              <h3 className="text-xl font-bold text-gray-800">
                {dashboard.overview.overdueTasks || 0}
              </h3>
            </div>
            <div className="bg-yellow-100 p-1.5 rounded-full shrink-0">
              <svg
                className="w-4 h-4 text-yellow-600"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
          </div>
          <Link href="/tasks?status=overdue" className="mt-auto">
            <div className="text-yellow-600 text-xs font-medium mt-2 hover:underline flex items-center">
              View overdue tasks
              <svg
                className="w-3 h-3 ml-1"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.3 }}
        className="bg-white p-2.5 rounded-md shadow-sm border border-gray-200 mb-3 hover:shadow-md transition-all duration-300"
      >
        <h2 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
          <svg
            className="w-3.5 h-3.5 mr-1.5 text-blue-600 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
          </svg>
          <span className="truncate">Quick Actions</span>
        </h2>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Link
            href="/tasks/create"
            className="bg-blue-50 border border-blue-100 hover:bg-blue-100 p-2 rounded-md transition-colors duration-200 flex flex-col items-center justify-center text-center"
          >
            <svg
              className="w-5 h-5 text-blue-600 mb-1"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              ></path>
            </svg>
            <span className="text-xs font-medium text-gray-800">New Task</span>
          </Link>

          <Link
            href="/tasks"
            className="bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 p-2 rounded-md transition-colors duration-200 flex flex-col items-center justify-center text-center"
          >
            <svg
              className="w-5 h-5 text-indigo-600 mb-1"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path>
            </svg>
            <span className="text-xs font-medium text-gray-800">All Tasks</span>
          </Link>

          <Link
            href="/notifications"
            className="bg-rose-50 border border-rose-100 hover:bg-rose-100 p-2 rounded-md transition-colors duration-200 flex flex-col items-center justify-center text-center"
          >
            <svg
              className="w-5 h-5 text-rose-600 mb-1"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
            </svg>
            <span className="text-xs font-medium text-gray-800">
              Notifications
            </span>
          </Link>

          <Link
            href="/profile"
            className="bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 p-2 rounded-md transition-colors duration-200 flex flex-col items-center justify-center text-center"
          >
            <svg
              className="w-5 h-5 text-emerald-600 mb-1"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                clipRule="evenodd"
              ></path>
            </svg>
            <span className="text-xs font-medium text-gray-800">Profile</span>
          </Link>
        </div>
      </motion.div>

      {/* Task Distribution Charts & Recent Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Recent Tasks Panel */}
        {dashboard.recentTasks && dashboard.recentTasks.length > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="bg-white p-2.5 rounded-md shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
          >
            <h2 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
              <svg
                className="w-3.5 h-3.5 mr-1.5 text-blue-600 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="truncate">Recent Tasks</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Task
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Priority
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Due Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboard.recentTasks.map((task) => (
                    <tr key={task._id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs font-medium text-gray-900 truncate max-w-[150px]">
                          {task.title}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                            task.status
                          )}`}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeColor(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString()
                          : "No due date"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Helper functions
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-500";
    case "in-progress":
      return "bg-blue-500";
    case "not started":
      return "bg-gray-500";
    case "on hold":
      return "bg-yellow-500";
    case "cancelled":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

const getStatusBadgeColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "in-progress":
      return "bg-blue-100 text-blue-800";
    case "not started":
      return "bg-gray-100 text-gray-800";
    case "on hold":
      return "bg-yellow-100 text-yellow-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case "high":
      return "bg-red-500";
    case "medium":
      return "bg-yellow-500";
    case "low":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

const getPriorityBadgeColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case "high":
      return "bg-red-100 text-red-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "low":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getTotalTasks = (obj: Record<string, number>) => {
  return Object.values(obj).reduce((sum, count) => sum + count, 0);
};

const getPercentage = (count: number, total: number) => {
  return total === 0 ? 0 : Math.round((count / total) * 100);
};

export default Dashboard;
