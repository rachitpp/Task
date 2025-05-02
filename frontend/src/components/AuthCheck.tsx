"use client";

import React from "react";
import useAuthStore from "@/stores/authStore";

interface AuthCheckProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * AuthCheck component - Only renders children if a user is authenticated
 * @param children - Content to render if the user is authenticated
 * @param fallback - Optional content to render if the user isn't authenticated
 */
const AuthCheck: React.FC<AuthCheckProps> = ({ children, fallback = null }) => {
  const { user } = useAuthStore();

  if (!user) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default AuthCheck;
