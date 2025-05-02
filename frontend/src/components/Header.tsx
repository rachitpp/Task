import React from "react";
import Link from "next/link";
import AuthCheck from "@/components/AuthCheck";
import NotificationCenter from "@/components/NotificationCenter";
import Navigation from "@/components/Navigation";

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm pt-2 sticky top-0 z-10 backdrop-blur-md bg-white/95">
      <div className="flex justify-between items-center max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard">
          <h1 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors gradient-text">
            Task Management System
          </h1>
        </Link>
        <div className="flex items-center space-x-4">
          <AuthCheck>
            <NotificationCenter />
          </AuthCheck>
          <Navigation />
        </div>
      </div>
    </header>
  );
};

export default Header;
