import React from "react";
import useAuthStore from "@/stores/authStore";

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * RoleGuard component - Only renders children if the current user has one of the allowed roles
 * @param allowedRoles - Array of roles that are allowed to see the content
 * @param children - Content to render if the user has permission
 * @param fallback - Optional content to render if the user doesn't have permission
 */
const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  fallback = null,
}) => {
  const { user } = useAuthStore();

  // If no user is logged in or user has no role, render fallback
  if (!user || !user.role) {
    return <>{fallback}</>;
  }

  // If user's role is in the allowed roles array, render children
  if (allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  // Otherwise, render fallback
  return <>{fallback}</>;
};

export default RoleGuard;
