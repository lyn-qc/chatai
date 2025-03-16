import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // experimental: {
  //   isr: {
  //     initialRevalidateSeconds: 60,
  //     bypassToken: process.env.ISR_TOKEN
  //   }
  // },
  eslint: {
    // 在构建过程中忽略ESLint错误
    ignoreDuringBuilds: true,
  },
  // (14) 多CDN配置
  images: {
    domains: [
      'cdn1.yourdomain.com',
      'cdn2.backupdomain.com'
    ],
    minimumCacheTTL: 3600
  }
};

export default nextConfig;
