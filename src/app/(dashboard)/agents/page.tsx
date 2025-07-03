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
// 在 Next.js App Router 中，这默认是一个服务器组件
const page = () => {
  // 在服务器端为每个请求创建一个新的 QueryClient 实例，以确保数据隔离。
  const queryClient = getQueryClient();

  // 在服务器端预取 'agents.getMany' 的数据。
  // 'prefetchQuery' 会在服务器上触发 API 调用, 并将结果缓存到 queryClient 中
  // 这样, 当页面在浏览器中 "注水" 时, 数据已经就绪, 无需客户端再次请求, 从而实现快速加载。
  // 使用 'void' 运算符表示我们 "即发即忘", 不关心这个 Promise 的结果, 以避免 linter 报出未处理 Promise 的警告
  void queryClient.prefetchQuery(trpc.agents.getMany.queryOptions());

  // 返回页面的 JSX 结构
  return (
    // HydrationBoundary 是 react-query 的核心组件之一, 用于将服务端缓存的数据传递给客户端
    // 'state' prop 接收一个经过 'dehydrate' 函数处理过的 queryClient 状态
    // 'dehydrate' 会将 queryClient 中的缓存数据序列化, 使其可以安全地嵌入到 HTML 中发送给浏览器
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* 
        Suspense 用于声明式地处理加载状态。
        当其内部的组件 (这里是 AgentsView) 正在进行异步操作 (如代码分割加载、数据获取) 时,
        它会显示 fallback 中指定的组件 (AgentsViewLoading)
      */}
      <Suspense fallback={<AgentsViewLoading />}>
        {/*
          ErrorBoundary 用于捕获其子组件树中发生的 JavaScript 错误
          如果 AgentsView 或其子组件在渲染时抛出错误, ErrorBoundary 会捕获它
          并渲染 fallback 中指定的组件 (AgentsViewError), 防止整个应用崩溃
        */}
        <ErrorBoundary fallback={<AgentsViewError />}>
          {/* 
            AgentsView 是一个客户端组件("use client"), 它内部使用 useQuery 来获取数据
            由于我们在服务器端预取了数据并通过 HydrationBoundary 进行了注水,
            客户端的 useQuery 会立即从缓存中读取到数据, 用户不会看到加载状态, 实现了无缝的 SSR 体验
          */}
          <AgentsView />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

// 将页面组件作为默认导出，以便 Next.js 的路由系统能够识别和渲染这个页面。
export default page;

// 流式服务器端渲染
// 1. 服务器发送初始 HTML "壳": 当用户请求这个页面时, Next.js 服务器并不会等到所有数据都获取完毕再发送完整的 HTML。相反, 它会立刻开始"流式"地发送一个初始的 HTML 文档。这个文档包含了页面的基本布局和 Suspense 指定的 fallback UI (也就是 <AgentsViewLoading /> )。
// 2. 用户立即看到反馈: 浏览器接收到这个初始的 HTML 后, 会立即渲染它。这样, 用户几乎可以瞬间看到一个加载中的界面, 而不是一个白屏, 极大地提升了用户的感知性能。
// 3. 服务器在后台继续工作: 在发送初始 HTML 的同时, 服务器组件 page.tsx 会在后台执行它的任务, 即调用 queryClient.prefetchQuery 来获取 agents 数据。
// 4. 数据和组件代码随流发送:一旦数据获取完成, 服务器会：
// 4.1 使用 dehydrate 函数将获取到的数据序列化。
// 4.2 将序列化的数据和客户端组件 <AgentsView /> 的 JavaScript 代码一起, 作为后续的 HTML 流发送给浏览器。
// 5. 客户端进行注水: 浏览器接收到所有数据和代码后, React 开始在客户端进行"注水"操作：

// 5.1 HydrationBoundary 组件会读取序列化后的数据, 并将其"注入"到客户端的 queryClient 缓存中。
// 5.2 Suspense 会等待其子组件 <AgentsView /> 准备就绪。 <AgentsView /> 是一个客户端组件, 它内部的 useQuery 钩子会立即在缓存中找到已经存在的数据, 并用这些数据渲染出最终的 UI。
// 6. 无缝替换 Fallback:  一旦 <AgentsView /> 渲染完成, React 就会用真实的组件内容无缝地替换掉之前显示的 fallback (<AgentsViewLoading />)。
