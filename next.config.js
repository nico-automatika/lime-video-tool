/** @type {import('next').NextConfig} */
const nextConfig = {
  // Usar webpack explícitamente (Turbopack es el default en Next.js 16)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  // Configuración de Turbopack como fallback
  turbopack: {},
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

module.exports = nextConfig;

