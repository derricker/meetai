// 这是一个 Next.js App Router 的指令, 它将此文件标记为 "客户端组件"。
// 这意味着该文件中的代码 (包括其导出的组件) 可以在浏览器中运行, 并且可以拥有状态和生命周期效应。
"use client";

// 从 @tanstack/react-query 包中仅导入 QueryClient 的 TypeScript 类型。
// 这用于类型注解, 而不会将实际的类代码打包进来。
import type { QueryClient } from "@tanstack/react-query";
// 从 @tanstack/react-query 包中导入 QueryClientProvider 组件。
// 这个组件是一个 React Context Provider, 它将 QueryClient 实例提供给其下的所有子组件, 使得子组件可以访问 React Query 的功能。
import { QueryClientProvider } from "@tanstack/react-query";
// 从 @trpc/client 包中导入 createTRPCClient 和 httpBatchLink。
// createTRPCClient: 用于创建一个 tRPC 客户端实例, 该实例负责与后端 API 通信。
// httpBatchLink: 这是一个 "链接(link)", 它能将短时间内发起的多个 tRPC 请求自动合并成一个 HTTP 请求, 以减少网络开销, 提高性能。
import { createTRPCClient, httpBatchLink } from "@trpc/client";
// 从 @trpc/tanstack-react-query 包中导入 createTRPCContext。
// 这是一个工厂函数, 用于创建与 React Query 集成的 tRPC 上下文相关工具, 包括 Provider 组件和 hooks。
// 注意: 在较新版本的 tRPC 中，这通常被 `createTRPCReact` 替代, 功能类似。
import { createTRPCContext } from "@trpc/tanstack-react-query";
// 从 React 中导入 useState Hook, 用于在函数组件中管理局部状态。
import { useState } from "react";
// 从本地的 ./query-client 文件中导入我们之前创建的 makeQueryClient 工厂函数。
// 这个函数负责创建和配置 QueryClient 实例。
import { makeQueryClient } from "./query-client";
// 从本地的 ./routers/_app 文件中导入 AppRouter 的 TypeScript 类型。
// 这使得 tRPC 客户端能够了解所有可用的 API 路由、它们的输入和输出类型, 从而实现端到端的类型安全。
import type { AppRouter } from "./routers/_app";

// 调用 createTRPCContext 并传入 AppRouter 类型, 来创建一组类型安全的 tRPC React 工具。
// TRPCProvider: 一个 React Provider 组件, 用于将 tRPC 客户端实例注入到 React 组件树中。
// useTRPC: 一个自定义 Hook, 可以用来访问 tRPC 的上下文，但在现代用法中较少直接使用, 更多的是使用自动生成的具体过程 Hooks (如 useQuery, useMutation)。
export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

// 在模块作用域内声明一个变量, 用于在浏览器环境中存储 QueryClient 的单例。
let browserQueryClient: QueryClient | undefined;

// 定义一个函数, 用于获取 QueryClient 实例, 这个函数处理了服务器端和客户端的不同情况。
function getQueryClient() {
  // 检查代码是否在服务器端运行 (因为 `window` 对象只存在于浏览器中)。
  if (typeof window === "undefined") {
    // 服务器端: 每次调用都创建一个新的 QueryClient 实例。
    // 这是为了避免在多个用户请求之间共享数据和状态, 保证数据隔离。
    return makeQueryClient();
  }
  // 浏览器端: 实现单例模式。
  // 检查是否已经创建了 browserQueryClient 实例。
  if (!browserQueryClient) {
    // 如果没有，则创建一个新的实例并赋值给 browserQueryClient。
    // 这确保在整个应用的生命周期中，浏览器只使用一个 QueryClient 实例，从而共享缓存和状态。
    browserQueryClient = makeQueryClient();
  }
  // 返回在浏览器中共享的那个 QueryClient 实例。
  return browserQueryClient;
}

// 定义一个函数, 用于动态获取 tRPC API 的 URL。
function getUrl() {
  // 使用一个立即执行的匿名函数来确定基础 URL。
  const base = (() => {
    if (typeof window !== "undefined") return "";
    return process.env.NEXT_PUBLIC_APP_URL;
  })();
  // 将基础 URL 和 tRPC 的 API 端点路径拼接成完整的 URL。
  return `${base}/api/trpc`;
}

// 导出一个名为 TRPCReactProvider 的 React 组件, 它将作为整个应用的顶层提供者。
export function TRPCReactProvider(
  // 使用 Readonly 和明确的类型定义 props，确保其不可变性。
  props: Readonly<{
    children: React.ReactNode;
  }>
) {
  // 调用 getQueryClient() 获取 QueryClient 实例。在客户端, 这将始终是同一个实例。
  const queryClient = getQueryClient();
  // 使用 useState 创建 tRPC 客户端实例, 将创建逻辑放在 useState 的初始化函数中,
  // 可以确保 trpcClient 实例只在组件首次渲染时被创建一次, 避免不必要的重复创建。
  const [trpcClient] = useState(() =>
    // 调用 createTRPCClient 并传入 AppRouter 类型来创建一个类型安全的客户端。
    createTRPCClient<AppRouter>({
      // 配置 tRPC 的 "链接(links)" 数组, 请求将通过这些链接处理。
      links: [
        // 使用 httpBatchLink 来处理 HTTP 请求
        httpBatchLink({
          // 将 API 的 URL 设置为通过 getUrl() 函数动态获取的值。
          url: getUrl(),
        }),
      ],
    })
  );

  // 返回一个嵌套的 Provider 结构
  return (
    // 最外层是 React Query 的 Provider, 它将 queryClient 实例提供给应用。
    <QueryClientProvider client={queryClient}>
      {/* 内层是 tRPC 的 Provider, 它需要 queryClient 和 trpcClient 两个实例才能工作 */}
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {/* 渲染被包裹的子组件, 这些子组件现在可以访问 tRPC 和 React Query 的所有功能 */}
        {props.children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
