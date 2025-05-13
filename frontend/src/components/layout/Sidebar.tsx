"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useAuthStore from "@/stores/authStore";

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuthStore();

  // Navigation items with access control
  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
          <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
        </svg>
      ),
      roles: ["user", "manager", "admin"],
      category: "main",
    },
    {
      name: "Notifications",
      href: "/notifications",
      icon: (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
        </svg>
      ),
      roles: ["user", "manager", "admin"],
      category: "main",
    },
    {
      name: "My Tasks",
      href: "/tasks/my-tasks",
      icon: (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
          <path
            fillRule="evenodd"
            d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
            clipRule="evenodd"
          ></path>
        </svg>
      ),
      roles: ["user", "manager", "admin"],
      category: "tasks",
    },
    {
      name: "Assigned Tasks",
      href: "/tasks/assigned",
      icon: (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
            clipRule="evenodd"
          ></path>
        </svg>
      ),
      roles: ["user", "manager", "admin"],
      category: "tasks",
    },
    {
      name: "Create Task",
      href: "/tasks/create",
      icon: (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
            clipRule="evenodd"
          ></path>
        </svg>
      ),
      roles: ["user", "manager", "admin"],
      category: "tasks",
    },
    {
      name: "All Tasks",
      href: "/tasks",
      icon: (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path>
        </svg>
      ),
      roles: ["manager", "admin"],
      category: "tasks",
    },
    {
      name: "User Management",
      href: "/users",
      icon: (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
        </svg>
      ),
      roles: ["admin"],
      category: "admin",
    },
  ];

  // Filter navigation items based on user role
  const filteredNavItems = navigationItems.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  // Group navigation items by category
  const categories = filteredNavItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof navigationItems>);

  return (
    <aside
      id="logo-sidebar"
      className="fixed top-0 left-0 z-40 w-64 h-screen pt-16 sm:pt-18 lg:pt-20 bg-white border-r border-gray-200 shadow-sm transition-transform -translate-x-full lg:translate-x-0 overflow-hidden"
      aria-label="Sidebar"
    >
      <div className="h-full px-2 sm:px-3 py-3 sm:py-4 overflow-y-auto bg-white">
        {/* Main Navigation */}
        <ul className="space-y-1 font-medium">
          {/* Dashboard with special spacing */}
          {categories.main?.map((item) => (
            <li key={item.href} className="mt-1 mb-2 sm:mb-3">
              <Link
                href={item.href}
                className={`flex items-center p-1.5 sm:p-2 rounded-lg transition-all duration-200 compact-text ${
                  pathname === item.href
                    ? "bg-blue-100 text-blue-700 shadow-sm"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div
                  className={`flex items-center justify-center rounded-md w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 ${
                    pathname === item.href
                      ? "bg-blue-200 text-blue-700"
                      : "text-gray-500 group-hover:text-blue-600"
                  }`}
                >
                  {item.icon}
                </div>
                <span className="ms-2 text-sm sm:text-base font-medium truncate">
                  {item.name}
                </span>
              </Link>
            </li>
          ))}

          {/* Task Section */}
          {categories.tasks?.length > 0 && (
            <>
              <li className="pt-1">
                <div className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider truncate compact-text-sm">
                  Task Management
                </div>
              </li>
              {categories.tasks.map((item) => (
                <li key={item.href} className="mt-1">
                  <Link
                    href={item.href}
                    className={`flex items-center p-1.5 sm:p-2 rounded-lg transition-all duration-200 compact-text ${
                      pathname === item.href
                        ? "bg-blue-100 text-blue-700 shadow-sm"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center rounded-md w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 ${
                        pathname === item.href
                          ? "bg-blue-200 text-blue-700"
                          : "text-gray-500 group-hover:text-blue-600"
                      }`}
                    >
                      {item.icon}
                    </div>
                    <span className="ms-2 text-sm sm:text-base font-medium truncate">
                      {item.name}
                    </span>
                  </Link>
                </li>
              ))}
            </>
          )}

          {/* Admin Section */}
          {categories.admin?.length > 0 && (
            <>
              <li className="pt-2 sm:pt-3 mt-1">
                <div className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider truncate compact-text-sm">
                  Administration
                </div>
              </li>
              {categories.admin.map((item) => (
                <li key={item.href} className="mt-1">
                  <Link
                    href={item.href}
                    className={`flex items-center p-1.5 sm:p-2 rounded-lg transition-all duration-200 compact-text ${
                      pathname === item.href
                        ? "bg-blue-100 text-blue-700 shadow-sm"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center rounded-md w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 ${
                        pathname === item.href
                          ? "bg-blue-200 text-blue-700"
                          : "text-gray-500 group-hover:text-blue-600"
                      }`}
                    >
                      {item.icon}
                    </div>
                    <span className="ms-2 text-sm sm:text-base font-medium truncate">
                      {item.name}
                    </span>
                  </Link>
                </li>
              ))}
            </>
          )}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
