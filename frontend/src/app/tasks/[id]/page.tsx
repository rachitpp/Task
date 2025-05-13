"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useTaskStore, { TaskInput } from "@/stores/taskStore";
import useAuthStore from "@/stores/authStore";
import useUserStore from "@/stores/userStore";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface TaskDetailPageProps {
  params: {
    id: string;
  };
}

const TaskDetailPage: React.FC<TaskDetailPageProps> = ({ params }) => {
  const router = useRouter();
  const id = params.id;
  const { user } = useAuthStore();
  const { users, fetchUsers } = useUserStore();
  const { task, loading, error, fetchTaskById, updateTask, deleteTask } =
    useTaskStore();

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [status, setStatus] = useState<
    "to-do" | "in-progress" | "completed" | "archived"
  >("to-do");
  const [assignedTo, setAssignedTo] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<
    "none" | "daily" | "weekly" | "monthly"
  >("none");
  const [tags, setTags] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState("");

  useEffect(() => {
    fetchTaskById(id);
    fetchUsers();
  }, [id, fetchTaskById, fetchUsers]);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setDueDate(
        task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : ""
      );
      setPriority(task.priority);
      setStatus(task.status);
      setAssignedTo(task.assignedTo?._id || "");
      setIsRecurring(task.isRecurring);
      setRecurrencePattern(task.recurrencePattern);
      setTags(task.tags ? task.tags.join(", ") : "");
    }
  }, [task]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateError("");

    try {
      const taskData: Partial<TaskInput> = {
        title,
        description,
        dueDate: dueDate || undefined,
        priority,
        status,
        assignedTo: assignedTo || undefined,
        isRecurring,
        recurrencePattern: isRecurring ? recurrencePattern : "none",
        tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      };

      await updateTask(id, taskData);
      setIsEditing(false);
    } catch (error: unknown) {
      const err = error as Error;
      setUpdateError(err.message || "Failed to update task");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(id);
        router.push("/dashboard");
      } catch (error: unknown) {
        const err = error as Error;
        setUpdateError(err.message || "Failed to delete task");
      }
    }
  };

  const canEdit =
    user &&
    (user.role === "admin" ||
      user.role === "manager" ||
      (task && task.creator && task.creator._id === user._id) ||
      (task && task.assignedTo && task.assignedTo._id === user._id));

  // Function to format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy h:mm a");
  };

  // Get status color for display
  const getStatusColor = (status: string) => {
    switch (status) {
      case "to-do":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "in-progress":
        return "bg-indigo-100 text-indigo-800 border border-indigo-200";
      case "completed":
        return "bg-green-100 text-green-800 border border-green-200";
      case "archived":
        return "bg-gray-100 text-gray-800 border border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // Get priority color for display
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800 border border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "high":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-t-4 border-indigo-600 border-solid rounded-full animate-spin mb-4"></div>
          <div className="text-md font-medium text-gray-600">
            Loading task...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-5xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md mb-4">
          <div className="flex items-center">
            <svg
              className="w-6 h-6 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="font-medium">{error}</p>
          </div>
        </div>
        <Link
          href="/dashboard"
          className="text-indigo-600 hover:text-indigo-800 text-md flex items-center transition-colors duration-200"
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
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-4 max-w-5xl mx-auto">
        <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-700 p-4 rounded-lg shadow-md mb-4">
          <div className="flex items-center">
            <svg
              className="w-6 h-6 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="font-medium">Task not found.</p>
          </div>
        </div>
        <Link
          href="/dashboard"
          className="text-indigo-600 hover:text-indigo-800 text-md flex items-center transition-colors duration-200"
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
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 max-w-5xl mx-auto">
      <div className="mb-3 sm:mb-4">
        <Link
          href="/dashboard"
          className="text-indigo-600 hover:text-indigo-800 text-xs sm:text-sm flex items-center transition-colors duration-200"
        >
          <svg
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1"
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

      {updateError && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-2 sm:p-4 rounded mb-3 sm:mb-4 text-xs sm:text-sm flex items-center">
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-xs sm:text-sm">{updateError}</span>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-lg shadow-lg overflow-hidden"
      >
        {isEditing ? (
          // Edit form
          <div>
            <div
              className={`p-3 sm:p-6 border-b ${
                task.priority === "high"
                  ? "bg-gradient-to-r from-red-50 via-red-100 to-red-50 border-red-200"
                  : task.priority === "medium"
                  ? "bg-gradient-to-r from-amber-50 via-amber-100 to-amber-50 border-amber-200"
                  : "bg-gradient-to-r from-emerald-50 via-emerald-100 to-emerald-50 border-emerald-200"
              }`}
            >
              <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Task
              </h1>
            </div>

            <div className="p-3 sm:p-6">
              <form onSubmit={handleUpdate} className="space-y-3 sm:space-y-4">
                <div className="col-span-2">
                  <label
                    className="block text-gray-700 text-xs sm:text-sm font-medium mb-1 sm:mb-2"
                    htmlFor="title"
                  >
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label
                    className="block text-gray-700 text-xs sm:text-sm font-medium mb-1 sm:mb-2"
                    htmlFor="description"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label
                      className="block text-gray-700 text-xs sm:text-sm font-medium mb-1 sm:mb-2"
                      htmlFor="dueDate"
                    >
                      Due Date
                    </label>
                    <input
                      id="dueDate"
                      type="datetime-local"
                      className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 text-xs sm:text-sm font-medium mb-1 sm:mb-2"
                      htmlFor="priority"
                    >
                      Priority
                    </label>
                    <select
                      id="priority"
                      className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                      value={priority}
                      onChange={(e) =>
                        setPriority(e.target.value as "low" | "medium" | "high")
                      }
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 text-xs sm:text-sm font-medium mb-1 sm:mb-2"
                      htmlFor="status"
                    >
                      Status
                    </label>
                    <select
                      id="status"
                      className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                      value={status}
                      onChange={(e) =>
                        setStatus(
                          e.target.value as
                            | "to-do"
                            | "in-progress"
                            | "completed"
                            | "archived"
                        )
                      }
                    >
                      <option value="to-do">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 text-xs sm:text-sm font-medium mb-1 sm:mb-2"
                      htmlFor="assignedTo"
                    >
                      Assign To
                    </label>
                    <select
                      id="assignedTo"
                      className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center bg-gray-50 p-2 rounded-md border border-gray-100">
                  <input
                    id="isRecurring"
                    type="checkbox"
                    className="h-3.5 w-3.5 border-gray-300 rounded text-indigo-600 focus:ring-indigo-500"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                  />
                  <label
                    htmlFor="isRecurring"
                    className="ml-2 block text-gray-700 text-xs sm:text-sm"
                  >
                    Recurring Task
                  </label>
                </div>

                {isRecurring && (
                  <div>
                    <label
                      className="block text-gray-700 text-xs sm:text-sm font-medium mb-1 sm:mb-2"
                      htmlFor="recurrencePattern"
                    >
                      Recurrence Pattern
                    </label>
                    <select
                      id="recurrencePattern"
                      className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                      value={recurrencePattern}
                      onChange={(e) =>
                        setRecurrencePattern(
                          e.target.value as
                            | "daily"
                            | "weekly"
                            | "monthly"
                            | "none"
                        )
                      }
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                )}

                <div>
                  <label
                    className="block text-gray-700 text-xs sm:text-sm font-medium mb-1 sm:mb-2"
                    htmlFor="tags"
                  >
                    Tags (comma separated)
                  </label>
                  <input
                    id="tags"
                    type="text"
                    className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                    placeholder="e.g. urgent, meeting, follow-up"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>

                <div className="flex justify-end space-x-2 sm:space-x-3 pt-3 sm:pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    className="px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md sm:rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition duration-200"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 rounded-md sm:rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition duration-200 flex items-center"
                    disabled={updateLoading}
                  >
                    {updateLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          // View mode
          <div>
            <div
              className={`relative p-3 sm:p-6 border-b ${
                task.priority === "high"
                  ? "bg-gradient-to-r from-red-50 via-red-100 to-red-50 border-red-200"
                  : task.priority === "medium"
                  ? "bg-gradient-to-r from-amber-50 via-amber-100 to-amber-50 border-amber-200"
                  : "bg-gradient-to-r from-emerald-50 via-emerald-100 to-emerald-50 border-emerald-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                <div className="mb-3 sm:mb-0">
                  <div className="flex items-center mb-2">
                    <span
                      className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full mr-1.5 sm:mr-2 ${
                        task.priority === "high"
                          ? "bg-red-500"
                          : task.priority === "medium"
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                    ></span>
                    <span
                      className={`text-xs font-medium uppercase ${
                        task.priority === "high"
                          ? "text-red-700"
                          : task.priority === "medium"
                          ? "text-amber-700"
                          : "text-emerald-700"
                      }`}
                    >
                      {task.priority} Priority
                    </span>
                  </div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-800">
                    {task.title}
                  </h1>
                </div>
                {canEdit && (
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEditing(true)}
                      className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-white text-indigo-600 rounded-md sm:rounded-lg hover:bg-indigo-50 flex items-center border border-indigo-200 shadow-sm transition-colors duration-200"
                    >
                      <svg
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        ></path>
                      </svg>
                      Edit
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDelete}
                      className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-white text-red-600 rounded-md sm:rounded-lg hover:bg-red-50 flex items-center border border-red-200 shadow-sm transition-colors duration-200"
                    >
                      <svg
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5"
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
                        ></path>
                      </svg>
                      Delete
                    </motion.button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-500">
                      Status
                    </h3>
                    <span
                      className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.status === "to-do"
                        ? "To Do"
                        : task.status === "in-progress"
                        ? "In Progress"
                        : task.status === "completed"
                        ? "Completed"
                        : "Archived"}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-500">
                      Assigned To
                    </h3>
                    <div className="text-xs sm:text-sm text-gray-800 font-medium">
                      {task.assignedTo ? (
                        <span className="flex items-center">
                          <span className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-indigo-100 text-indigo-800 mr-1.5 sm:mr-2 text-xs sm:text-sm">
                            {task.assignedTo.name.charAt(0)}
                          </span>
                          <span className="hidden xs:inline">
                            {task.assignedTo.name}
                          </span>
                        </span>
                      ) : (
                        <span className="text-gray-500 italic">Unassigned</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex flex-col">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-500 mb-1.5">
                      Due Date
                    </h3>
                    <div
                      className={`text-xs sm:text-sm ${
                        task.dueDate &&
                        new Date(task.dueDate) < new Date() &&
                        task.status !== "completed"
                          ? "text-red-600 font-medium"
                          : "text-gray-800"
                      }`}
                    >
                      {task.dueDate ? (
                        <span className="flex items-center">
                          <svg
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 text-gray-500 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-xs sm:text-sm break-words">
                            {formatDate(task.dueDate)}
                          </span>
                        </span>
                      ) : (
                        "No due date"
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex flex-col">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-500 mb-1.5">
                      Created By
                    </h3>
                    <div className="text-xs sm:text-sm text-gray-800 font-medium">
                      {task.creator ? (
                        <span className="flex items-center">
                          <span className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-purple-100 text-purple-800 mr-1.5 sm:mr-2 text-xs sm:text-sm">
                            {task.creator.name.charAt(0)}
                          </span>
                          <span className="hidden xs:inline">
                            {task.creator.name}
                          </span>
                        </span>
                      ) : (
                        "Unknown"
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-500 mb-1.5 flex items-center">
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 text-gray-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Created On
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-700">
                    {formatDate(task.createdAt)}
                  </p>
                </div>

                <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-500 mb-1.5 flex items-center">
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 text-gray-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Last Updated
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-700">
                    {formatDate(task.updatedAt)}
                  </p>
                </div>

                {task.isRecurring && (
                  <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-500 mb-1.5 flex items-center">
                      <svg
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 text-purple-500 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Recurrence
                    </h3>
                    <p className="text-xs sm:text-sm capitalize text-gray-700 font-medium">
                      {task.recurrencePattern} recurrence
                    </p>
                  </div>
                )}
              </div>

              {task.tags && task.tags.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-sm sm:text-md font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center">
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-indigo-500 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {task.tags.map((tag, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm"
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4 sm:mb-6">
                <h3 className="text-sm sm:text-md font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center">
                  <svg
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-indigo-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h7"
                    />
                  </svg>
                  Description
                </h3>
                <div className="bg-white p-3 sm:p-5 rounded-lg border border-gray-200 shadow-sm">
                  {task.description ? (
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {task.description}
                    </p>
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-500 italic">
                      No description provided.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TaskDetailPage;
