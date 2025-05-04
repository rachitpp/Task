// Declaration file for next-pwa
declare module "next-pwa" {
  import { NextConfig } from "next";

  export function withPWA(config?: {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    scope?: string;
    sw?: string;
    skipWaiting?: boolean;
    [key: string]: unknown;
  }): (nextConfig: NextConfig) => NextConfig;
}
