// 导入 'server-only' 包, 这是一个编译时检查机制, 确保此文件及其所有导出
// 绝对不会被任何客户端组件 ('use client') 导入, 否则会直接报错, 从而保证服务器端代码的安全性。
import "server-only";

// 从 tRPC 的 React Query 集成包中导入 createTRPCOptionsProxy。
// 这是一个工厂函数, 用于创建一个特殊的代理 (Proxy) 对象, 该对象可以让你在服务器端
// 以一种非常自然的方式 (类似客户端的 useQuery) 来调用 tRPC 过程并预取数据。
// 注意: 这是一种较旧或替代的 RSC 集成模式, 在最新的 tRPC 版本中, 更推荐使用 createHydrationHelpers。
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";

// 从 React 中导入 `cache` 函数。
// 它用于在单次服务器请求的渲染周期内缓存函数的结果, 确保在同一次请求中，
// 多次调用同一个被缓存的函数时, 只执行一次实际的逻辑, 后续调用直接返回缓存结果。
import { cache } from "react";

// 从本地的 `./init.ts` 文件导入 `createTRPCContext` 函数,
// 该函数用于创建 tRPC 请求的上下文, 通常包含请求头、数据库连接或用户信息等。
import { createTRPCContext } from "./init";

// 从本地的 `./query-client.ts` 文件导入 `makeQueryClient` 工厂函数，
// 该函数用于创建一个新的 React Query 客户端实例。
import { makeQueryClient } from "./query-client";

// 从本地的 `./routers/_app.ts` 文件导入 `appRouter`，
// 这是你的 tRPC 应用的根路由, 定义了所有的 API 过程。
import { appRouter } from "./routers/_app";

// 使用 React 的 cache 函数包装 makeQueryClient, 并导出一个名为 getQueryClient 的新函数。
// 这确保在同一次服务器渲染请求中, 无论 getQueryClient 被调用多少次，都将返回同一个 QueryClient 实例，
// 实现了请求级别的缓存共享。
export const getQueryClient = cache(makeQueryClient);

// 创建并导出 trpc 代理对象, 这是本文件的核心。
export const trpc = createTRPCOptionsProxy({
  // ctx: 指定创建 tRPC 上下文的函数, 当在服务器上调用 API 时, 会使用此函数生成上下文。
  ctx: createTRPCContext,
  // router: 指定 tRPC 的根路由, 代理对象将根据此路由的结构来生成类型安全的调用路径。
  router: appRouter,
  // queryClient: 指定获取 QueryClient 实例的函数, 当通过此代理预取数据时,
  // 获取到的数据会自动存入由 getQueryClient 提供的 QueryClient 实例中。
  queryClient: getQueryClient,
});

// 创建并导出一个能在服务器端直接、类型安全地调用你的 tRPC API 过程 (procedures) 的函数 (caller)
export const caller = appRouter.createCaller(createTRPCContext);
