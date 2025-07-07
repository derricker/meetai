"use client";

// 引入 @tanstack/react-query 库中的 useSuspenseQuery hook, 用于在 Suspense 模式下进行数据查询
import { useSuspenseQuery } from "@tanstack/react-query";
// 引入自定义的 useTRPC hook, 用于与 tRPC 后端服务进行交互
import { useTRPC } from "@/trpc/client";
// 引入 ErrorState 组件, 用于显示错误状态信息
import { ErrorState } from "@/components/error-state";
// 引入 CallProvider 组件, 用于提供通话相关的上下文和功能
import { CallProvider } from "../components/call-provider";

// 定义组件 Props 的接口
interface Props {
  // 会议 ID
  meetingId: string;
}

// CallView 组件, 接收 meetingId 作为 props
export const CallView = ({ meetingId }: Props) => {
  // 初始化 tRPC 客户端
  const trpc = useTRPC();
  // 使用 useSuspenseQuery 查询会议详情, 当数据加载时会触发 Suspense
  const { data } = useSuspenseQuery(
    // 调用 tRPC 服务的 meetings 模块的 getOne 方法, 并传入会议 ID
    trpc.meetings.getOne.queryOptions({ id: meetingId })
  );

  // 如果会议状态为 "completed" (已结束)
  if (data.status === "completed") {
    return (
      // 显示会议已结束的错误状态
      <div className="flex h-screen items-center justify-center">
        <ErrorState title="会议已结束" description="你不能加入会议" />
      </div>
    );
  }

  // 如果会议未结束, 则渲染 CallProvider 组件, 并传入会议 ID 和会议名称
  return <CallProvider meetingId={meetingId} meetingName={data.name} />;
};
