// 导入 React 的 Suspense 组件, 用于代码分割和懒加载时的加载状态处理
import { Suspense } from "react";
// 导入 react-error-boundary 库中的 ErrorBoundary 组件, 用于捕获并处理子组件树中的 JavaScript 错误
import { ErrorBoundary } from "react-error-boundary";
// 导入 @tanstack/react-query 的 HydrationBoundary 和 dehydrate, 用于在服务器端渲染和客户端之间传递和恢复查询状态
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

// 导入 tRPC 的服务器端辅助函数和客户端实例
import { getQueryClient, trpc } from "@/trpc/server";
// 导入特定于 agent ID 视图的组件, 包括主视图、错误视图和加载视图
import {
  AgentIdView,
  AgentIdViewError,
  AgentIdViewLoading,
} from "@/modules/agents/ui/views/agent-id-view";

// 定义组件的 Props 接口
interface Props {
  // params 是一个 Promise, 它解析为一个包含 agentId 字符串的对象
  // 这在 Next.js 的 App Router 中是异步页面的典型模式
  params: Promise<{ agentId: string }>;
}

// 定义页面组件, 它是一个异步函数组件
const Page = async ({ params }: Props) => {
  // 等待 params Promise 解析并解构出 agentId
  const { agentId } = await params;

  // 获取 tRPC 的查询客户端实例, 用于在服务器端进行数据预取
  const queryClient = getQueryClient();
  // 在服务器端预取单个 agent 的数据, 这会将数据加载到查询缓存中
  // `void` 用于表示我们触发这个异步操作, 但不需要等待它完成
  void queryClient.prefetchQuery(
    trpc.agents.getOne.queryOptions({ id: agentId })
  );

  // 返回 JSX
  return (
    // HydrationBoundary 用于将服务器端预取的数据传递给客户端, 以便 React Query 可以在客户端恢复这些状态, 避免重新获取数据
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* Suspense 用于在 AgentIdView 组件加载时显示一个后备 UI */}
      <Suspense fallback={<AgentIdViewLoading />}>
        {/* ErrorBoundary 用于捕获 AgentIdView 组件在渲染过程中可能抛出的任何错误, 并显示一个后备 UI */}
        <ErrorBoundary fallback={<AgentIdViewError />}>
          {/* 渲染主视图组件, 并传入 agentId */}
          <AgentIdView agentId={agentId} />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

// 导出页面组件作为默认导出
export default Page;
