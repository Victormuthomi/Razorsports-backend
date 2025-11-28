import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/", // root URL
        destination: "/api/health", // forward to your API route
      },
    ];
  },
};

export default nextConfig;
