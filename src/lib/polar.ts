// 导入 Polar SDK 中的 Polar 类
// Polar 是一个开源的支付和会员管理平台
import { Polar } from "@polar-sh/sdk";

// 创建并导出 Polar 客户端实例
// accessToken: 用于认证的访问令牌，从环境变量中获取
// server: 设置为 sandbox 表示使用测试环境，用于开发和测试
export const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: "sandbox",
});
