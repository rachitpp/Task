"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import useTaskStore from "@/stores/taskStore";
import TaskCard from "@/components/tasks/TaskCard";
import TaskFilter from "@/components/tasks/TaskFilter";
import { motion } from "framer-motion";

const MyTasksPage = () => {
  const { tasks, loading, error, fetchTasks, resetTasks } = useTaskStore();
  const [status, setStatus] = useState<string>("");
  const [priority, setPriority] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  // Clear the task store when the component mounts and remounts
  useEffect(() => {
    resetTasks();

    // Clean up when the component unmounts
    return () => {
      resetTasks();
    };
  }, [resetTasks]);

  // Fetch tasks when filters change or component mounts
  useEffect(() => {
    const loadTasks = async () => {
      await fetchTasks({
        creator: "me",
        status: status || undefined,
        priority: priority || undefined,
        search: search || undefined,
      });

      if (!hasInitiallyLoaded) {
        setHasInitiallyLoaded(true);
      }
    };

    loadTasks();
  }, [fetchTasks, status, priority, search, hasInitiallyLoaded]);

  const handleFilter = (filters: {
    status?: string;
    priority?: string;
    search?: string;
  }) => {
    setStatus(filters.status || "");
    setPriority(filters.priority || "");
    setSearch(filters.search || "");
  };

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="container mx-auto px-4 pb-6 max-w-none pt-6 mt-6 compact-text"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-5 mt-8"
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-3">My Tasks</h1>
        <p className="text-gray-600 compact-text">
          Tasks that you have created in the system
        </p>
      </motion.div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <div className="mb-3 md:mb-0">
          <div className="flex space-x-1 text-sm">
            <div className="px-2.5 py-1 bg-gray-100 rounded-lg text-gray-700 flex items-center">
              <svg
                className="w-3.5 h-3.5 mr-1 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                ></path>
              </svg>
              <span className="compact-text-sm">
                Total: <strong>{tasks.length}</strong>
              </span>
            </div>
            {status && (
              <div className="px-2.5 py-1 bg-blue-50 rounded-lg text-blue-700 flex items-center">
                <svg
                  className="w-3.5 h-3.5 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
                  ></path>
                </svg>
                <span className="compact-text-sm">
                  Status: <strong className="capitalize">{status}</strong>
                </span>
              </div>
            )}
            {priority && (
              <div className="px-2.5 py-1 bg-yellow-50 rounded-lg text-yellow-700 flex items-center">
                <svg
                  className="w-3.5 h-3.5 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span className="compact-text-sm">
                  Priority: <strong className="capitalize">{priority}</strong>
                </span>
              </div>
            )}
          </div>
        </div>

        <Link
          href="/tasks/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 hover:shadow-md compact-btn"
        >
          <span className="flex items-center">
            <svg
              className="w-4 h-4 mr-1.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
            Create New Task
          </span>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <TaskFilter onFilter={handleFilter} />
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
          className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl mb-6 flex items-start"
        >
          <svg
            className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span>{error}</span>
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-3"></div>
            <p className="text-gray-600">Loading tasks...</p>
          </div>
        </div>
      ) : tasks.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {tasks.map((task) => (
            <motion.div key={task._id} variants={itemVariants}>
              <TaskCard task={task} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white p-10 rounded-xl shadow-sm border border-gray-200 text-center mt-8"
        >
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-blue-50 p-3">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                ></path>
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No tasks found
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            You haven&apos;t created any tasks yet. Get started by creating your
            first task.
          </p>
          <Link
            href="/tasks/create"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 hover:shadow-md inline-flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
            Create New Task
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MyTasksPage;
