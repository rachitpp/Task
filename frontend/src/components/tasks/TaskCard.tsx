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
    switch (status) {
      case "to-do":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "archived":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Helper function to get the appropriate priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 h-full"
    >
      <div className="p-5 flex flex-col h-full">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {task.title}
          </h3>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
              task.status
            )}`}
          >
            {task.status}
          </span>
        </div>

        <div className="mb-4 flex-grow">
          <p className="text-gray-600 line-clamp-2">
            {task.description || "No description provided."}
          </p>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Priority</span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(
                task.priority
              )}`}
            >
              {task.priority}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Due Date</span>
            <span
              className={`text-sm ${
                isOverdue ? "text-red-600 font-medium" : "text-gray-700"
              }`}
            >
              {isOverdue && (
                <svg
                  className="w-4 h-4 inline mr-1 text-red-500"
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

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">
              Assigned To
            </span>
            <span className="text-sm text-gray-700 font-medium">
              {task.assignedTo ? task.assignedTo.name : "Unassigned"}
            </span>
          </div>
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1.5">
              {task.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200 transition-colors duration-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end mt-auto pt-2 border-t border-gray-100">
          <Link
            href={`/tasks/${task._id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center group transition-all duration-200"
          >
            <span>View Details</span>
            <svg
              className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200"
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
            </svg>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;
