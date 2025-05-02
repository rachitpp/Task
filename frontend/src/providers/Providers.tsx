"use client";

import React from "react";
import { SocketProvider } from "@/providers/SocketProviders";

/**
 * Providers component - Wraps all global providers to avoid nesting hell
 */
export const Providers = ({ children }: { children: React.ReactNode }) => {
  return <SocketProvider>{children}</SocketProvider>;
};
