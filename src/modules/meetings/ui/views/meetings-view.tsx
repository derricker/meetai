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

// 导入表格列的配置信息，包含了表格每一列的定义（如列标题、数据渲染方式等）
import { columns } from "../components/columns";
// 导入通用数据表格组件，用于展示结构化数据，支持排序、筛选等功能
import { DataTable } from "@/components/data-table";
// 导入空状态组件，用于在没有数据时显示友好的提示信息和引导用户操作
import { EmptyState } from "@/components/empty-state";

// 导入自定义钩子 useMeetingsFilters，用于管理会议列表的过滤条件和分页状态
// 这个钩子返回当前的过滤器状态和更新过滤器的函数
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";

// 导入数据分页组件，用于显示分页控件和处理分页逻辑
// 该组件接收当前页码、总页数和页码变化的回调函数作为props
import { DataPagination } from "@/components/data-pagination";

// 导入 Next.js 的路由钩子，用于在客户端进行页面导航
// useRouter 提供了编程式导航的能力，如 push、replace 等方法
import { useRouter } from "next/navigation";

/**
 * MeetingsView 组件
 * 该组件负责获取并显示会议列表。
 * 它使用了 useSuspenseQuery 来处理数据加载, 并依赖于父组件中的 <Suspense> 和 <ErrorBoundary> 来处理加载和错误状态。
 */
export const MeetingsView = () => {
  // 初始化路由实例，用于页面导航
  const router = useRouter();
  // 使用自定义钩子获取和设置会议列表的过滤条件
  // filters 包含当前的过滤器状态（如页码、搜索条件等）
  // setFilters 用于更新过滤器状态
  const [filters, setFilters] = useMeetingsFilters();
  // 初始化 tRPC 客户端实例。
  const trpc = useTRPC();
  // 使用 useSuspenseQuery 从 tRPC 的 meetings.getMany 端点获取数据。
  // 这个钩子会自动处理加载状态, 在数据准备好之前, 父组件的 Suspense fallback 将被显示。
  const { data } = useSuspenseQuery(
    trpc.meetings.getMany.queryOptions({
      ...filters,
    })
  );

  // 渲染获取到的数据，这里临时使用 JSON.stringify 进行展示。
  return (
    // 外层容器，使用 flex 布局，设置内边距和垂直间距
    <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
      {/* 数据表格组件，用于展示会议列表
          - data 属性传入会议数据
          - columns 定义表格列的配置
          - onRowClick 处理行点击事件，点击后跳转到对应会议详情页 */}
      <DataTable
        data={data.items}
        columns={columns}
        onRowClick={(row) => router.push(`/meetings/${row.id}`)}
      />

      {/* 分页组件，用于控制数据分页
          - page 当前页码
          - totalPages 总页数
          - onPageChange 页码变化时的回调函数，更新过滤器状态 */}
      <DataPagination
        page={filters.page}
        totalPages={data.totalPages}
        onPageChange={(page) => setFilters({ page })}
      />

      {/* 空状态展示
          当没有会议数据时显示引导创建的提示信息
          使用 EmptyState 组件展示标题和描述文本 */}
      {data.items.length === 0 && (
        <EmptyState
          title="创建你的第一个会议"
          description="创建你的第一个会议, 与其他用户一起协作, 分享想法, 实时互动"
        />
      )}
    </div>
  );
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
