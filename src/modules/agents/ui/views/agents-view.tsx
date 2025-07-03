// "use client" 指令是 React 的一个约定, 它声明这个文件中的组件是客户端组件。
// 客户端组件可以在浏览器中渲染, 并且可以使用 React 的状态 (useState)、生命周期 (useEffect) 和浏览器特有的 API。
"use client";

// 导入错误状态组件, 这个组件将在数据获取失败时显示, 为用户提供清晰的错误反馈。
import { ErrorState } from "@/components/error-state";
// 导入加载状态组件, 这个组件将在数据正在加载时显示, 作为 Suspense 的 fallback UI。
import { LoadingState } from "@/components/loading-state";
// 导入 tRPC 的客户端钩子, 这个钩子让我们能够在客户端组件中方便地调用后端的 tRPC procedure。
import { useTRPC } from "@/trpc/client";
// 导入 @tanstack/react-query 的 useSuspenseQuery 钩子。
// 这是 useQuery 的一个变体，它专门设计用来与 React Suspense 和 ErrorBoundary 集成。
import { useSuspenseQuery } from "@tanstack/react-query";

// 定义并导出 AgentsView 组件。这是显示智能体列表的核心界面。
export const AgentsView = () => {
  // 调用 useTRPC 钩子, 获取一个 tRPC 客户端实例, 该实例已经配置好了与后端通信所需的一切。
  const trpc = useTRPC();

  // 使用 useSuspenseQuery 钩子来获取数据。
  // 这个钩子与 useQuery 的主要区别在于它处理加载和错误状态的方式:
  // 1. 在数据加载时, 它会"暂停"组件的渲染, 让最近的 <Suspense> 组件显示其 fallback UI。
  // 2. 如果查询出错, 它会抛出一个错误, 这个错误可以被最近的 <ErrorBoundary> 组件捕获。
  // 3. 成功后，它返回的 `data` 字段是确切有值的, 因此我们无需检查其是否存在。
  // `trpc.agents.getMany.queryOptions()` 创建了一个可重用的查询配置对象, 包含了查询键和查询函数。
  const { data } = useSuspenseQuery(trpc.agents.getMany.queryOptions());

  // 当数据成功加载后, 组件会恢复渲染。
  // 这里我们将获取到的 data 对象序列化成一个格式化的 JSON 字符串并显示在 div 中, 用于调试和展示。
  // JSON.stringify(data, null, 2) 中的 null 和 2 参数用于美化输出, 使其更易读。
  return <div>{JSON.stringify(data, null, 2)}</div>;
};

// 定义并导出 AgentsViewLoading 组件。
// 这是一个简单的函数组件, 它返回一个 LoadingState 组件实例。
// 这个组件将被用作 <Suspense> 的 fallback 属性, 在 AgentsView 数据加载时显示。
export const AgentsViewLoading = () => {
  return <LoadingState title="正在加载智能体" description="这可能需要点时间" />;
};

// 定义并导出 AgentsViewError 组件。
// 这是一个简单的函数组件, 它返回一个 ErrorState 组件实例。
// 这个组件将被用作 <ErrorBoundary> 的 `fallback` 属性, 在 AgentsView 渲染出错时显示。
export const AgentsViewError = () => {
  return <ErrorState title="加载智能体失败" description="请稍后重试" />;
};
