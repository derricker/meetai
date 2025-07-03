// 导入身份验证工具
import { auth } from "@/lib/auth";
// 导入用于获取请求头信息的方法
import { headers } from "next/headers";
// 导入 redirect 方法
import { redirect } from "next/navigation";
// 导入 AgentsListHeader 组件
import { AgentsListHeader } from "@/modules/agents/ui/components/agents-list-header";

// 导入 AgentsView 相关的组件
// AgentsView 是主视图, Loading 和 Error 是其对应的加载和错误状态组件
import {
  AgentsView,
  AgentsViewError,
  AgentsViewLoading,
} from "@/modules/agents/ui/views/agents-view";
// 导入用于在服务器端获取 react-query 客户端实例和 tRPC 实例的工具函数
import { getQueryClient, trpc } from "@/trpc/server";
// 导入 react-query 的 dehydrate 和 HydrationBoundary，这是实现服务端渲染数据注水的关键
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
// 导入 React 的 Suspense 组件，用于处理异步组件的加载状态
import { Suspense } from "react";
// 导入 react-error-boundary 库，用于优雅地处理组件渲染时发生的错误
import { ErrorBoundary } from "react-error-boundary";

// 定义并导出页面组件
// 在 Next.js App Router 中, 这默认是一个服务器组件
const page = async () => {
  // 获取当前用户会话信息
  const session = await auth.api.getSession({
    headers: await headers(), // 传入请求头信息用于会话验证
  });

  // 如果没有有效会话，重定向到登录页面
  if (!session) return redirect("/sign-in");

  // 在服务器端为每个请求创建一个新的 QueryClient 实例，以确保数据隔离。
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.agents.getMany.queryOptions());

  return (
    <>
      <AgentsListHeader />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<AgentsViewLoading />}>
          <ErrorBoundary fallback={<AgentsViewError />}>
            <AgentsView />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
};

// 将页面组件作为默认导出，以便 Next.js 的路由系统能够识别和渲染这个页面。
export default page;
