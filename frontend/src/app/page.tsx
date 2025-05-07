"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import useAuthStore from "@/stores/authStore";
import { isLoggedOut } from "@/utils/logoutHelper";

export default function Home() {
  const { user, initialized } = useAuthStore();

  // Use this to override logout check for homepage
  useEffect(() => {
    // Force check with homepage path to prevent redirection
    isLoggedOut("/");
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Simplified and clean */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            <span className="text-blue-600">Task</span> Management
          </h1>
          <nav className="flex gap-4">
            {/* Always show login/register buttons */}
            <div className="flex items-center gap-6">
              <Link
                href="/login"
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm font-medium"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-300 text-sm font-medium shadow-sm"
              >
                Register
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section - Clean and minimal */}
      <section className="pt-36 pb-28 px-6">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col lg:flex-row items-center gap-16 mb-20"
          >
            <div className="lg:w-1/2 space-y-6 mt-20">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-block text-blue-600 font-medium text-sm mb-2"
              >
                Task Management System
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight"
              >
                Focus on your work, not your workflow
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-lg text-gray-600 leading-relaxed"
              >
                Our intuitive task management system helps teams organize,
                track, and complete projects efficiently. Stay on top of
                deadlines with ease.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <Link
                  href="/register"
                  className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-300 text-center shadow-sm hover:shadow-md text-sm font-medium"
                >
                  Get Started — It&apos;s Free
                </Link>
                <Link
                  href="/login"
                  className="px-6 py-3 text-gray-600 hover:text-blue-600 rounded-full hover:bg-gray-50 border border-gray-200 transition-all duration-300 text-center text-sm font-medium"
                >
                  Learn More
                </Link>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="lg:w-1/2"
            >
              <div className="relative rounded-2xl overflow-hidden mt-16 shadow-2xl shadow-blue-100">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 z-0"></div>
                <div className="relative z-10 p-4">
                  <img
                    src="/dashboard_preview.png"
                    alt="Dashboard Preview"
                    className="w-full rounded-lg"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Modern and minimal */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium tracking-wider uppercase mb-3">
              Features
            </span>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              Everything you need, nothing you don&apos;t
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Simple yet powerful features to help your team manage tasks
              efficiently
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Task Organization",
                description:
                  "Create, organize, and prioritize tasks with an intuitive interface.",
                icon: (
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                ),
              },
              {
                title: "Progress Tracking",
                description:
                  "Monitor task progress and gain insights into project status.",
                icon: (
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                ),
              },
              {
                title: "Team Collaboration",
                description:
                  "Assign tasks and collaborate with your team in real-time.",
                icon: (
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                ),
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="flex flex-col items-start p-6 bg-white rounded-xl hover:shadow-md transition-all duration-300"
              >
                <div
                  className="p-2 mb-5 rounded-lg bg-opacity-10"
                  style={{
                    backgroundColor:
                      index === 0
                        ? "rgba(37, 99, 235, 0.1)"
                        : index === 1
                        ? "rgba(22, 163, 74, 0.1)"
                        : "rgba(147, 51, 234, 0.1)",
                  }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Simplified */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-white text-gray-800 rounded-2xl p-10 text-center relative overflow-hidden shadow-md border border-gray-100"
          >
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to streamline your workflow?
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Join teams who use our platform to manage their tasks
                efficiently.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/register"
                  className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-300 text-center font-medium text-sm shadow-sm hover:shadow-md"
                >
                  Try for Free
                </Link>
                <Link
                  href="/login"
                  className="px-6 py-3 border border-blue-200 text-blue-600 rounded-full hover:bg-blue-50 transition-all duration-300 text-center text-sm font-medium"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="py-5 px-6 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="space-y-1 md:w-1/3">
              <h3 className="text-lg font-bold text-gray-900">
                <span className="text-blue-600">Task</span> Management
              </h3>
              <p className="text-gray-600 text-xs">
                Simple tools for organizing work, focus on what matters most.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:w-2/3">
              <div>
                <h4 className="font-medium text-gray-900 mb-2 text-sm">
                  Product
                </h4>
                <ul className="space-y-1 text-xs">
                  <li>
                    <a href="#" className="text-gray-500 hover:text-blue-600">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-500 hover:text-blue-600">
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-500 hover:text-blue-600">
                      Documentation
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2 text-sm">
                  Company
                </h4>
                <ul className="space-y-1 text-xs">
                  <li>
                    <a href="#" className="text-gray-500 hover:text-blue-600">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-500 hover:text-blue-600">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-500 hover:text-blue-600">
                      Careers
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2 text-sm">
                  Legal
                </h4>
                <ul className="space-y-1 text-xs">
                  <li>
                    <a href="#" className="text-gray-500 hover:text-blue-600">
                      Privacy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-500 hover:text-blue-600">
                      Terms
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-6 pt-4 text-center text-gray-500 text-xs">
            <p>
              © {new Date().getFullYear()} Task Management. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
