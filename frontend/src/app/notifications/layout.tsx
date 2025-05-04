import React from "react";
import AppLayout from "@/components/layout/AppLayout";

export const metadata = {
  title: "Notifications | Task Management System",
  description: "View and manage your notifications",
};

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
