// 从 'inngest/next' 导入 'serve' 函数, 用于在 Next.js 应用中创建 Inngest 的 API 路由处理器
import { serve } from "inngest/next";

// 导入在 @/inngest/client.ts 文件中创建的 inngest 客户端实例
import { inngest } from "@/inngest/client";
// 导入在 @/inngest/functions.ts 文件中定义的 meetingsProcessing 函数
import { meetingsProcessing } from "@/inngest/functions";

// 使用 serve 函数创建并导出 Next.js 的 API 路由处理器
// 这个处理器会将 Inngest 服务连接到你的应用。
export const { GET, POST, PUT } = serve({
  // 指定要使用的 Inngest 客户端
  client: inngest,
  // 列出此 API 端点要提供的所有 Inngest 函数
  // 这样 Inngest 就可以调用这些函数来处理事件
  functions: [meetingsProcessing],
});
