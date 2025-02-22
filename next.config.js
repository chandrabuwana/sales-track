/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals = [...config.externals, "bcryptjs"];
    return config;
  },
};

module.exports = nextConfig;
