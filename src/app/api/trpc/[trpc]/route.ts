// 从 @trpc/server/adapters/fetch 导入 fetchRequestHandler
// 这是一个 tRPC 适配器, 它的作用是让你的 tRPC 服务器能够理解和处理标准的 Web Fetch API 请求
// 这使得 tRPC 可以轻松地与各种现代 JavaScript 环境, 如 Next.js、Deno 等集成
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
// 从 init 文件导入的上下文创建函数
// 每次 API 请求进来时, 这个函数都会被调用来创建该请求的上下文
import { createTRPCContext } from "@/trpc/init";
// 从 _app 文件导入的主路由
// 这个路由包含了我们所有的 API 端点定义
import { appRouter } from "@/trpc/routers/_app";

// 定义了一个名为 handler 的函数, 这个函数就是 Next.js 的 API 路由处理器
// 这个函数接收一个标准的 Request 对象作为参数, 在 Next.js App Router 中, API 路由的处理器函数就是这样的形式
const handler = (req: Request) =>
  // 调用 tRPC 的 fetch 适配器, 并传入一个配置对象, 将进来的 HTTP 请求 "翻译" 成 tRPC 能够理解的格式
  fetchRequestHandler({
    // 告诉 tRPC 这个 API 端点挂载在哪个路径下
    // 这个路径需要和文件系统的路径, 例如 src/app/api/trpc/[trpc]/route.ts 相匹配
    endpoint: "/api/trpc",
    // 将 Next.js 传入的 Request 对象直接传递给 tRPC 处理器
    req,
    // 将我们定义好的主路由 appRouter 传递给处理器。
    // 当请求进来时, fetchRequestHandler 会根据请求的路径 (例如 /api/trpc/hello) 在 appRouter 中查找对应的 hello procedure 来处理
    router: appRouter,
    // 将上下文创建函数传递给处理器。
    // 在执行具体的 procedure 之前, 处理器会先调用 createTRPCContext 来生成这次请求所需的上下文, 并将其传递给 procedure。
    createContext: createTRPCContext,
  });

export { handler as GET, handler as POST };
