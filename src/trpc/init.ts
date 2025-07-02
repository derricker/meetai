// 从 @trpc/server 包中导入 initTRPC 函数
// 这是创建和配置 tRPC 实例的入口点
import { initTRPC } from "@trpc/server";
// 从 react 库中导入 cache 函数
// cache 用于在服务器端渲染期间缓存函数的返回值
// 在同一个请求-响应周期内, 无论调用多少次被 cache 包装的函数
// 它都只会执行一次, 后续调用将直接返回缓存的结果
// 这有助于避免重复的数据获取或计算, 提升性能
import { cache } from "react";

// 定义并导出一个名为 createTRPCContext 的异步函数, 用于创建 tRPC 的上下文对象
// 它包含了所有 tRPC 路由和程序都可以访问的数据
// 这通常是存放数据库连接、用户身份验证信息等共享资源的地方
// 使用 cache 函数包装, 确保在单次请求处理流程中, 这个上下文创建函数只执行一次
export const createTRPCContext = cache(async () => {
  // 在这个例子中, 返回了一个包含硬编码 userId 的简单对象
  // 在实际应用中， 这里会通过解析请求头中的 cookie 或 token 来获取当前登录用户的信息
  return { userId: "user_123" };
});

// 初始化 tRPC 实例, 并将其赋值给常量 t
const t = initTRPC.create({});

// 这是 t.router 的别名
// 你将使用它来创建 API 的路由
// 例如, 你可以创建一个 userRouter 和一个 postRouter, 然后将它们合并成一个主应用路由 appRouter
export const createTRPCRouter = t.router;
// 这是 t.createCallerFactory 的别名
// 它用于在服务器端直接调用 tRPC API, 而无需通过 HTTP 请求
// 这对于在 Next.js 的 getServerSideProps 中获取数据非常有用
export const createCallerFactory = t.createCallerFactory;
// 这是 t.procedure 的别名
// 它是构建所有 API 端点的基础
// 你还可以基于它来创建更复杂的 Procedure
// 例如需要用户登录才能访问的受保护 Procedure（Protected Procedure）。
export const baseProcedure = t.procedure;
