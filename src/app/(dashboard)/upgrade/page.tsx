// 导入 React 的 Suspense 组件，用于处理异步组件的加载状态
import { Suspense } from "react";
// 导入 Next.js 的 headers 函数，用于获取请求头信息
import { headers } from "next/headers";
// 导入 Next.js 的 redirect 函数，用于页面重定向
import { redirect } from "next/navigation";
// 导入 react-error-boundary 的 ErrorBoundary 组件，用于捕获和处理错误
import { ErrorBoundary } from "react-error-boundary";
// 导入 TanStack Query 的相关函数，用于数据脱水和水合
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

// 导入身份验证模块
import { auth } from "@/lib/auth";
// 导入查询客户端和 tRPC 服务端实例
import { getQueryClient, trpc } from "@/trpc/server";
// 导入升级页面相关的视图组件
import {
  UpgradeView, // 主要的升级视图组件
  UpgradeViewError, // 错误状态视图组件
  UpgradeViewLoading, // 加载状态视图组件
} from "@/modules/premium/ui/views/upgrade-view";

// 定义升级页面的主要组件（异步函数组件）
const Page = async () => {
  // 获取当前用户的会话信息，传入请求头
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 如果用户未登录，重定向到登录页面
  if (!session) {
    redirect("/sign-in");
  }

  // 获取查询客户端实例
  const queryClient = getQueryClient();

  // 预取当前用户的订阅信息，提高页面加载性能
  // void 关键字表示我们不关心这个 Promise 的返回值
  void queryClient.prefetchQuery(
    trpc.premium.getCurrentSubscription.queryOptions()
  );

  // 预取可用的产品列表信息
  void queryClient.prefetchQuery(trpc.premium.getProducts.queryOptions());

  return (
    // HydrationBoundary 用于在客户端恢复服务端预取的数据
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* Suspense 组件处理异步加载，显示加载状态 */}
      <Suspense fallback={<UpgradeViewLoading />}>
        {/* ErrorBoundary 捕获组件树中的错误，显示错误状态 */}
        <ErrorBoundary fallback={<UpgradeViewError />}>
          {/* 主要的升级视图组件 */}
          <UpgradeView />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

// 导出页面组件作为默认导出
export default Page;
