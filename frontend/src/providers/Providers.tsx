"use client";

import React, { useEffect } from "react";
import { SocketProvider } from "@/providers/SocketProviders";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import useAuthStore from "@/stores/authStore";
import LogoutStateGuard from "@/components/LogoutStateGuard";
import { initPerformanceMonitoring } from "@/utils/performanceMonitor";

/**
 * Providers component - Wraps all global providers to avoid nesting hell
 */
export const Providers = ({ children }: { children: React.ReactNode }) => {
  const { initialize } = useAuthStore();

  useEffect(() => {
    // Initialize auth on component mount
    initialize();

    // Initialize performance monitoring
    initPerformanceMonitoring();
  }, [initialize]);

  return (
    <LogoutStateGuard>
      <SocketProvider>
        {children}
        <ServiceWorkerRegistration />
      </SocketProvider>
    </LogoutStateGuard>
  );
};
