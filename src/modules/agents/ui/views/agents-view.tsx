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

// 导入表格列定义, 定义了智能体表格的列结构和渲染方式
import { columns } from "../components/columns";
// 导入空状态组件, 当没有智能体数据时显示引导用户创建的界面
import { EmptyState } from "@/components/empty-state";
// 导入智能体过滤器钩子, 用于获取当前的过滤条件状态
import { useAgentsFilters } from "../../hooks/use-agents-filters";
// 导入分页组件
import { DataPagination } from "../components/data-pagination";
// 导入 Next.js 路由器钩子
import { useRouter } from "next/navigation";
// 导入数据表格组件, 用于显示智能体列表的表格界面
import { DataTable } from "@/components/data-table";

// 定义并导出 AgentsView 组件。这是显示智能体列表的核心界面。
export const AgentsView = () => {
  // 获取路由器对象
  const router = useRouter();
  // 使用智能体过滤器钩子获取当前的过滤条件
  // 这里只解构出 filters, 不需要 setFilters 函数, 因为这个组件只读取过滤条件
  const [filters, setFilters] = useAgentsFilters();

  // 调用 useTRPC 钩子, 获取一个 tRPC 客户端实例, 该实例已经配置好了与后端通信所需的一切。
  const trpc = useTRPC();

  // 使用 useSuspenseQuery 钩子来获取数据。
  // 这个钩子与 useQuery 的主要区别在于它处理加载和错误状态的方式:
  // 1. 在数据加载时, 它会"暂停"组件的渲染, 让最近的 <Suspense> 组件显示其 fallback UI。
  // 2. 如果查询出错, 它会抛出一个错误, 这个错误可以被最近的 <ErrorBoundary> 组件捕获。
  // 3. 成功后，它返回的 `data` 字段是确切有值的, 因此我们无需检查其是否存在。
  // `trpc.agents.getMany.queryOptions()` 创建了一个可重用的查询配置对象, 包含了查询键和查询函数。
  const { data } = useSuspenseQuery(
    trpc.agents.getMany.queryOptions({
      ...filters,
    })
  );
  // 返回视图
  return (
    // 主容器: 使用 Flexbox 布局, 占满剩余空间, 设置内边距和垂直间距
    // flex-1: 占满父容器的剩余空间
    // pb-4: 底部内边距 1rem
    // px-4 md:px-8: 水平内边距，小屏幕 1rem，中等屏幕及以上 2rem
    // flex flex-col: 垂直 Flexbox 布局
    // gap-y-4: 子元素之间的垂直间距 1rem
    <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
      {/* 数据表格组件：显示智能体列表 */}
      {/* data: 传入从后端获取的智能体数据数组 */}
      {/* columns: 传入表格列定义，决定表格的结构和渲染方式 */}
      <DataTable
        data={data.items}
        columns={columns}
        onRowClick={(row) => router.push(`/agents/${row.id}`)}
      />
      {/* 渲染分页组件 */}
      <DataPagination
        page={filters.page}
        totalPages={data.totalPages}
        onPageChange={(page) => setFilters({ page })}
      />
      {/* 条件渲染：当智能体数据为空时显示空状态组件 */}
      {/* 使用逻辑与运算符 && 进行条件渲染，只有当 data.length === 0 为真时才渲染 EmptyState */}
      {data.items.length === 0 && (
        <EmptyState
          // 空状态标
          title="创建你的第一个智能体"
          // 空状态描述文字
          description="创建智能体来加入您的会议。每位智能体都会遵循您的指示，并可以在通话期间与参与者互动。"
        />
      )}
    </div>
  );
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
