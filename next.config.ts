import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    APP_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "dev",
  },
};

export default nextConfig;
