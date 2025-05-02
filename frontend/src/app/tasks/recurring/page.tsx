"use client";

import React, { useEffect, useState } from "react";
import useTaskStore, { Task } from "@/stores/taskStore";
import Link from "next/link";
import { format } from "date-fns";

const RecurringTasksPage = () => {
  const { tasks, fetchTasks, updateTask, loading } = useTaskStore();
  const [recurringTasks, setRecurringTasks] = useState<Task[]>([]);

  // Fetch all tasks when the component mounts
  useEffect(() => {
    const loadData = async () => {
      // Reset the task list when navigating to this page
      await fetchTasks();
    };
    loadData();
  }, [fetchTasks]);

  // Filter recurring tasks whenever tasks change
  useEffect(() => {
    const filteredTasks = tasks.filter((task) => task.isRecurring);
    setRecurringTasks(filteredTasks);
  }, [tasks]);

  // Handle pattern change
  const handlePatternChange = async (taskId: string, pattern: string) => {
    try {
      await updateTask(taskId, {
        recurrencePattern: pattern as "daily" | "weekly" | "monthly" | "none",
      });
    } catch (error) {
      console.error("Failed to update recurrence pattern:", error);
    }
  };

  // Handle recurring toggle
  const handleRecurringToggle = async (
    taskId: string,
    isRecurring: boolean
  ) => {
    try {
      await updateTask(taskId, {
        isRecurring,
        // If turning off recurring, set pattern to none
        ...(isRecurring === false && { recurrencePattern: "none" }),
      });
    } catch (error) {
      console.error("Failed to toggle recurring status:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg font-medium text-gray-500">
          Loading recurring tasks...
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Recurring Tasks</h1>
        <Link
          href="/tasks/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create New Task
        </Link>
      </div>

      {recurringTasks.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600">
            You don&apos;t have any recurring tasks yet. Create a task and set
            it to recurring.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-sm overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {recurringTasks.map((task) => (
              <li key={task._id}>
                <div className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className={`flex-shrink-0 h-4 w-4 rounded-full mr-3 ${
                            task.status === "completed"
                              ? "bg-green-500"
                              : task.status === "in-progress"
                              ? "bg-blue-500"
                              : "bg-yellow-500"
                          }`}
                        ></div>
                        <Link
                          href={`/tasks/${task._id}`}
                          className="text-lg font-medium text-blue-600 truncate"
                        >
                          {task.title}
                        </Link>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            task.priority === "high"
                              ? "bg-red-100 text-red-800"
                              : task.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {task.priority}
                        </span>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            task.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : task.status === "in-progress"
                              ? "bg-blue-100 text-blue-800"
                              : task.status === "archived"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>
                    </div>
                    <div className="sm:flex sm:justify-between mt-2">
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p className="mr-6">
                          <span className="font-medium text-gray-700">
                            Pattern:
                          </span>{" "}
                          <select
                            value={task.recurrencePattern}
                            onChange={(e) =>
                              handlePatternChange(task._id, e.target.value)
                            }
                            className="ml-1 text-sm border-gray-300 rounded-md"
                          >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="none">None</option>
                          </select>
                        </p>
                        <p className="mr-6">
                          <span className="font-medium text-gray-700">
                            Due:
                          </span>{" "}
                          {task.dueDate
                            ? format(new Date(task.dueDate), "MMM d, yyyy")
                            : "No due date"}
                        </p>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 mr-2">
                            Recurring:
                          </span>
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={task.isRecurring}
                              onChange={(e) =>
                                handleRecurringToggle(
                                  task._id,
                                  e.target.checked
                                )
                              }
                              className="sr-only peer"
                            />
                            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          <span className="font-medium text-gray-700">
                            Created:
                          </span>{" "}
                          {format(new Date(task.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RecurringTasksPage;
