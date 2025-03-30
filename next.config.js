const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    'react-native',
    'expo',
    '@expo/vector-icons',
    'react-native-svg',
    'react-native-web',
    '@react-navigation/native',
    '@react-navigation/native-stack',
    'react-native-safe-area-context',
    'react-native-screens',
    'react-native-reanimated',
    '@react-native-async-storage/async-storage',
    '@react-native/assets-registry',
    'expo-modules-core',
    'expo-asset',
    'expo-font',
    'expo-image-picker',
    'react-native-qrcode-svg',
    'expo-screen-orientation',
    'expo-camera',
    'expo-barcode-scanner'
  ],
  experimental: {
    esmExternals: 'loose'
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'react-native$': 'react-native-web',
    };

    config.resolve.extensions = [
      '.web.js',
      '.web.jsx',
      '.web.ts',
      '.web.tsx',
      ...config.resolve.extensions,
    ];

    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[name].[hash][ext]',
      },
    });

    // Add support for native modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'fs': false,
      'net': false,
      'tls': false,
    };

    return config;
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline';
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net;
              img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in;
              font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net/npm/@expo/vector-icons@* data:;
              connect-src 'self' https://*.supabase.co https://*.supabase.in https://fonts.googleapis.com https://fonts.gstatic.com https://generativelanguage.googleapis.com https://cdn.jsdelivr.net;
              media-src 'self' blob:;
              frame-src 'self';
              worker-src 'self' blob:;
            `.replace(/\s{2,}/g, ' ').trim(),
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig); 