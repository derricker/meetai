import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    // 警告: 生产构建将忽略所有类型错误
    ignoreBuildErrors: true, // 强制构建通过, 无论类型是否错误
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/meetings",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
