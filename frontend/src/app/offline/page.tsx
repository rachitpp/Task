"use client";

import React from "react";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-yellow-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-yellow-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          You&apos;re offline
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          It looks like you&apos;ve lost your internet connection. Some features
          may be unavailable until you&apos;re back online.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Available offline features:
              </h3>
              <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
                <li>View cached tasks</li>
                <li>Create new tasks (will sync when online)</li>
                <li>Update existing tasks (will sync when online)</li>
                <li>View notifications</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Limited functionality:
              </h3>
              <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
                <li>Real-time updates</li>
                <li>Task assignment</li>
                <li>Analytics dashboard</li>
              </ul>
            </div>

            <div className="flex flex-col space-y-3">
              <Link
                href="/dashboard"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Dashboard
              </Link>

              <button
                onClick={() => window.location.reload()}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="inline-flex items-center text-sm text-gray-500">
            <span
              id="connection-status"
              className="h-2 w-2 rounded-full bg-red-500 mr-2"
            ></span>
            <span id="connection-text">Currently offline</span>
          </div>
        </div>
      </div>

      {/* Client-side script to check connection status */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            function updateConnectionStatus() {
              const statusIndicator = document.getElementById('connection-status');
              const statusText = document.getElementById('connection-text');
              
              if (navigator.onLine) {
                statusIndicator.classList.remove('bg-red-500');
                statusIndicator.classList.add('bg-green-500');
                statusText.textContent = 'Connection restored';
              } else {
                statusIndicator.classList.remove('bg-green-500');
                statusIndicator.classList.add('bg-red-500');
                statusText.textContent = 'Currently offline';
              }
            }
            
            window.addEventListener('online', updateConnectionStatus);
            window.addEventListener('offline', updateConnectionStatus);
            updateConnectionStatus();
          `,
        }}
      />
    </div>
  );
}
