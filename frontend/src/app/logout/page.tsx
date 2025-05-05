"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";

export default function LogoutPage() {
  const router = useRouter();
  const { logout, user } = useAuthStore();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Use the logout method from the auth store - it now handles everything
        await logout();

        // We should never reach here if logout works correctly (it should redirect)
        // but just in case, add a fallback redirect
        router.push("/login");
      } catch (error) {
        console.error("Logout failed:", error);

        // Redirect to login even if logout fails
        router.push("/login");
      }
    };

    // Only perform logout if user is actually logged in
    if (user) {
      performLogout();
    } else {
      // If no user is logged in, redirect to login
      router.push("/login");
    }
  }, [logout, router, user]);

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
