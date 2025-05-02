import React from "react";
import Header from "@/components/Header";

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div className="pt-4">{children}</div>
    </>
  );
}
