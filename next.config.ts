import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ipqwsnhygmzeljnwcysl.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/profile-picture/**',
      },
    ],
  },
};

export default nextConfig;
