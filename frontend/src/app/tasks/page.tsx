"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import useTaskStore from "@/stores/taskStore";
import useAuthStore from "@/stores/authStore";
import TaskCard from "@/components/tasks/TaskCard";
import TaskFilter from "@/components/tasks/TaskFilter";
import { motion } from "framer-motion";

const TasksPage = () => {
  const { tasks, loading, error, fetchTasks, resetTasks } = useTaskStore();
  const { user } = useAuthStore();
  const [status, setStatus] = useState<string>("");
  const [priority, setPriority] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  // Check if user is admin or manager for all tasks view
  const isManagerOrAdmin =
    user && (user.role === "manager" || user.role === "admin");

  // Clear the task store when the component mounts and remounts
  useEffect(() => {
    resetTasks();

    // Clean up when the component unmounts
    return () => {
      resetTasks();
    };
  }, [resetTasks]);

  useEffect(() => {
    const loadTasks = async () => {
      if (isManagerOrAdmin) {
        await fetchTasks({
          status: status || undefined,
          priority: priority || undefined,
          search: search || undefined,
        });
      } else {
        // Redirect or show error - this page is only for managers/admins
        // For now, we'll just fetch the user's assigned tasks
        await fetchTasks({
          assignedTo: "me",
          status: status || undefined,
          priority: priority || undefined,
          search: search || undefined,
        });
      }

      if (!hasInitiallyLoaded) {
        setHasInitiallyLoaded(true);
      }
    };

    loadTasks();
  }, [
    fetchTasks,
    status,
    priority,
    search,
    isManagerOrAdmin,
    hasInitiallyLoaded,
  ]);

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
      className="container mx-auto px-4 py-8"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          {isManagerOrAdmin ? "All Tasks" : "My Assigned Tasks"}
        </h1>
        <Link
          href="/tasks/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 hover:shadow-md"
        >
          <span className="flex items-center">
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
          </span>
        </Link>
      </motion.div>

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
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
        >
          {error}
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
          className="bg-white p-8 rounded-lg shadow-md text-center"
        >
          <h3 className="text-xl font-medium text-gray-800 mb-2">
            No tasks found
          </h3>
          <p className="text-gray-600 mb-4">
            {isManagerOrAdmin
              ? "There are no tasks matching your filters."
              : "You don&apos;t have any tasks assigned to you."}
          </p>
          <Link
            href="/tasks/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 hover:shadow-md inline-flex items-center"
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

export default TasksPage;
