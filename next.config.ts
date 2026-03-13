import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "10.42.0.221",
        port: "9000",
        pathname: "/verlano-media/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "9000",
        pathname: "/verlano-media/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/verlano-media/**",
      },
      {
        protocol: "https",
        hostname: "10.42.0.221",
        port: "9000",
        pathname: "/verlano-media/**",
      },
      {
        protocol: "https",
        hostname: "127.0.0.1",
        port: "9000",
        pathname: "/verlano-media/**",
      },
      {
        protocol: "https",
        hostname: "localhost",
        port: "9000",
        pathname: "/verlano-media/**",
      },
    ],
  },
};

export default nextConfig;
