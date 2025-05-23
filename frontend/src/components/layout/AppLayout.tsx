"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import useAuthStore from "@/stores/authStore";
import useNotificationStore from "@/stores/notificationStore";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, initialized, initialize } = useAuthStore();
  const { fetchUnreadCount } = useNotificationStore();

  // Check if user is authenticated on initial load
  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  // Redirect to login if not authenticated (except on auth pages and homepage)
  useEffect(() => {
    const authPages = [
      "/login",
      "/register",
      "/forgot-password",
      "/reset-password",
    ];
    const isAuthPage = authPages.some((page) => pathname?.startsWith(page));
    const isHomePage = pathname === "/";

    // Skip redirect if on auth pages or homepage
    if (initialized && !loading && !user && !isAuthPage && !isHomePage) {
      router.push("/login");
    }
  }, [user, loading, initialized, pathname, router]);

  // Fetch unread notifications count periodically
  useEffect(() => {
    // Only fetch if user is authenticated and initialization is complete
    if (initialized && user) {
      // Initial fetch
      fetchUnreadCount();

      // Set up interval for polling
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 60000); // Every minute

      return () => clearInterval(interval);
    }
  }, [user, initialized, fetchUnreadCount]);

  // Don't render layout on auth pages or homepage for unauthenticated users
  const authPages = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];
  const isAuthPage = authPages.some((page) => pathname?.startsWith(page));
  const isHomePage = pathname === "/";

  // Special handling for homepage and auth pages
  if (isAuthPage || isHomePage || !initialized || (initialized && !user)) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />
      <div className="pt-12 lg:ml-64 transition-all duration-300 overflow-visible">
        <div className="p-3 md:p-4 max-w-screen-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
