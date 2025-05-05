"use client";

import { useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { isLoggedOut } from "@/utils/logoutHelper";
import useAuthStore from "@/stores/authStore";

/**
 * This component guards against stale auth state by checking
 * logout flags and forcing a reload to the login page if needed
 */
const LogoutStateGuard = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const { user } = useAuthStore();

  useEffect(() => {
    // Don't run this check on login, register, or logout pages
    const isAuthPage = ["/login", "/register", "/logout"].includes(pathname);
    if (isAuthPage) return;

    // Check for force logout flag
    if (isLoggedOut()) {
      console.log("Detected logout flag! Redirecting to login...");
      window.location.href = "/login";
      return;
    }

    // Check for inconsistent auth state (user in store but logout flag set)
    if (user && isLoggedOut()) {
      console.log("Inconsistent auth state detected! Forcing logout...");
      window.location.href = "/logout";
      return;
    }

    // Check for dashboard access without auth
    if (!user && pathname.includes("/dashboard")) {
      console.log("Unauthorized dashboard access! Redirecting to login...");
      window.location.href = "/login";
      return;
    }
  }, [pathname, user]);

  return <>{children}</>;
};

export default LogoutStateGuard;
