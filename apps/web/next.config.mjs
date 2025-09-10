/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Build optimizations
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },
  
  // Output configuration for Docker
  output: 'standalone',
  
  // Experimental features
  experimental: {
    typedRoutes: true,
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  
  // Image optimization
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Bundle analyzer (only in development)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
          })
        );
      }
      return config;
    },
  }),
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/docs',
        destination: '/library',
        permanent: true,
      },
    ];
  },
  
  // Environment variables to expose to client
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
