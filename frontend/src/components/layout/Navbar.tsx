"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
// import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";

const Navbar: React.FC = () => {
  // const router = useRouter();
  const { user, logout } = useAuthStore();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const profileTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close the sidebar when clicking outside on small screens
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById("logo-sidebar");
      const toggleButton = document.getElementById("sidebar-toggle-button");

      if (
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        toggleButton &&
        !toggleButton.contains(event.target as Node)
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Toggle sidebar visibility for mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    const sidebar = document.getElementById("logo-sidebar");
    if (sidebar) {
      if (!sidebarOpen) {
        sidebar.classList.remove("-translate-x-full");
      } else {
        sidebar.classList.add("-translate-x-full");
      }
    }
  };

  const handleLogout = async () => {
    try {
      // First set a flag that we're explicitly logging out
      localStorage.setItem("FORCE_LOGOUT", "true");
      localStorage.setItem("logged_out", "true");

      // Remove auth token immediately
      localStorage.removeItem("authToken");

      // Then immediately redirect to homepage
      window.location.href = "/?action=logout&t=" + new Date().getTime();

      // In the background, call the API for cleanup
      setTimeout(() => {
        logout().catch((error) => console.error("Error logging out:", error));
      }, 100);
    } catch (error) {
      console.error("Error with logout process:", error);
      // Fallback redirect if something goes wrong
      window.location.href = "/";
    }
  };

  const handleMouseEnter = () => {
    if (profileTimeoutRef.current) {
      clearTimeout(profileTimeoutRef.current);
      profileTimeoutRef.current = null;
    }
    setProfileMenuOpen(true);
  };

  const handleMouseLeave = () => {
    if (profileTimeoutRef.current) {
      clearTimeout(profileTimeoutRef.current);
    }

    profileTimeoutRef.current = setTimeout(() => {
      setProfileMenuOpen(false);
    }, 500); // 0.5 seconds before disappearing
  };

  return (
    <nav className="bg-white border-b border-gray-200 py-2.5 px-3 fixed left-0 right-0 top-0 z-50 lg:left-64 shadow-md">
      <div className="flex flex-wrap justify-between items-center">
        <div className="flex items-center justify-start">
          {/* Mobile menu button */}
          <button
            id="sidebar-toggle-button"
            onClick={toggleSidebar}
            type="button"
            className="inline-flex items-center p-1.5 text-gray-700 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <span className="sr-only">Open sidebar</span>
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                fillRule="evenodd"
                d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
              ></path>
            </svg>
          </button>
          <span className="ml-3 text-sm font-semibold lg:hidden text-gray-800 truncate">
            Task Management
          </span>
        </div>

        <div className="flex items-center lg:order-2 gap-2">
          {/* Notification dropdown */}
          <NotificationDropdown />

          {/* Profile dropdown */}
          <div
            className="relative ml-1"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              className="flex items-center gap-2 max-w-xs text-sm bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-full focus:ring-2 focus:ring-blue-300 p-0.5 pl-1.5 pr-3 transition-all duration-200 border border-blue-100 shadow-sm hover:shadow"
              id="user-menu-button"
              aria-expanded={profileMenuOpen}
            >
              <span className="sr-only">Open user menu</span>
              <div className="relative w-7 h-7 overflow-hidden bg-blue-100 rounded-full flex-shrink-0">
                <svg
                  className="absolute w-8 h-8 text-blue-500 -left-0.5 -top-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
              <span className="hidden md:inline-block text-sm font-medium text-gray-700 max-w-[150px] truncate">
                {user?.name || "User"}
              </span>
            </button>

            {/* Profile dropdown menu */}
            {profileMenuOpen && (
              <div
                className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button"
              >
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                  <span className="block text-sm text-gray-900 font-medium break-words">
                    {user?.name || "User"}
                  </span>
                  <span className="block text-xs text-gray-600 truncate">
                    {user?.email || "user@example.com"}
                  </span>
                </div>
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  role="menuitem"
                >
                  Profile
                </Link>
                <button
                  className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  role="menuitem"
                  onClick={handleLogout}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
