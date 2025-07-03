// 从 @trpc/server 包中导入 initTRPC 函数
// 这是创建和配置 tRPC 实例的入口点
import { auth } from "@/lib/auth";
// 导入 tRPC 服务器的核心工具
// initTRPC 用于初始化 tRPC 实例
// TRPCError 用于处理和抛出特定于 tRPC 的错误
import { initTRPC, TRPCError } from "@trpc/server";
// 从 Next.js 导入 headers 函数, 用于在服务器端访问 HTTP 请求头
import { headers } from "next/headers";
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

// 创建一个受保护的 tRPC 过程 (Protected Procedure)
// 这是一个中间件, 用于确保只有经过身份验证的用户才能访问特定的 API 路由
// 它会在执行实际的路由处理程序之前, 检查用户的会话状态
export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  // 从请求头中获取会话信息, headers() 函数用于访问传入请求的头部
  // auth.api.getSession 是认证库提供的方法, 用于验证会话
  const session = await auth.api.getSession({
    // 必须传入请求头信息, 以便认证库可以验证和解析会话 cookie 或令牌
    headers: await headers(),
  });

  // 检查会话是否存在, 如果 session 为 null 或 undefined, 表示用户未登录或会话无效
  if (!session) {
    // 如果用户未通过身份验证, 则抛出一个 TRPCError 异常。
    // `UNAUTHORIZED` 是一个标准的 HTTP 401 错误码, 表示请求需要身份验证。
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "该请求需要身份验证",
    });
  }

  // 如果会话验证成功, 则调用 next() 函数继续执行请求处理链
  // 同时, 将获取到的会话信息 session 加到 tRPC 的上下文中
  // 这样, 后续的路由处理程序就可以通过 ctx.auth 访问到当前用户的会话信息
  return next({ ctx: { ...ctx, auth: session } });
});
