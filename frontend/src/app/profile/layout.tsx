import React from "react";
import AppLayout from "@/components/layout/AppLayout";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayout>
      <div className="text-black">{children}</div>
    </AppLayout>
  );
}
