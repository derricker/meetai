// createTRPCRouter: 这是用于创建路由的函数
import { meetingsRouter } from "@/modules/meetings/server/procedures";
import { createTRPCRouter } from "../init";
import { agentsRouter } from "@/modules/agents/server/procedures";
import { premiumRouter } from "@/modules/premium/server/procedures";

// 使用 createTRPCRouter 函数创建一个名为 appRouter 的 tRPC 路由并导出它
// 这个路由对象是你的 API 的集合, 它将包含你定义的所有端点
// 你可以把 appRouter 想象成你整个后端 API 的根节点
export const appRouter = createTRPCRouter({
  agents: agentsRouter,
  meetings: meetingsRouter,
  premium: premiumRouter,
});

// 这是 tRPC 实现端到端类型安全的关键魔法之一
// 它使用 TypeScript 的 typeof 操作符来从我们刚刚创建的 appRouter 值中推断出它的类型, 并将其导出为 AppRouter 类型
// 这个 AppRouter 类型并不会包含 appRouter 的任何实现细节 (即业务逻辑), 它只包含了整个 API 的 "形状" 或 "骨架"
// 即所有路由的名称、它们的输入类型和输出类型。然后, 你可以在你的前端项目中导入这个 AppRouter 类型
// tRPC 的客户端库会利用它来为你提供完全类型安全的 API 调用体验, 包括自动完成和编译时错误检查
export type AppRouter = typeof appRouter;
