import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "10.42.0.221",
        port: "9000",
        pathname: "/verlano-media/**",
      },
    ],
  },
};

export default nextConfig;
