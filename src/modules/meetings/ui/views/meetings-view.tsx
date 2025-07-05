// "use client" 指令将此组件标记为客户端组件, 这意味着它将在浏览器中渲染和执行。
"use client";

// 导入自定义的错误状态组件, 用于在发生错误时显示统一的错误界面。
import { ErrorState } from "@/components/error-state";
// 导入自定义的加载状态组件, 用于在数据加载时显示统一的加载指示器。
import { LoadingState } from "@/components/loading-state";
// 导入 tRPC 的客户端钩子, 用于在客户端组件中进行类型安全的 API 调用。
import { useTRPC } from "@/trpc/client";
// 从 @tanstack/react-query 导入 useSuspenseQuery 钩子, 它与 React Suspense 集成, 用于数据获取。
import { useSuspenseQuery } from "@tanstack/react-query";

/**
 * MeetingsView 组件
 * 该组件负责获取并显示会议列表。
 * 它使用了 useSuspenseQuery 来处理数据加载, 并依赖于父组件中的 <Suspense> 和 <ErrorBoundary> 来处理加载和错误状态。
 */
export const MeetingsView = () => {
  // 初始化 tRPC 客户端实例。
  const trpc = useTRPC();
  // 使用 useSuspenseQuery 从 tRPC 的 meetings.getMany 端点获取数据。
  // 这个钩子会自动处理加载状态, 在数据准备好之前, 父组件的 Suspense fallback 将被显示。
  const { data } = useSuspenseQuery(trpc.meetings.getMany.queryOptions({}));
  // 渲染获取到的数据，这里临时使用 JSON.stringify 进行展示。
  return <div>{JSON.stringify(data)}</div>;
};

/**
 * MeetingsViewLoading 组件
 * 这是一个后备组件, 当 MeetingsView 正在加载数据时, 由 <Suspense> 组件显示。
 */
export const MeetingsViewLoading = () => {
  return <LoadingState title="加载会议中" description="这可能需要点时间" />;
};

/**
 * MeetingsViewError 组件
 * 这是一个错误边界后备组件, 当 MeetingsView 或其子组件抛出错误, 由 <ErrorBoundary> 组件显示。
 */
export const MeetingsViewError = () => {
  return <ErrorState title="会议加载失败" description="发生了错误" />;
};
