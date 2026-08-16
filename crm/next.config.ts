import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "http", hostname: "localhost", port: "4000", pathname: "/uploads/**" },
    ],
    // The API is same-machine localhost in dev — Next 16's SSRF guard blocks
    // private-IP image hosts by default, which localhost resolves to.
    ...(process.env.NODE_ENV !== "production" ? { dangerouslyAllowLocalIP: true } : {}),
  },
};

export default nextConfig;
