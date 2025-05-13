import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Task } from "@/stores/taskStore";
import { motion } from "framer-motion";

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  // Helper function to get the appropriate status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "to-do":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "in-progress":
        return "bg-indigo-50 text-indigo-600 border-indigo-200";
      case "completed":
        return "bg-green-50 text-green-600 border-green-200";
      case "archived":
        return "bg-gray-50 text-gray-600 border-gray-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  // Helper function to get the appropriate priority color
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "low":
        return "bg-green-50 text-green-600 border-green-200";
      case "medium":
        return "bg-yellow-50 text-yellow-600 border-yellow-200";
      case "high":
        return "bg-red-50 text-red-600 border-red-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  // Format the due date if it exists
  const formattedDueDate = task.dueDate
    ? format(new Date(task.dueDate), "MMM d, yyyy h:mm a")
    : "No due date";

  // Check if the task is overdue
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "completed";

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 6px 16px -5px rgba(0, 0, 0, 0.1)" }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-md shadow-sm overflow-hidden border border-gray-200 hover:border-blue-200 transition-all duration-300 h-full relative group"
    >
      {/* Priority indicator stripe at the top */}
      <div
        className={`h-0.5 w-full ${
          task.priority === "high"
            ? "bg-red-500"
            : task.priority === "medium"
            ? "bg-yellow-500"
            : "bg-green-500"
        }`}
      ></div>

      <div className="p-2.5 flex flex-col h-full">
        <div className="flex justify-between items-start mb-1.5">
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 pr-2 group-hover:text-blue-600 transition-colors duration-200">
            {task.title}
          </h3>
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
              task.status
            )} whitespace-nowrap ml-1 flex-shrink-0`}
          >
            {task.status}
          </span>
        </div>

        <div className="mb-1.5 flex-grow">
          <p className="text-xs text-gray-600 line-clamp-2">
            {task.description || "No description provided."}
          </p>
        </div>

        <div className="space-y-1 mb-2 text-xs">
          <div className="flex items-center gap-1">
            <svg
              className="w-3 h-3 text-gray-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
              ></path>
            </svg>
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(
                task.priority
              )}`}
            >
              {task.priority}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <svg
              className="w-3 h-3 text-gray-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              ></path>
            </svg>
            <span
              className={`text-xs truncate ${
                isOverdue ? "text-red-600 font-medium" : "text-gray-700"
              }`}
            >
              {isOverdue && (
                <svg
                  className="w-3 h-3 inline mr-0.5 text-red-500"
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
              )}
              {formattedDueDate}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <svg
              className="w-3 h-3 text-gray-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              ></path>
            </svg>
            <span className="text-xs text-gray-700 font-medium truncate">
              {task.assignedTo ? task.assignedTo.name : "Unassigned"}
            </span>
          </div>
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="mb-1.5">
            <div className="flex flex-wrap gap-1">
              {task.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end mt-auto pt-1.5 border-t border-gray-100">
          <Link
            href={`/tasks/${task._id}`}
            className="text-blue-600 hover:text-blue-800 text-xs font-medium inline-flex items-center group transition-all duration-200"
          >
            <span>View Details</span>
            <motion.svg
              whileHover={{ x: 3 }}
              className="w-3 h-3 ml-1 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              ></path>
            </motion.svg>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;
