"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useTaskStore, { TaskInput } from "@/stores/taskStore";
import useUserStore, { User } from "@/stores/userStore";

const CreateTaskPage = () => {
  const router = useRouter();
  const { createTask } = useTaskStore();
  const { users, fetchUsers } = useUserStore();

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
    "daily" | "weekly" | "monthly" | "none"
  >("none");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch users when component mounts
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const taskData: TaskInput = {
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

      await createTask(taskData);
      router.push("/dashboard");
    } catch (error: unknown) {
      const err = error as Error;
      setError(err.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-4 mb-4 mt-16 pt-6 border border-gray-100">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4 mt-2 flex items-center">
        <svg
          className="w-6 h-6 mr-2 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        Create New Task
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm mb-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2">
            <label
              className="block text-gray-700 text-sm font-medium mb-1"
              htmlFor="title"
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="col-span-2">
            <label
              className="block text-gray-700 text-sm font-medium mb-1"
              htmlFor="description"
            >
              Description
            </label>
            <textarea
              id="description"
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Task description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div>
            <label
              className="block text-gray-700 text-sm font-medium mb-1"
              htmlFor="dueDate"
            >
              Due Date
            </label>
            <input
              id="dueDate"
              type="datetime-local"
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div>
            <label
              className="block text-gray-700 text-sm font-medium mb-1"
              htmlFor="priority"
            >
              Priority
            </label>
            <select
              id="priority"
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              className="block text-gray-700 text-sm font-medium mb-1"
              htmlFor="status"
            >
              Status
            </label>
            <select
              id="status"
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            </select>
          </div>

          <div>
            <label
              className="block text-gray-700 text-sm font-medium mb-1"
              htmlFor="assignedTo"
            >
              Assign To
            </label>
            <select
              id="assignedTo"
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="">Unassigned</option>
              {users.map((user: User) => (
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
              className="h-3.5 w-3.5 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
            />
            <label
              htmlFor="isRecurring"
              className="ml-2 block text-gray-700 text-sm"
            >
              Recurring Task
            </label>
          </div>

          {isRecurring && (
            <div>
              <label
                className="block text-gray-700 text-sm font-medium mb-1"
                htmlFor="recurrencePattern"
              >
                Recurrence Pattern
              </label>
              <select
                id="recurrencePattern"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={recurrencePattern}
                onChange={(e) =>
                  setRecurrencePattern(
                    e.target.value as "daily" | "weekly" | "monthly" | "none"
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
              className="block text-gray-700 text-sm font-medium mb-1"
              htmlFor="tags"
            >
              Tags (comma separated)
            </label>
            <input
              id="tags"
              type="text"
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. urgent, meeting, follow-up"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end space-x-3">
          <button
            type="button"
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            onClick={() => router.back()}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1.5 text-sm border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTaskPage;
