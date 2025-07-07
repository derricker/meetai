import { auth } from "@/lib/auth";
import { CallView } from "@/modules/call/ui/views/call-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// 定义页面组件的 props 类型
interface Props {
  params: Promise<{
    // 会议ID参数
    meetingId: string;
  }>;
}

// 会议详情页面组件
const Page = async ({ params }: Props) => {
  // 从 params 中获取会议 ID
  const { meetingId } = await params;

  // 获取当前会话信息
  const session = await auth.api.getSession({
    // 从请求头中获取会话信息
    headers: await headers(),
  });

  // 如果用户未登录, 则重定向到登录页面
  if (!session) {
    redirect("/sign-in");
  }

  // 初始化查询客户端
  const queryClient = getQueryClient();
  // 预取会议数据
  void queryClient.prefetchQuery(
    trpc.meetings.getOne.queryOptions({ id: meetingId })
  );

  // 渲染页面
  return (
    // 使用HydrationBoundary提供服务器端渲染的数据
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* 渲染会议视图组件 */}
      <CallView meetingId={meetingId} />
    </HydrationBoundary>
  );
};

export default Page;
