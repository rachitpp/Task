"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";
import Link from "next/link";
import { motion } from "framer-motion";

interface ProfileData {
  name: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
}

const ProfilePage = () => {
  const router = useRouter();
  const { user, updateProfile, loading, logout } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    } else {
      router.push("/login");
    }
  }, [user, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (newPassword && newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    try {
      const profileData: ProfileData = {
        name,
        email,
      };

      if (newPassword) {
        profileData.currentPassword = currentPassword;
        profileData.newPassword = newPassword;
      }

      await updateProfile(profileData);
      setSuccessMessage("Profile updated successfully");
      setIsEditing(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to update profile");
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-80">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-t-4 border-indigo-600 border-solid rounded-full animate-spin mb-4"></div>
          <div className="text-md font-medium text-gray-600">
            Loading profile...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 max-w-4xl mx-auto">
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

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-lg shadow-lg overflow-hidden"
      >
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center text-indigo-600 text-xl sm:text-3xl font-bold mb-3 sm:mb-0 sm:mr-4 shadow-md mx-auto sm:mx-0">
              {user.name.charAt(0)}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">
                {user.name}
              </h1>
              <p className="text-indigo-100 text-sm sm:text-base">
                {user.email}
              </p>
              <div className="mt-2">
                <span className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-indigo-800 text-white shadow-sm capitalize">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-6">
          {error && (
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
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-2 sm:p-4 rounded mb-3 sm:mb-4 text-xs sm:text-sm flex items-center">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {successMessage}
            </div>
          )}

          {isEditing ? (
            <form
              onSubmit={handleUpdateProfile}
              className="space-y-3 sm:space-y-4"
            >
              <div>
                <label
                  className="block text-gray-700 text-xs sm:text-sm font-medium mb-1 sm:mb-2"
                  htmlFor="name"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label
                  className="block text-gray-700 text-xs sm:text-sm font-medium mb-1 sm:mb-2"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label
                  className="block text-gray-700 text-xs sm:text-sm font-medium mb-1 sm:mb-2"
                  htmlFor="currentPassword"
                >
                  Current Password (required for password change)
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required={!!newPassword}
                />
              </div>

              <div>
                <label
                  className="block text-gray-700 text-xs sm:text-sm font-medium mb-1 sm:mb-2"
                  htmlFor="newPassword"
                >
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  id="newPassword"
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div>
                <label
                  className="block text-gray-700 text-xs sm:text-sm font-medium mb-1 sm:mb-2"
                  htmlFor="confirmPassword"
                >
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  disabled={loading}
                >
                  {loading ? (
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
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5 mb-4 sm:mb-6">
                <div className="bg-white p-3 sm:p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <h3 className="text-sm sm:text-md font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center">
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-indigo-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Personal Information
                  </h3>

                  <div className="mb-3">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                      Name
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-800 font-medium">
                      {user.name}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                      Email
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-800 font-medium break-all">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-3 sm:p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <h3 className="text-sm sm:text-md font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center">
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-indigo-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    Account Information
                  </h3>

                  <div className="mb-3">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                      Role
                    </h4>
                    <p className="text-gray-800">
                      <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-medium bg-indigo-100 text-indigo-800 capitalize">
                        {user.role}
                      </span>
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                      User ID
                    </h4>
                    <p className="text-xs text-gray-600 font-mono break-all bg-gray-50 p-1.5 sm:p-2 rounded border border-gray-200 overflow-x-auto">
                      {user._id}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsEditing(true)}
                  className="px-3 sm:px-5 py-1.5 sm:py-2.5 text-xs sm:text-sm font-medium text-indigo-600 bg-white border border-indigo-200 rounded-md sm:rounded-lg hover:bg-indigo-50 shadow-sm transition duration-200 flex items-center"
                >
                  <svg
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0"
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
                  Edit Profile
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    // Set logout flags immediately
                    localStorage.setItem("FORCE_LOGOUT", "true");
                    localStorage.setItem("logged_out", "true");

                    // Remove auth token immediately
                    localStorage.removeItem("authToken");

                    // Redirect to homepage immediately
                    window.location.href =
                      "/?action=logout&t=" + new Date().getTime();

                    // Call logout in the background for cleanup
                    setTimeout(() => {
                      logout().catch((error) =>
                        console.error("Error in background logout:", error)
                      );
                    }, 100);
                  }}
                  className="px-3 sm:px-5 py-1.5 sm:py-2.5 text-xs sm:text-sm font-medium text-red-600 bg-white border border-red-200 rounded-md sm:rounded-lg hover:bg-red-50 shadow-sm transition duration-200 flex items-center"
                >
                  <svg
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Sign Out
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
