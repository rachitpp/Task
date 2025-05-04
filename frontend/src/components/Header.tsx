import React from "react";
import Link from "next/link";
import AuthCheck from "@/components/AuthCheck";
import NotificationCenter from "@/components/NotificationCenter";
import Navigation from "@/components/Navigation";

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10 backdrop-blur-md bg-white/95">
      <div className="flex justify-between items-center max-w-7xl mx-auto py-3 px-3 sm:px-4 lg:px-6">
        <Link href="/dashboard">
          <h1 className="text-xl font-bold text-black hover:text-blue-700 transition-colors gradient-text">
            Task Management System
          </h1>
        </Link>
        <div className="flex items-center space-x-3">
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
