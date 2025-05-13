"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useAuthStore from "@/stores/authStore";
import { AxiosError } from "axios";
import { motion } from "framer-motion";
import { clearLogoutFlag } from "@/utils/logoutHelper";
import LoginDebugHelper from "@/components/LoginDebugHelper";

// Define error type
type ApiError = AxiosError<{
  message: string;
  success: boolean;
}>;

const LoginPage = () => {
  const router = useRouter();
  const { login, user, loading, error: authError, clearError } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in - use a single effect for all auth-related redirects
  useEffect(() => {
    // Clear form errors when component mounts
    clearError();

    // Redirect if already logged in
    if (user) {
      clearLogoutFlag();
      router.push("/dashboard");
    }

    // Disable autocomplete properly
    const disableAutocomplete = () => {
      const form = document.getElementById("login-form");
      if (form) {
        form.setAttribute("autocomplete", "off");
      }
    };

    disableAutocomplete();

    // Cleanup function
    return () => {
      // Clear any errors when component unmounts
      clearError();
    };
  }, [user, router, clearError]);

  // Memoize the submit handler to prevent unnecessary re-renders
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Prevent multiple submissions
      if (isSubmitting || loading) return;

      setFormError("");
      setIsSubmitting(true);

      // Clear logout flags before attempting login
      clearLogoutFlag();
      localStorage.removeItem("FORCE_LOGOUT");
      localStorage.removeItem("logged_out");

      // Validate form
      if (!email.trim()) {
        setFormError("Email is required");
        setIsSubmitting(false);
        return;
      }

      if (!password) {
        setFormError("Password is required");
        setIsSubmitting(false);
        return;
      }

      try {
        console.log("Attempting login submission");
        // Attempt login
        await login(email.trim(), password);
        console.log("Login successful, clearing logout flag");
        clearLogoutFlag();

        // Add a small delay before redirect to ensure state is updated
        setTimeout(() => {
          console.log("Redirecting to dashboard");
          router.push("/dashboard");
        }, 100);
      } catch (err: unknown) {
        console.error("Login form error:", err);
        const apiError = err as ApiError;
        let errorMessage = "Login failed";

        if (apiError.response?.data?.message) {
          errorMessage = apiError.response.data.message;
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }

        setFormError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, password, login, router, isSubmitting, loading]
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-6 sm:px-6 sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md p-4 sm:p-6 m-auto bg-white rounded-xl shadow-md border border-gray-100"
      >
        <div className="flex justify-center mb-3 sm:mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-center">
            <span className="text-blue-600">Task</span> Management
          </h1>
        </div>

        <h2 className="text-lg sm:text-xl font-semibold text-center text-gray-800 mb-4 sm:mb-5">
          Login to your account
        </h2>

        {(authError || formError) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-4 p-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg"
          >
            {authError || formError}
          </motion.div>
        )}

        <form
          id="login-form"
          onSubmit={handleSubmit}
          className="space-y-3 sm:space-y-4"
          autoComplete="off"
        >
          <div className="mb-2 sm:mb-3">
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-medium mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Enter your email"
              required
              autoComplete="off"
              disabled={loading || isSubmitting}
            />
          </div>

          <div className="mb-3 sm:mb-4">
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-medium mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Enter your password"
              required
              autoComplete="off"
              disabled={loading || isSubmitting}
            />
          </div>

          <div className="mb-3 sm:mb-4">
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 disabled:opacity-50 transition-colors duration-200 shadow-sm"
            >
              {loading || isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </div>

          <p className="text-center text-gray-600 text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
            >
              Register
            </Link>
          </p>
        </form>
      </motion.div>
      <LoginDebugHelper />
    </div>
  );
};

export default LoginPage;
