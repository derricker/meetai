// 声明这是一个客户端组件，这意味着它将在浏览器中渲染和执行，并且可以使用 React Hooks。
'use client';

// 从我们创建的 tRPC 客户端配置文件中导入 `useTRPC` Hook。
// 这个 Hook 用于获取 tRPC 上下文，但在现代的 tRPC + React Query 用法中，
// 这种方式（`useTRPC` + `useQuery`）已经被更简洁的 `trpc.procedure.useQuery()` 替代。
// 这里的用法是一种较旧的模式。
import { useTRPC } from '@/trpc/client';

// 从 @tanstack/react-query 库中导入 `useQuery` Hook。
// 这是 React Query 的核心 Hook，用于发起数据查询、管理缓存和UI状态（如加载、成功、错误）。
import { useQuery } from '@tanstack/react-query';

// 定义并导出一个名为 HomeView 的 React 函数组件。
export const HomeView = () => {
  // 调用 useTRPC Hook 来获取 tRPC 的实例。
  // 这个实例知道如何将 tRPC 的过程（procedure）转换成 React Query 所需的查询选项（queryOptions）。
  const trpc = useTRPC();

  // 使用 React Query 的 useQuery Hook 来获取数据。
  // `data` 是从 useQuery 返回的对象中解构出来的，它将包含成功获取到的数据。
  const { data } = useQuery(
    // `useQuery` 的第一个参数是查询选项对象（QueryOptions）。
    // 这里我们调用 `trpc.hello.queryOptions` 来生成这个对象。
    // `trpc.hello` 对应你后端路由中的 `hello` 路由器。
    // `.queryOptions` 是 tRPC 提供的一个辅助方法，它会创建一个与特定 tRPC 过程绑定的、
    // 兼容 React Query 的配置，包括查询键（queryKey）和查询函数（queryFn）。
    // `({ text: '张三' })` 是传递给 `hello` 过程的输入参数，这是完全类型安全的。
    trpc.hello.queryOptions({ text: '张三' })
  );

  // 返回组件的 JSX 结构。
  return (
    // 一个 flex 容器，垂直排列子元素，有内边距和元素间距。
    <div className='flex flex-col p-4 gap-y-4'>
      {/* 一个段落标签，用于显示从服务器获取到的问候语。 */}
      {/* `data?.greeting`：使用可选链操作符安全地访问 `data` 对象中的 `greeting` 属性。 */}
      {/* 如果 `data` 尚未加载完成（为 undefined），则表达式返回 undefined，不会渲染任何内容，避免了运行时错误。*/}
      {/* 当数据成功返回后，这里会显示类似 "Hello, 张三" 的文本。*/}
      <p>{data?.greeting}</p>
    </div>
  );
};
