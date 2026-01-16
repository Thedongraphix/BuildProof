import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ]
  },

  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')

    // Ignore warnings for optional dependencies
    config.ignoreWarnings = [
      { module: /node_modules\/pino\/lib\/tools\.js/ },
      { module: /node_modules\/@metamask\/sdk\/dist\/browser\/es\/metamask-sdk\.js/ }
    ]

    // Add alias for external directories
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/config': './config',
      '@/context': './context',
    }

    return config
  },
};

export default nextConfig;
