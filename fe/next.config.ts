import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  poweredByHeader: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },


  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/dashboard',
        destination: '/dashboard/items',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
