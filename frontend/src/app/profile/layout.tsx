import React from "react";
import Header from "@/components/Header";

export default function ProfileLayout({
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
