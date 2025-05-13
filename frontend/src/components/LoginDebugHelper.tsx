import React, { useState, useEffect } from "react";
import { authApi } from "@/services/api";

interface AuthDebugInfo {
  hasToken: boolean;
  isLoggedOut: boolean;
  recentlyLoggedOut: boolean;
  apiUrl: string;
  apiStatus: "checking" | "available" | "unavailable";
}

const LoginDebugHelper: React.FC = () => {
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<AuthDebugInfo>({
    hasToken: false,
    isLoggedOut: false,
    recentlyLoggedOut: false,
    apiUrl: "",
    apiStatus: "checking",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasToken = !!localStorage.getItem("authToken");
      const isLoggedOut = localStorage.getItem("logged_out") === "true";
      const recentlyLoggedOut = !!localStorage.getItem("last_logout_timestamp");
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://task2-backend-uptm.onrender.com/api";

      setDebugInfo((prev) => ({
        ...prev,
        hasToken,
        isLoggedOut,
        recentlyLoggedOut,
        apiUrl,
      }));

      // Check API availability using the health check function
      authApi
        .checkHealth()
        .then((result) => {
          setDebugInfo((prev) => ({
            ...prev,
            apiStatus:
              result.status === "available" ? "available" : "unavailable",
          }));
        })
        .catch(() => {
          setDebugInfo((prev) => ({ ...prev, apiStatus: "unavailable" }));
        });
    }
  }, []);

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-2 right-2 bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded opacity-50 hover:opacity-100"
      >
        Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-2 right-2 bg-white border border-gray-300 p-3 rounded shadow-lg text-xs z-50">
      <div className="flex justify-between mb-2">
        <h4 className="font-bold">Login Debug Info</h4>
        <button
          onClick={() => setShowDebug(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      <div className="space-y-1">
        <div>
          <span className="font-semibold">Auth Token:</span>
          <span
            className={debugInfo.hasToken ? "text-green-600" : "text-red-600"}
          >
            {debugInfo.hasToken ? "Present" : "Missing"}
          </span>
        </div>
        <div>
          <span className="font-semibold">Logged Out Flag:</span>
          <span
            className={
              !debugInfo.isLoggedOut ? "text-green-600" : "text-red-600"
            }
          >
            {debugInfo.isLoggedOut ? "Yes" : "No"}
          </span>
        </div>
        <div>
          <span className="font-semibold">Recently Logged Out:</span>
          <span
            className={
              !debugInfo.recentlyLoggedOut ? "text-green-600" : "text-red-600"
            }
          >
            {debugInfo.recentlyLoggedOut ? "Yes" : "No"}
          </span>
        </div>
        <div>
          <span className="font-semibold">API URL:</span>
          <span className="text-blue-600 break-all">{debugInfo.apiUrl}</span>
        </div>
        <div>
          <span className="font-semibold">API Status:</span>
          <span
            className={
              debugInfo.apiStatus === "available"
                ? "text-green-600"
                : debugInfo.apiStatus === "checking"
                ? "text-yellow-600"
                : "text-red-600"
            }
          >
            {debugInfo.apiStatus}
          </span>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-gray-200">
        <button
          onClick={() => {
            localStorage.removeItem("authToken");
            localStorage.removeItem("logged_out");
            localStorage.removeItem("last_logout_timestamp");
            window.location.reload();
          }}
          className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs hover:bg-red-200"
        >
          Clear Auth Data
        </button>
      </div>
    </div>
  );
};

export default LoginDebugHelper;
