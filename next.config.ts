import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
