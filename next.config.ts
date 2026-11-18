import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Static export for Cloudflare Pages (direct upload). The /api/download
  // endpoint is NOT served by Next.js anymore — it is served by the
  // Cloudflare Pages Advanced-Mode worker in public/_worker.js, which
  // proxies extraction to the third-party downr.org service.
  output: 'export',
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
