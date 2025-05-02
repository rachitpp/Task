"use client";

import React, { useState, useEffect } from "react";
import useAuthStore from "@/stores/authStore";
import useTaskStore from "@/stores/taskStore";
import RoleGuard from "@/components/RoleGuard";

interface TaskMetrics {
  completed: number;
  overdue: number;
  inProgress: number;
  todo: number;
  total: number;
  completionRate: number;
  averageCompletionTime: number; // in days
  tasksCreatedThisWeek: number;
  tasksCompletedThisWeek: number;
}

const AnalyticsPage = () => {
  const { user } = useAuthStore();
  const { dashboard, tasks, fetchDashboard, fetchTasks, loading } =
    useTaskStore();
  const [metrics, setMetrics] = useState<TaskMetrics | null>(null);
  const [timeframe, setTimeframe] = useState<"week" | "month" | "all">("month");

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboard();
    // Fetch all tasks for more detailed analysis
    fetchTasks({ limit: 100 });
  }, [fetchDashboard, fetchTasks]);

  // Calculate metrics when dashboard data changes
  useEffect(() => {
    if (!dashboard || !tasks.length) return;

    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Only include tasks within the selected timeframe
    const filteredTasks = tasks.filter((task) => {
      const taskDate = new Date(task.createdAt);
      if (timeframe === "week") return taskDate >= oneWeekAgo;
      if (timeframe === "month") return taskDate >= oneMonthAgo;
      return true; // "all" timeframe
    });

    // Count tasks by status
    const completed = filteredTasks.filter(
      (t) => t.status === "completed"
    ).length;
    const overdue = filteredTasks.filter((t) => {
      const dueDate = t.dueDate ? new Date(t.dueDate) : null;
      return dueDate && dueDate < now && t.status !== "completed";
    }).length;
    const inProgress = filteredTasks.filter(
      (t) => t.status === "in-progress"
    ).length;
    const todo = filteredTasks.filter((t) => t.status === "to-do").length;
    const total = filteredTasks.length;

    // Calculate completion rate
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    // Calculate average completion time (for completed tasks with createdAt and updatedAt)
    const completedTasks = filteredTasks.filter(
      (t) => t.status === "completed"
    );
    let totalCompletionDays = 0;

    completedTasks.forEach((task) => {
      const createdDate = new Date(task.createdAt);
      const completedDate = new Date(task.updatedAt);
      const daysDiff = Math.floor(
        (completedDate.getTime() - createdDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      totalCompletionDays += daysDiff;
    });

    const averageCompletionTime =
      completedTasks.length > 0
        ? totalCompletionDays / completedTasks.length
        : 0;

    // This week's tasks
    const tasksCreatedThisWeek = tasks.filter(
      (t) => new Date(t.createdAt) >= oneWeekAgo
    ).length;

    const tasksCompletedThisWeek = tasks.filter(
      (t) => t.status === "completed" && new Date(t.updatedAt) >= oneWeekAgo
    ).length;

    // Set the calculated metrics
    setMetrics({
      completed,
      overdue,
      inProgress,
      todo,
      total,
      completionRate,
      averageCompletionTime,
      tasksCreatedThisWeek,
      tasksCompletedThisWeek,
    });
  }, [dashboard, tasks, timeframe]);

  const renderAnalyticsDashboard = () => {
    if (loading || !dashboard || !metrics) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg font-medium text-gray-500">
            Loading analytics data...
          </div>
        </div>
      );
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
            Task Analytics Dashboard
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeframe("week")}
              className={`px-4 py-2 rounded ${
                timeframe === "week"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeframe("month")}
              className={`px-4 py-2 rounded ${
                timeframe === "month"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimeframe("all")}
              className={`px-4 py-2 rounded ${
                timeframe === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              All Time
            </button>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
              Completion Rate
            </h2>
            <div className="flex items-center">
              <div className="relative h-16 w-16 mr-4">
                <svg viewBox="0 0 36 36" className="h-16 w-16 stroke-current">
                  <path
                    className="stroke-blue-100"
                    fill="none"
                    strokeWidth="3"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="stroke-blue-600"
                    fill="none"
                    strokeWidth="3"
                    strokeDasharray={`${metrics.completionRate}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text
                    x="18"
                    y="20.5"
                    className="text-xs fill-blue-600 font-medium text-center"
                    textAnchor="middle"
                  >
                    {Math.round(metrics.completionRate)}%
                  </text>
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {Math.round(metrics.completionRate)}%
                </div>
                <div className="text-sm text-gray-500">Tasks completed</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
              Average Completion Time
            </h2>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {metrics.averageCompletionTime.toFixed(1)} days
                </div>
                <div className="text-sm text-gray-500">
                  Avg. time to complete
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
              This Week
            </h2>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 mr-4">
                <svg
                  className="h-8 w-8 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <div className="flex">
                  <div className="mr-3">
                    <div className="text-xl font-bold">
                      {metrics.tasksCreatedThisWeek}
                    </div>
                    <div className="text-xs text-gray-500">Created</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold">
                      {metrics.tasksCompletedThisWeek}
                    </div>
                    <div className="text-xs text-gray-500">Completed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
              Overdue Tasks
            </h2>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 mr-4">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold">{metrics.overdue}</div>
                <div className="text-sm text-gray-500">Tasks overdue</div>
              </div>
            </div>
          </div>
        </div>

        {/* Task Status Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-medium text-gray-700 mb-4">
              Task Status Distribution
            </h2>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Completed
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {metrics.completed}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-green-500 h-2.5 rounded-full"
                  style={{
                    width: `${(metrics.completed / metrics.total) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  In Progress
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {metrics.inProgress}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-500 h-2.5 rounded-full"
                  style={{
                    width: `${(metrics.inProgress / metrics.total) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">To Do</span>
                <span className="text-sm font-medium text-gray-700">
                  {metrics.todo}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-yellow-500 h-2.5 rounded-full"
                  style={{ width: `${(metrics.todo / metrics.total) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Overdue
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {metrics.overdue}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-red-500 h-2.5 rounded-full"
                  style={{
                    width: `${(metrics.overdue / metrics.total) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-medium text-gray-700 mb-4">
              Task Priority Distribution
            </h2>

            <div className="flex flex-col h-56 justify-center">
              {dashboard.tasksByPriority &&
              Object.keys(dashboard.tasksByPriority).length > 0 ? (
                <div className="flex h-full items-end justify-around">
                  {Object.entries(dashboard.tasksByPriority).map(
                    ([priority, count]) => {
                      const priorityColors: Record<string, string> = {
                        high: "bg-red-500",
                        medium: "bg-yellow-500",
                        low: "bg-green-500",
                      };

                      const total = Object.values(
                        dashboard.tasksByPriority
                      ).reduce((a: number, b: number) => a + b, 0);
                      const percentage = Math.round(
                        ((count as number) / total) * 100
                      );
                      const height = `${Math.max(percentage, 5)}%`;

                      return (
                        <div
                          key={priority}
                          className="flex flex-col items-center mx-2"
                        >
                          <div className="text-xs mb-1">{percentage}%</div>
                          <div
                            className={`w-16 ${priorityColors[priority]} rounded-t`}
                            style={{ height }}
                          ></div>
                          <div className="mt-2 text-sm capitalize">
                            {priority}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  No priority data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Task Completion Trends */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Top Performers
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed Tasks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg. Completion Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* This would be populated with actual data from a backend API call */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.name || "Current User"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {metrics.completed}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {metrics.averageCompletionTime.toFixed(1)} days
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Export Data */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-700">Export Data</h2>
            <button
              onClick={() => {
                alert("Analytics data would be exported here");
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Export to CSV
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Download analytics data for reporting or further analysis.
          </p>
        </div>
      </div>
    );
  };

  return (
    <RoleGuard
      allowedRoles={["admin", "manager"]}
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Access Restricted
            </h2>
            <p className="text-gray-600">
              You don&apos;t have permission to view the analytics dashboard.
              This feature is available only to managers and administrators.
            </p>
          </div>
        </div>
      }
    >
      {renderAnalyticsDashboard()}
    </RoleGuard>
  );
};

export default AnalyticsPage;
