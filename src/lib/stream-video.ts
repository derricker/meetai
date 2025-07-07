// 这是一个服务器端文件, 确保此模块只在服务器端运行, 不会被打包到客户端代码中。
// 这对于保护敏感信息 (如API密钥) 非常重要。
import "server-only";

// 从 Stream Node.js SDK 导入 StreamClient 类。
// StreamClient 用于在 Node.js 环境中与 Stream API 进行交互, 例如创建会议、管理用户等。
import { StreamClient } from "@stream-io/node-sdk";

// 导出 StreamClient 的一个实例。
// 这个实例使用环境变量中配置的 API 密钥和 SECRET 密钥进行初始化。
// NEXT_PUBLIC_STREAM_VIDEO_API_KEY 是公开的 API 密钥, 通常用于客户端初始化。
// STREAM_VIDEO_SECRET_KEY 是秘密密钥, 必须严格保密, 仅在服务器端使用, 用于认证和授权。
// 感叹号 (!) 表示我们确定这些环境变量在运行时是存在的, 否则 TypeScript 会报错。
export const streamVideo = new StreamClient(
  process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY!,
  process.env.STREAM_VIDEO_SECRET_KEY!
);
