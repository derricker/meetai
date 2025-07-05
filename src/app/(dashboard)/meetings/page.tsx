// 导入会议视图相关的组件, 包括主视图、错误视图和加载视图
import {
  MeetingsView,
  MeetingsViewError,
  MeetingsViewLoading,
} from "@/modules/meetings/ui/views/meetings-view";
// 导入在服务器端使用的 tRPC 查询客户端和实例
import { getQueryClient, trpc } from "@/trpc/server";
// 导入 @tanstack/react-query 的 dehydrate 和 HydrationBoundary, 用于服务器端渲染和数据注水
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
// 导入 React 的 Suspense 组件，用于处理异步加载的组件
import { Suspense } from "react";
// 导入 react-error-boundary 库的 ErrorBoundary 组件，用于捕获和处理子组件树中的 JavaScript 错误
import { ErrorBoundary } from "react-error-boundary";

// 导入会议列表头部组件，用于显示会议列表的标题和操作按钮
import { MeetingsListHeader } from "@/modules/meetings/ui/components/meetings-list-header";
// 导入 Next.js 的 headers 函数，用于在服务器端获取请求头信息
import { headers } from "next/headers";
// 导入 Next.js 的 redirect 函数，用于执行页面重定向
import { redirect } from "next/navigation";
// 导入身份验证相关的工具函数，用于处理用户认证和会话管理
import { auth } from "@/lib/auth";

// 定义页面组件
const page = async () => {
  // 获取当前用户会话信息
  const session = await auth.api.getSession({
    headers: await headers(), // 传入请求头信息用于会话验证
  });

  // 如果没有有效会话，重定向到登录页面
  if (!session) return redirect("/sign-in");

  // 获取查询客户端实例
  const queryClient = getQueryClient();
  // 在服务器端预取 getMany 查询的数据，这样页面首次加载时数据就已经可用
  // `void` 关键字用于表示我们不关心 prefetchQuery 的返回值
  void queryClient.prefetchQuery(trpc.meetings.getMany.queryOptions({}));
  return (
    <>
      {/* MeetingsListHeader 会议页面头部组件 */}
      <MeetingsListHeader />
      {/* HydrationBoundary 用于将服务器端预取的数据"注水"到客户端的查询缓存中 */}
      <HydrationBoundary state={dehydrate(queryClient)}>
        {/* Suspense 用于在 MeetingsView 组件加载时显示一个后备 UI (MeetingsViewLoading) */}
        <Suspense fallback={<MeetingsViewLoading />}>
          {/* ErrorBoundary 用于捕获 MeetingsView 组件及其子组件中可能发生的错误 */}
          {/* 如果发生错误，它将渲染 fallback UI (MeetingsViewError) */}
          <ErrorBoundary fallback={<MeetingsViewError />}>
            {/* 渲染主会议视图组件 */}
            <MeetingsView />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
};

// 导出页面组件作为默认导出
export default page;
