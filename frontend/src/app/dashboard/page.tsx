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
        <div className="animate-pulse text-lg font-medium text-gray-500">
          Loading dashboard...
        </div>
      </div>
    );
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="container mx-auto pb-12">
      {/* Quick Actions */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.4 }}
        className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 mb-6 mt-6 hover:shadow-md transition-shadow duration-300"
      >
        <h2 className="text-lg font-medium text-gray-700 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/tasks/create"
            className="flex items-center justify-center px-4 py-3 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 transition-colors duration-200 group"
          >
            <svg
              className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200"
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
            Create New Task
          </Link>
          <Link
            href="/tasks/assigned"
            className="flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 group"
          >
            <svg
              className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200"
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
            View My Tasks
          </Link>
          <Link
            href="/profile"
            className="flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 group"
          >
            <svg
              className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200"
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
            Edit Profile
          </Link>
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-2xl font-bold mb-6"
      >
        Welcome, {user?.name}!
      </motion.h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300"
        >
          <h2 className="text-lg font-medium text-gray-700 mb-2">
            Tasks Assigned to You
          </h2>
          <p className="text-3xl font-bold text-blue-600">
            {dashboard.overview.assignedTasks}
          </p>
          <Link
            href="/tasks/assigned"
            className="text-sm text-blue-600 hover:underline mt-2 inline-block hover:text-blue-800 transition-colors duration-200"
          >
            View all assigned tasks
          </Link>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300"
        >
          <h2 className="text-lg font-medium text-gray-700 mb-2">
            Tasks Created by You
          </h2>
          <p className="text-3xl font-bold text-green-600">
            {dashboard.overview.createdTasks}
          </p>
          <Link
            href="/tasks/my-tasks"
            className="text-sm text-blue-600 hover:underline mt-2 inline-block hover:text-blue-800 transition-colors duration-200"
          >
            View all my tasks
          </Link>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300"
        >
          <h2 className="text-lg font-medium text-gray-700 mb-2">
            Overdue Tasks
          </h2>
          <p className="text-3xl font-bold text-red-600">
            {dashboard.overview.overdueTasks}
          </p>
          <Link
            href="/tasks/assigned?dueDate=overdue"
            className="text-sm text-blue-600 hover:underline mt-2 inline-block hover:text-blue-800 transition-colors duration-200"
          >
            View overdue tasks
          </Link>
        </motion.div>
      </div>

      {/* Task Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300"
        >
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Tasks by Status
          </h2>
          <div className="space-y-4">
            {Object.entries(dashboard.tasksByStatus).map(
              ([status, count], index) => (
                <div key={status} className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-600 capitalize">
                      {status}
                    </span>
                    <span className="text-sm text-gray-600">
                      {count as number}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
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
                      className={`h-2.5 rounded-full ${getStatusColor(status)}`}
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
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300"
        >
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Tasks by Priority
          </h2>
          <div className="space-y-4">
            {Object.entries(dashboard.tasksByPriority).map(
              ([priority, count], index) => (
                <div key={priority} className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-600 capitalize">
                      {priority}
                    </span>
                    <span className="text-sm text-gray-600">
                      {count as number}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
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
                      className={`h-2.5 rounded-full ${getPriorityColor(
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

      {/* Recent Tasks */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ delay: 0.8, duration: 0.4 }}
        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8 hover:shadow-md transition-shadow duration-300"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-700">Recent Tasks</h2>
          <Link
            href="/tasks"
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            View all tasks
          </Link>
        </div>
        {dashboard.recentTasks.length === 0 ? (
          <p className="text-gray-500 py-4">No recent tasks found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Title
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
                    Assigned To
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboard.recentTasks.map((task, index) => (
                  <motion.tr
                    key={task._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.3 }}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {task.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                          task.status
                        )}`}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {task.assignedTo ? task.assignedTo.name : "Unassigned"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/tasks/${task._id}`}
                        className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                      >
                        View
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// Helper functions for visualization
const getStatusColor = (status: string) => {
  switch (status) {
    case "to-do":
      return "bg-blue-500";
    case "in-progress":
      return "bg-yellow-500";
    case "completed":
      return "bg-green-500";
    case "archived":
      return "bg-gray-500";
    default:
      return "bg-blue-500";
  }
};

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "to-do":
      return "bg-blue-100 text-blue-800";
    case "in-progress":
      return "bg-yellow-100 text-yellow-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "archived":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-blue-100 text-blue-800";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-500";
    case "medium":
      return "bg-yellow-500";
    case "low":
      return "bg-green-500";
    default:
      return "bg-blue-500";
  }
};

const getPriorityBadgeColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "low":
      return "bg-green-100 text-green-800";
    default:
      return "bg-blue-100 text-blue-800";
  }
};

const getTotalTasks = (obj: Record<string, number>) => {
  return Object.values(obj).reduce((sum, count) => sum + count, 0);
};

const getPercentage = (count: number, total: number) => {
  return total > 0 ? Math.round((count / total) * 100) : 0;
};

export default Dashboard;
