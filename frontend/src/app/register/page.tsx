"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useAuthStore from "@/stores/authStore";
import { AxiosError } from "axios";
import { motion } from "framer-motion";
import { clearLogoutFlag } from "@/utils/logoutHelper";

// Define error type
type ApiError = AxiosError<{
  message: string;
  success: boolean;
}>;

const RegisterPage = () => {
  const router = useRouter();
  const {
    register,
    error: authError,
    clearError,
    user,
    loading,
  } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [registrationComplete, setRegistrationComplete] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  // Handle redirect after successful registration
  useEffect(() => {
    if (registrationComplete && user) {
      router.push("/dashboard");
    }
  }, [registrationComplete, user, router]);

  // Clear any existing errors when the component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Clear form fields on component mount and prevent autocomplete
  useEffect(() => {
    // Reset form fields
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");

    // Add form attributes to prevent browser autocomplete
    const form = document.getElementById("register-form");
    if (form) {
      form.setAttribute("autocomplete", "off");
      form.setAttribute("data-form-type", "register");
    }

    // Clear browser autocomplete cache on inputs
    const inputs = ["name", "email", "password", "confirm-password"];
    inputs.forEach((id) => {
      const input = document.getElementById(id) as HTMLInputElement;
      if (input) {
        input.setAttribute("autocomplete", "new-password");
        input.value = "";
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name || !email || !password || !confirmPassword) {
      setFormError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setFormError("Password must be at least 8 characters long");
      return;
    }

    if (!/\d/.test(password) || !/[A-Z]/.test(password)) {
      setFormError(
        "Password must contain at least one number and one uppercase letter"
      );
      return;
    }

    try {
      await register(name, email, password);

      // Ensure all logout flags are cleared
      clearLogoutFlag();

      // Mark registration as complete to trigger redirect
      setRegistrationComplete(true);

      // Force immediate redirect to dashboard
      router.push("/dashboard");
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setFormError(apiError.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-6 bg-white p-6 rounded-xl shadow-md border border-gray-100"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            <span className="text-blue-600">Task</span> Management
          </h1>
          <h2 className="mt-4 text-xl font-semibold text-gray-800">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200"
            >
              sign in to your account
            </Link>
          </p>
        </div>

        {(authError || formError) && (
          <div className="p-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
            {authError || formError}
          </div>
        )}

        <form
          id="register-form"
          className="space-y-4"
          onSubmit={handleSubmit}
          autoComplete="off"
          data-form-type="register"
        >
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="new-password"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-2 bg-gray-50 border border-gray-200 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="new-password"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-2 bg-gray-50 border border-gray-200 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-2 bg-gray-50 border border-gray-200 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm Password
            </label>
            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-2 bg-gray-50 border border-gray-200 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
            >
              {loading ? (
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
                  Creating Account...
                </div>
              ) : (
                "Register"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
