"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import RoleGuard from "@/components/RoleGuard";

const AdminPage = () => {
  const router = useRouter();

  // Redirect to users management page
  useEffect(() => {
    router.push("/users");
  }, [router]);

  return (
    <RoleGuard
      allowedRoles={["admin"]}
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Access Restricted
            </h2>
            <p className="text-gray-600">
              You don&apos;t have permission to view the admin page. This
              feature is available only to administrators.
            </p>
          </div>
        </div>
      }
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <p className="text-center text-gray-600">
          Redirecting to user management...
        </p>
      </div>
    </RoleGuard>
  );
};

export default AdminPage;
