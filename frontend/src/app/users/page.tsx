"use client";

import React, { useState, useEffect } from "react";
import useAuthStore from "@/stores/authStore";
import RoleGuard from "@/components/RoleGuard";
import api, { userApi } from "@/services/api";

// Define the user interface for this page
interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "manager" | "admin";
  createdAt?: string;
}

const UserManagementPage = () => {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Use the api instance instead of direct fetch
        const response = await api.get("/users");
        const data = response.data;

        setUsers(data.data || []);
        setError(null);
      } catch (err) {
        setError("Error fetching users. Please try again.");
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle role change
  const handleRoleChange = async (
    userId: string,
    newRole: "user" | "manager" | "admin"
  ) => {
    try {
      setError(null); // Clear any previous errors

      // Don't allow changing own role
      if (userId === user?._id) {
        setError("You cannot change your own role.");
        return;
      }

      // Define the API URL directly - using the PUT method instead of PATCH
      // Going to use the main PUT endpoint instead of the specialized PATCH endpoint
      const API_URL = "http://localhost:5000/api";

      console.log("Attempting to update role using PUT endpoint:", {
        userId,
        newRole,
        endpoint: `${API_URL}/users/${userId}`,
      });

      // Use the browser's fetch API with a PUT method that updates the entire user
      // This avoids potential issues with the PATCH implementation
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for cookies/auth
        body: JSON.stringify({
          role: newRole,
          // The PUT endpoint should update just the fields we provide
        }),
      });

      console.log("Response status:", response.status);

      // Get the response body as text first for debugging
      const responseText = await response.text();
      console.log("Response body:", responseText);

      // Parse the response if it's JSON
      let responseData;
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.error("Error parsing response JSON:", e);
        responseData = { success: false, message: "Invalid response format" };
      }

      if (!response.ok) {
        throw new Error(
          responseData.message || `Server error: ${response.status}`
        );
      }

      // Success! Update the local state
      setUsers(
        users.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );

      console.log("Role updated successfully:", {
        userId,
        newRole,
        response: responseData,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update user role";
      console.error("Error updating role:", error);
      setError(errorMessage);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId: string) => {
    // Don't allow deleting self
    if (userId === user?._id) {
      setError("You cannot delete your own account here.");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      // Use the userApi service instead of direct api call
      await userApi.deleteUser(userId);

      // Remove user from the local state
      setUsers(users.filter((u) => u._id !== userId));
      setError(null);
    } catch (err) {
      setError("Error deleting user. Please try again.");
      console.error("Error deleting user:", err);
    }
  };

  // Filter users based on search term and role filter
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchTerm === "" ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const renderUserManagement = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-md shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Enhanced Filter and search controls */}
        <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-700 mb-3">
            Filters & Search
          </h2>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                className="w-full py-2.5 px-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-500 hover:text-gray-700"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            <div>
              <select
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full md:w-auto p-2.5"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                aria-label="Filter by role"
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Search Results Summary */}
          <div className="mt-3 text-sm text-gray-500">
            Found {filteredUsers.length}{" "}
            {filteredUsers.length === 1 ? "user" : "users"}
            {searchTerm && <span> matching &quot;{searchTerm}&quot;</span>}
            {roleFilter && <span> with role &quot;{roleFilter}&quot;</span>}
          </div>
        </div>

        {/* Users Table - Enhanced */}
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <svg
                          className="h-12 w-12 text-gray-400 mb-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        <span className="text-sm">No users found</span>
                        {(searchTerm || roleFilter) && (
                          <button
                            className="mt-2 text-blue-500 text-sm hover:text-blue-600 hover:underline"
                            onClick={() => {
                              setSearchTerm("");
                              setRoleFilter("");
                            }}
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {u.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user?._id === u._id ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-800">
                            {u.role} (you)
                          </span>
                        ) : (
                          <div className="relative">
                            <select
                              value={u.role}
                              onChange={(e) =>
                                handleRoleChange(
                                  u._id,
                                  e.target.value as "user" | "manager" | "admin"
                                )
                              }
                              className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm w-full"
                            >
                              <option value="user">User</option>
                              <option value="manager">Manager</option>
                              <option value="admin">Admin</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-[150px]">
                        {u._id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex justify-end items-center">
                          {user?._id !== u._id ? (
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              className="text-red-600 hover:text-red-900 font-medium flex items-center gap-1"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Delete
                            </button>
                          ) : (
                            <span className="text-gray-400 font-medium">
                              Cannot delete
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <RoleGuard
      allowedRoles={["admin"]}
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Access Restricted
            </h2>
            <p className="text-gray-600">
              You don&apos;t have permission to view the user management page.
              This feature is available only to administrators.
            </p>
          </div>
        </div>
      }
    >
      <div className="container mx-auto px-4 py-8">
        <div className="pb-5 border-b border-gray-200 mb-6 flex flex-col md:flex-row items-start md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            User Management
          </h1>
          <p className="text-gray-500 text-sm mt-2 md:mt-0">
            Manage users and their access roles
          </p>
        </div>

        {renderUserManagement()}
      </div>
    </RoleGuard>
  );
};

export default UserManagementPage;
