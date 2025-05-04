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
          <div className="w-12 h-12 border-t-4 border-blue-600 border-solid rounded-full animate-spin mb-3"></div>
          <div className="text-lg font-medium text-gray-500">
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
    <div className="container mx-auto px-4 pb-8 max-w-none">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 mt-12 w-full overflow-visible"
      >
        <h1
          className="text-4xl font-bold text-gray-800 mb-3 hyphens-auto overflow-visible w-full"
          style={{
            wordWrap: "break-word",
            hyphens: "auto",
            overflowWrap: "break-word",
            paddingTop: "16px",
            lineHeight: 1.5,
          }}
        >
          Welcome, <span className="inline">{user?.name || "User"}</span>!
        </h1>
        <p className="text-gray-600 text-lg">
          Here&apos;s an overview of your tasks and activities
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.4 }}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 hover:shadow-md transition-all duration-300"
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
          </svg>
          <span className="truncate">Quick Actions</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/tasks/create"
            className="flex items-center justify-center px-4 py-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200 group"
          >
            <svg
              className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200"
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
            <span className="font-medium">Create New Task</span>
          </Link>
          <Link
            href="/tasks/assigned"
            className="flex items-center justify-center px-4 py-3 bg-gray-50 border border-gray-200 text-gray-800 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
          >
            <svg
              className="w-5 h-5 mr-3 text-indigo-600 group-hover:scale-110 transition-transform duration-200"
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
            <span className="font-medium">View My Tasks</span>
          </Link>
          <Link
            href="/profile"
            className="flex items-center justify-center px-4 py-3 bg-gray-50 border border-gray-200 text-gray-800 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
          >
            <svg
              className="w-5 h-5 mr-3 text-green-600 group-hover:scale-110 transition-transform duration-200"
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
            <span className="font-medium">Edit Profile</span>
          </Link>
        </div>
      </motion.div>

      {/* Overview Cards */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <svg
          className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
          <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
        </svg>
        <span className="truncate">Overview</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200 hover:shadow-md transition-all duration-300 min-h-[180px] flex flex-col"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">
                Tasks Assigned to You
              </p>
              <h3 className="text-3xl font-bold text-gray-800">
                {dashboard.overview.assignedTasks}
              </h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full shrink-0">
              <svg
                className="w-6 h-6 text-blue-600"
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
          <Link
            href="/tasks/assigned"
            className="text-sm text-blue-700 hover:text-blue-900 flex items-center mt-auto font-medium"
          >
            View all assigned tasks
            <svg
              className="w-4 h-4 ml-1"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </Link>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm border border-green-200 hover:shadow-md transition-all duration-300 min-h-[180px] flex flex-col"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">
                Tasks Created by You
              </p>
              <h3 className="text-3xl font-bold text-gray-800">
                {dashboard.overview.createdTasks}
              </h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full shrink-0">
              <svg
                className="w-6 h-6 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z"></path>
              </svg>
            </div>
          </div>
          <Link
            href="/tasks/my-tasks"
            className="text-sm text-green-700 hover:text-green-900 flex items-center mt-auto font-medium"
          >
            View all my tasks
            <svg
              className="w-4 h-4 ml-1"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </Link>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl shadow-sm border border-red-200 hover:shadow-md transition-all duration-300 min-h-[180px] flex flex-col"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-red-600 mb-1">
                Overdue Tasks
              </p>
              <h3 className="text-3xl font-bold text-gray-800">
                {dashboard.overview.overdueTasks}
              </h3>
            </div>
            <div className="bg-red-100 p-3 rounded-full shrink-0">
              <svg
                className="w-6 h-6 text-red-600"
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
            </div>
          </div>
          <Link
            href="/tasks/assigned?dueDate=overdue"
            className="text-sm text-red-700 hover:text-red-900 flex items-center mt-auto font-medium"
          >
            View overdue tasks
            <svg
              className="w-4 h-4 ml-1"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </Link>
        </motion.div>
      </div>

      {/* Task Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-indigo-600 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
            </svg>
            <span className="truncate">Tasks by Status</span>
          </h2>
          <div className="space-y-4">
            {Object.entries(dashboard.tasksByStatus).map(
              ([status, count], index) => (
                <div key={status} className="mb-2">
                  <div className="flex justify-between items-center mb-1 flex-wrap">
                    <span className="text-sm font-medium text-gray-800 capitalize flex items-center mb-1 mr-2">
                      <span
                        className={`inline-block w-3 h-3 rounded-full mr-2 flex-shrink-0 ${getStatusBadgeColor(
                          status
                        )}`}
                      ></span>
                      <span className="truncate max-w-[200px]">{status}</span>
                    </span>
                    <span className="text-sm font-medium text-gray-800 bg-gray-100 px-2 py-1 rounded-md flex-shrink-0">
                      {count as number}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${getPercentage(
                          count as number,
                          getTotalTasks(dashboard.tasksByStatus)
                        )}%`,
                      }}
                      transition={{
                        delay: 0.1 * index,
                        duration: 0.8,
                        ease: "easeOut",
                      }}
                      className={`h-3 rounded-full ${getStatusColor(status)}`}
                    ></motion.div>
                  </div>
                </div>
              )
            )}
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-purple-600 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              ></path>
            </svg>
            <span className="truncate">Tasks by Priority</span>
          </h2>
          <div className="space-y-4">
            {Object.entries(dashboard.tasksByPriority).map(
              ([priority, count], index) => (
                <div key={priority} className="mb-2">
                  <div className="flex justify-between items-center mb-1 flex-wrap">
                    <span className="text-sm font-medium text-gray-800 capitalize flex items-center mb-1 mr-2">
                      <span
                        className={`inline-block w-3 h-3 rounded-full mr-2 flex-shrink-0 ${getPriorityBadgeColor(
                          priority
                        )}`}
                      ></span>
                      <span className="truncate max-w-[200px]">{priority}</span>
                    </span>
                    <span className="text-sm font-medium text-gray-800 bg-gray-100 px-2 py-1 rounded-md flex-shrink-0">
                      {count as number}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${getPercentage(
                          count as number,
                          getTotalTasks(dashboard.tasksByPriority)
                        )}%`,
                      }}
                      transition={{
                        delay: 0.1 * index,
                        duration: 0.8,
                        ease: "easeOut",
                      }}
                      className={`h-3 rounded-full ${getPriorityColor(
                        priority
                      )}`}
                    ></motion.div>
                  </div>
                </div>
              )
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity or Additional Section */}
      {dashboard.recentTasks && dashboard.recentTasks.length > 0 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0"
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
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Task
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Priority
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboard.recentTasks.map((task) => (
                  <tr key={task._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-[180px]">
                        {task.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                          task.status
                        )}`}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
