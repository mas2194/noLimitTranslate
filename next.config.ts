import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // For Cloudflare Pages
  // images: { unoptimized: true }, // Required for static export if using Next/Image
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "sharp$": false,
      "onnxruntime-node$": false,
    }

    // Exclude the 25.9MB asyncify WASM file from the output bundle
    // Cloudflare Pages has a 25MB limit on individual assets.
    config.module.rules.push({
      test: /ort-wasm-simd-threaded\.asyncify\.wasm$/,
      type: "asset/resource",
      generator: {
        emit: false,
      },
    });

    return config;
  },
};

export default nextConfig;
