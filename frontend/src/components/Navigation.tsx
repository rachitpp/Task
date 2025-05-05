"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";
import RoleGuard from "./RoleGuard";

const Navigation: React.FC = () => {
  const { user, logout, initialized } = useAuthStore();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      // First close the menu
      closeMenu();

      // Call the store's logout method - it now handles everything
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
      // The store will still handle force logout even if there's an error
    }
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  // Wait for auth to be initialized before rendering
  if (!initialized) {
    return null; // Don't render anything while checking auth
  }

  // Handle non-authenticated users
  if (!user) {
    return (
      <div className="flex items-center space-x-3">
        <Link href="/login" className="text-gray-800 hover:text-black">
          Login
        </Link>
        <Link
          href="/register"
          className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700"
        >
          Register
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center space-x-3">
        <nav className="hidden md:flex items-center space-x-2">
          <Link
            href="/dashboard"
            className={`text-sm px-2.5 py-1.5 rounded-md ${
              isActive("/dashboard")
                ? "bg-gray-100 text-black"
                : "text-gray-800 hover:text-black hover:bg-gray-50"
            }`}
          >
            Dashboard
          </Link>

          <Link
            href="/tasks"
            className={`text-sm px-2.5 py-1.5 rounded-md ${
              isActive("/tasks")
                ? "bg-gray-100 text-black"
                : "text-gray-800 hover:text-black hover:bg-gray-50"
            }`}
          >
            Tasks
          </Link>

          <Link
            href="/tasks/recurring"
            className={`text-sm px-2.5 py-1.5 rounded-md ${
              isActive("/tasks/recurring")
                ? "bg-gray-100 text-black"
                : "text-gray-800 hover:text-black hover:bg-gray-50"
            }`}
          >
            Recurring Tasks
          </Link>

          <RoleGuard allowedRoles={["admin", "manager"]}>
            <Link
              href="/analytics"
              className={`text-sm px-2.5 py-1.5 rounded-md ${
                isActive("/analytics")
                  ? "bg-gray-100 text-black"
                  : "text-gray-800 hover:text-black hover:bg-gray-50"
              }`}
            >
              Analytics
            </Link>
          </RoleGuard>

          <RoleGuard allowedRoles={["admin"]}>
            <Link
              href="/admin"
              className={`text-sm px-2.5 py-1.5 rounded-md ${
                isActive("/admin")
                  ? "bg-gray-100 text-black"
                  : "text-gray-800 hover:text-black hover:bg-gray-50"
              }`}
            >
              Admin
            </Link>
          </RoleGuard>
        </nav>

        <button
          onClick={toggleMenu}
          className="relative flex items-center text-gray-800 hover:text-black focus:outline-none"
        >
          <span className="sr-only">Open user menu</span>
          <div className="flex items-center">
            <span className="hidden md:block text-sm mr-2 font-medium">
              {user.name}
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </button>
      </div>

      {/* Mobile menu button */}
      <button
        onClick={toggleMenu}
        className="md:hidden inline-flex items-center justify-center p-1.5 rounded-md text-gray-800 hover:text-black hover:bg-gray-100 focus:outline-none"
      >
        <span className="sr-only">Open main menu</span>
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* User dropdown menu */}
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
          <div className="px-3 py-1.5 text-xs text-gray-700 border-b border-gray-100">
            Signed in as <span className="font-semibold">{user.email}</span>
          </div>

          <Link
            href="/profile"
            onClick={closeMenu}
            className="block px-3 py-1.5 text-sm text-gray-900 hover:bg-gray-100"
          >
            Your Profile
          </Link>

          <Link
            href="/tasks"
            onClick={closeMenu}
            className="block px-3 py-1.5 text-sm text-gray-900 hover:bg-gray-100 md:hidden"
          >
            Tasks
          </Link>

          <Link
            href="/tasks/recurring"
            onClick={closeMenu}
            className="block px-3 py-1.5 text-sm text-gray-900 hover:bg-gray-100 md:hidden"
          >
            Recurring Tasks
          </Link>

          <RoleGuard allowedRoles={["admin", "manager"]}>
            <Link
              href="/analytics"
              onClick={closeMenu}
              className="block px-3 py-1.5 text-sm text-gray-900 hover:bg-gray-100 md:hidden"
            >
              Analytics
            </Link>
          </RoleGuard>

          <RoleGuard allowedRoles={["admin"]}>
            <Link
              href="/admin"
              onClick={closeMenu}
              className="block px-3 py-1.5 text-sm text-gray-900 hover:bg-gray-100 md:hidden"
            >
              Admin
            </Link>
          </RoleGuard>

          <hr className="my-1 border-gray-100" />

          {/* Use a button for reliable logout without navigation */}
          <button
            onClick={handleLogout}
            className="block w-full text-left px-3 py-1.5 text-sm text-gray-900 hover:bg-gray-100"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default Navigation;
