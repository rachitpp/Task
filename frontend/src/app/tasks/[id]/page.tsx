"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useTaskStore, { TaskInput } from "@/stores/taskStore";
import useAuthStore from "@/stores/authStore";
import useUserStore from "@/stores/userStore";
import { format } from "date-fns";

interface TaskDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const TaskDetailPage: React.FC<TaskDetailPageProps> = ({ params }) => {
  const router = useRouter();
  const { id } = React.use(params);
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
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get priority color for display
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Task not found.
        </div>
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-4 mb-4 mt-16 pt-4 border border-gray-100">
      <div className="mb-4 mt-2">
        <Link
          href="/dashboard"
          className="text-blue-600 hover:underline text-sm flex items-center"
        >
          <svg
            className="w-4 h-4 mr-1"
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm mb-3">
          {updateError}
        </div>
      )}

      <div className="bg-white rounded-lg overflow-hidden">
        {isEditing ? (
          // Edit form
          <div className="p-4">
            <h1 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-600"
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
            <form onSubmit={handleUpdate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label
                    className="block text-gray-700 font-medium mb-2"
                    htmlFor="title"
                  >
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label
                    className="block text-gray-700 font-medium mb-2"
                    htmlFor="description"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>

                <div>
                  <label
                    className="block text-gray-700 font-medium mb-2"
                    htmlFor="dueDate"
                  >
                    Due Date
                  </label>
                  <input
                    id="dueDate"
                    type="datetime-local"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 font-medium mb-2"
                    htmlFor="priority"
                  >
                    Priority
                  </label>
                  <select
                    id="priority"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="block text-gray-700 font-medium mb-2"
                    htmlFor="status"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="block text-gray-700 font-medium mb-2"
                    htmlFor="assignedTo"
                  >
                    Assign To
                  </label>
                  <select
                    id="assignedTo"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                <div className="flex items-center">
                  <input
                    id="isRecurring"
                    type="checkbox"
                    className="h-4 w-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                  />
                  <label
                    htmlFor="isRecurring"
                    className="ml-2 block text-gray-700"
                  >
                    Recurring Task
                  </label>
                </div>

                {isRecurring && (
                  <div>
                    <label
                      className="block text-gray-700 font-medium mb-2"
                      htmlFor="recurrencePattern"
                    >
                      Recurrence Pattern
                    </label>
                    <select
                      id="recurrencePattern"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                <div className="col-span-2">
                  <label
                    className="block text-gray-700 font-medium mb-2"
                    htmlFor="tags"
                  >
                    Tags (comma separated)
                  </label>
                  <input
                    id="tags"
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. urgent, meeting, follow-up"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={updateLoading}
                >
                  {updateLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          // View mode
          <div className="p-4">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-xl font-semibold text-gray-800 flex items-center">
                {task.priority === "high" && (
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2 inline-block"></span>
                )}
                {task.priority === "medium" && (
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2 inline-block"></span>
                )}
                {task.priority === "low" && (
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 inline-block"></span>
                )}
                {task.title}
              </h1>
              {canEdit && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-2.5 py-1 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 flex items-center"
                  >
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
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      ></path>
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-2.5 py-1 text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100 flex items-center"
                  >
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
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      ></path>
                    </svg>
                    Delete
                  </button>
                </div>
              )}
            </div>

            <div className="mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div>
                  <h3 className="text-xs font-medium text-gray-500">Status</h3>
                  <span
                    className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-medium text-gray-500">
                    Priority
                  </h3>
                  <span
                    className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-medium text-gray-500">
                    Assigned To
                  </h3>
                  <p className="mt-1 text-sm text-gray-800">
                    {task.assignedTo ? task.assignedTo.name : "Unassigned"}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-medium text-gray-500">
                    Created By
                  </h3>
                  <p className="mt-1 text-sm text-gray-800">
                    {task.creator ? task.creator.name : "Unknown"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div>
                  <h3 className="text-xs font-medium text-gray-500">
                    Due Date
                  </h3>
                  <p className="mt-1 text-sm text-gray-800">
                    {task.dueDate ? formatDate(task.dueDate) : "No due date"}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-medium text-gray-500">
                    Created On
                  </h3>
                  <p className="mt-1 text-sm text-gray-800">
                    {formatDate(task.createdAt)}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-medium text-gray-500">
                    Last Updated
                  </h3>
                  <p className="mt-1 text-sm text-gray-800">
                    {formatDate(task.updatedAt)}
                  </p>
                </div>

                {task.isRecurring && (
                  <div>
                    <h3 className="text-xs font-medium text-gray-500">
                      Recurrence
                    </h3>
                    <p className="mt-1 text-sm text-gray-800 capitalize">
                      {task.recurrencePattern}
                    </p>
                  </div>
                )}
              </div>

              {task.tags && task.tags.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-xs font-medium text-gray-500 mb-1">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {task.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xs font-medium text-gray-500 mb-1">
                  Description
                </h3>
                <div className="mt-1 prose prose-sm max-w-none text-gray-700">
                  {task.description ? (
                    <p className="text-sm">{task.description}</p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      No description provided.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailPage;
