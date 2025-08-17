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
    ppr: true,
    clientSegmentCache: true,
    nodeMiddleware: true,
    serverActions: {
      bodySizeLimit: "200mb",
    },
  },
};

export default nextConfig;
