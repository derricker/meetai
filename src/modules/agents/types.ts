// 从 @trpc/server 导入 inferRouterOutputs 工具
// 这个工具用于从 tRPC 路由器的定义中推断出其输出类型
// 从而在客户端代码中实现完全的类型安全, 无需手动定义返回类型
import { inferRouterOutputs } from "@trpc/server";

// 导入 AppRouter 类型, 这是整个 tRPC 应用程序的根路由器定义
// 通过这个类型, 我们可以访问到所有已定义的 tRPC 路由和过程
import type { AppRouter } from "@/trpc/routers/_app";

// 定义并导出 AgentGetOne 类型
// 这个类型是通过 inferRouterOutputs 推断出来的, 具体指向 AppRouter 中 'agents' 路由下的 'getOne' 过程的输出类型
// 这样做的好处是, 如果 'getOne' 过程的返回值发生变化, AgentGetOne 类型也会自动更新
// 从而在编译时就能捕捉到类型不匹配的错误
export type AgentGetOne = inferRouterOutputs<AppRouter>["agents"]["getOne"];
