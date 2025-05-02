"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import useTaskStore from "@/stores/taskStore";
import TaskCard from "@/components/tasks/TaskCard";
import TaskFilter from "@/components/tasks/TaskFilter";

const AssignedTasksPage = () => {
  const searchParams = useSearchParams();
  const dueDate = searchParams.get("dueDate") || "";
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
        assignedTo: "me",
        status: status || undefined,
        priority: priority || undefined,
        search: search || undefined,
        dueDate: dueDate || undefined,
      });

      if (!hasInitiallyLoaded) {
        setHasInitiallyLoaded(true);
      }
    };

    loadTasks();
  }, [fetchTasks, status, priority, search, dueDate, hasInitiallyLoaded]);

  const handleFilter = (filters: {
    status?: string;
    priority?: string;
    search?: string;
  }) => {
    setStatus(filters.status || "");
    setPriority(filters.priority || "");
    setSearch(filters.search || "");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          Tasks Assigned to Me {dueDate === "overdue" && " (Overdue)"}
        </h1>
        <Link
          href="/tasks/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create New Task
        </Link>
      </div>

      <TaskFilter onFilter={handleFilter} />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : tasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h3 className="text-xl font-medium text-gray-800 mb-2">
            No tasks found
          </h3>
          <p className="text-gray-600 mb-4">
            {dueDate === "overdue"
              ? "You don't have any overdue tasks."
              : "You don't have any tasks assigned to you."}
          </p>
          <Link
            href="/tasks/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create New Task
          </Link>
        </div>
      )}
    </div>
  );
};

export default AssignedTasksPage;
