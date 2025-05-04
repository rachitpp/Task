/**
 * @type {import('next').NextConfig}
 */

// eslint-disable-next-line
const withPWA = require("next-pwa");

const nextConfig = {
  // Your Next.js config options
  reactStrictMode: true,
  swcMinify: true,
};

// eslint-disable-next-line
module.exports = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
