import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  reactStrictMode: true,

  // Optimize production builds
  productionBrowserSourceMaps: false,

  // Image optimization (if needed in future)
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Compression
  compress: true,

  // Experimental features for better performance
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['motion', 'lucide-react'],
  },

  // Headers for caching static assets
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
