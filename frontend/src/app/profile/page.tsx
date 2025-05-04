"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";
import Link from "next/link";

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
      <div className="flex justify-center items-center h-64">
        <div className="text-lg font-medium text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto pb-12 mt-16 pt-4">
      <div className="max-w-2xl mx-auto">
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

        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
          <div className="p-5">
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Your Profile
            </h1>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm mb-3">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded text-sm mb-3">
                {successMessage}
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleUpdateProfile}>
                <div className="mb-3">
                  <label
                    className="block text-gray-700 text-sm font-medium mb-1"
                    htmlFor="name"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label
                    className="block text-gray-700 text-sm font-medium mb-1"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label
                    className="block text-gray-700 text-sm font-medium mb-1"
                    htmlFor="currentPassword"
                  >
                    Current Password (required for password change)
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required={!!newPassword}
                  />
                </div>

                <div className="mb-3">
                  <label
                    className="block text-gray-700 text-sm font-medium mb-1"
                    htmlFor="newPassword"
                  >
                    New Password (leave blank to keep current)
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-medium mb-1"
                    htmlFor="confirmPassword"
                  >
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-sm border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="mb-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-xs font-medium text-gray-500">
                        Name
                      </h3>
                      <p className="mt-1 text-sm text-gray-800">{user.name}</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-medium text-gray-500">
                        Email
                      </h3>
                      <p className="mt-1 text-sm text-gray-800">{user.email}</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-medium text-gray-500">
                        Role
                      </h3>
                      <p className="mt-1 text-sm text-gray-800 capitalize">
                        {user.role}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xs font-medium text-gray-500">
                        User ID
                      </h3>
                      <p className="mt-1 text-sm text-gray-800">{user._id}</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1.5 text-sm border border-blue-300 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 flex items-center"
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
                      />
                    </svg>
                    Edit Profile
                  </button>
                  <button
                    onClick={() => {
                      logout()
                        .then(() => {
                          router.push("/");
                        })
                        .catch((error) => {
                          console.error("Error logging out:", error);
                        });
                    }}
                    className="px-3 py-1.5 text-sm border border-red-300 text-red-600 bg-red-50 rounded-md hover:bg-red-100 flex items-center"
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
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
