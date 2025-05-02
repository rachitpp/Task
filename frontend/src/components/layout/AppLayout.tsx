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

  // Redirect to login if not authenticated (except on auth pages)
  useEffect(() => {
    const authPages = [
      "/login",
      "/register",
      "/forgot-password",
      "/reset-password",
    ];
    const isAuthPage = authPages.some((page) => pathname?.startsWith(page));

    if (initialized && !loading && !user && !isAuthPage) {
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

  // Don't render layout on auth pages
  const authPages = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];
  const isAuthPage = authPages.some((page) => pathname?.startsWith(page));

  if (isAuthPage || !initialized || (initialized && !user)) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 w-full overflow-hidden lg:ml-64">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 mt-16">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
