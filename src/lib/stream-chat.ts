// 这是一个服务器端文件, 确保此代码只在服务器端运行, 不会被打包到客户端
import "server-only";

// 从 stream-chat 库导入 StreamChat 类, 用于与 Stream Chat API 交互
import { StreamChat } from "stream-chat";

// 初始化 StreamChat 客户端实例
// StreamChat.getInstance 方法用于获取一个单例的 StreamChat 客户端
// 第一个参数是 Stream Chat 应用的 API Key, 通常用于客户端
// 第二个参数是 Stream Chat 应用的 Secret Key, 这是一个敏感信息，只应在服务器端使用
// 这里的 '!' 是 TypeScript 的非空断言操作符, 表示我们确定这些环境变量在运行时是存在的。
export const streamChat = StreamChat.getInstance(
  process.env.NEXT_PUBLIC_STREAM_CHAT_API_KEY!,
  process.env.STREAM_CHAT_SECRET_KEY!
);
