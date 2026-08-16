import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Seed/demo salon covers & barber avatars. Real salons will upload
      // their own coverUrl/avatarUrl (any host) once storage is wired up.
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
