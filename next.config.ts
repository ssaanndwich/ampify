/** @type {import('next').NextConfig} */
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config();

const nextConfig = {
  reactStrictMode: false, // Disable strict mode for easier debugging
  swcMinify: true,
  // Configure server actions
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
  // Load environment variables
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
};

export default nextConfig;
