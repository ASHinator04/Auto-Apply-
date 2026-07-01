import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@job-agent/contracts", "@job-agent/domain", "@job-agent/shared"],
};

export default nextConfig;
