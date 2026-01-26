import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable React StrictMode to prevent Leaflet map double-initialization in development
  reactStrictMode: false,
};

export default nextConfig;
