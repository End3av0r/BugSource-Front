import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    webpack: (config) => {
        // 忽略特定的警告信息
        config.ignoreWarnings = [/Warning: \[antd: compatible\]/];
        return config;
    },
};

export default nextConfig;
