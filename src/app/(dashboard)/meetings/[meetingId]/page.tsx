// 导入认证相关的工具函数。
import { auth } from "@/lib/auth";
// 导入会议详情视图组件及其加载和错误状态组件。
import {
  MeetingIdView,
  MeetingIdViewError,
  MeetingIdViewLoading,
} from "@/modules/meetings/ui/views/meeting-id-view";
// 导入获取查询客户端和 TRPC 服务器端实例。
import { getQueryClient, trpc } from "@/trpc/server";
// 导入 React Query 的 dehydrate 和 HydrationBoundary，用于服务器端渲染的数据脱水和水合。
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
// 导入 Next.js 的 headers 函数，用于获取请求头。
import { headers } from "next/headers";
// 导入 Next.js 的 redirect 函数，用于重定向。
import { redirect } from "next/navigation";
// 导入 React 的 Suspense 组件，用于处理异步组件的加载状态。
import { Suspense } from "react";
// 导入 react-error-boundary 库的 ErrorBoundary 组件，用于错误边界处理。
import { ErrorBoundary } from "react-error-boundary";

// 定义组件的 Props 接口。
interface Props {
  params: Promise<{
    // params 包含路由参数，这里是 meetingId。
    meetingId: string;
  }>;
}

// 定义页面组件，这是一个异步函数组件，因为它需要进行数据获取。
const page = async ({ params }: Props) => {
  // 从 params 中解构出 meetingId。
  const { meetingId } = await params;

  // 获取当前用户的会话信息。
  const session = await auth.api.getSession({
    headers: await headers(), // 传递请求头以获取会话。
  });

  // 如果没有会话（用户未登录），则重定向到登录页面。
  if (!session) {
    redirect("/sign-in");
  }

  // 获取 React Query 客户端实例。
  const queryClient = getQueryClient();
  // 预取会议详情数据，以便在服务器端渲染时加载数据。
  void queryClient.prefetchQuery(
    trpc.meetings.getOne.queryOptions({ id: meetingId }) // 调用 TRPC 接口获取指定 meetingId 的会议详情。
  );

  // 渲染组件。
  return (
    // HydrationBoundary 用于在客户端水合服务器端渲染的数据。
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* Suspense 用于在 MeetingIdView 加载时显示加载状态。 */}
      <Suspense fallback={<MeetingIdViewLoading />}>
        {/* ErrorBoundary 用于捕获 MeetingIdView 内部的错误并显示错误状态。 */}
        <ErrorBoundary fallback={<MeetingIdViewError />}>
          {/* 渲染会议详情视图组件，并传递 meetingId。 */}
          <MeetingIdView meetingId={meetingId} />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

// 导出页面组件。
export default page;
