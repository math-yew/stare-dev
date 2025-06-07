import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  // trailingSlash: true,
  // skipTrailingSlashRedirect: true,
  assetPrefix: '/'
};

export default nextConfig;