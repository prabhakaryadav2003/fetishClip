import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  experimental: {
    clientSegmentCache: true,
    serverActions: {
      bodySizeLimit: "200mb",
    },
  },
};

export default nextConfig;
