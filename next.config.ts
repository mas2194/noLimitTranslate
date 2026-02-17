import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // For Cloudflare Pages
  // images: { unoptimized: true }, // Required for static export if using Next/Image
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "sharp$": false,
      "onnxruntime-node$": false,
    }
    return config;
  },
};

export default nextConfig;
