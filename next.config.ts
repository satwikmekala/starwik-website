import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/frequencies", destination: "/music", permanent: true },
    ];
  },
};

export default nextConfig;
