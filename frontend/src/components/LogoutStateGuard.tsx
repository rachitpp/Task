"use client";

import { useEffect, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isLoggedOut, clearLogoutFlag } from "@/utils/logoutHelper";
import useAuthStore from "@/stores/authStore";

/**
 * This component guards against stale auth state by checking
 * logout flags and forcing a reload to the login page if needed
 */
const LogoutStateGuard = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, initialized } = useAuthStore();

  useEffect(() => {
    // Don't run this check on login, register, logout, or homepage
    const isAuthPage = ["/login", "/register", "/logout", "/"].includes(
      pathname
    );

    // Skip route protection checks for auth pages
    if (isAuthPage) {
      // Clear logout flag when on login page to enable login after logout
      if (pathname === "/login") {
        clearLogoutFlag();
      }
      return;
    }

    // Skip checks if not yet initialized to prevent premature redirects
    if (!initialized) {
      return;
    }

    // Check for force logout flag - redirect to homepage when user explicitly logs out
    const isExplicitLogout =
      localStorage.getItem("FORCE_LOGOUT") === "true" ||
      localStorage.getItem("logged_out") === "true";

    if (isExplicitLogout) {
      console.log("Detected explicit logout! Redirecting to homepage...");
      router.push("/");
      return;
    }

    // For other logout cases (session expiry, etc), redirect to login
    if (isLoggedOut() && !isExplicitLogout) {
      console.log("Detected session expiry! Redirecting to login...");
      router.push("/login");
      return;
    }

    // Check for dashboard access without auth - this runs only if NOT logged out
    if (!user && pathname.includes("/dashboard")) {
      console.log("Unauthorized dashboard access! Redirecting to login...");
      router.push("/login");
      return;
    }
  }, [pathname, user, initialized, router]);

  return <>{children}</>;
};

export default LogoutStateGuard;
