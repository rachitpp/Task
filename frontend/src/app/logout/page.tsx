"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";
import { forceLogout } from "@/utils/logoutHelper";

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useAuthStore();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // First try normal logout to notify the server
        await logout();
      } catch (error) {
        console.error("API logout failed:", error);
      } finally {
        // Always execute force logout regardless of API success
        forceLogout();
      }
    };

    // Execute logout immediately
    performLogout();
  }, [logout]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Logging out...</h1>
        <p className="text-gray-600 mb-6">
          Please wait while we log you out securely.
        </p>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  );
}
