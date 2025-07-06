"use client"; // 标记这是一个客户端组件。

// 导入通用的错误状态和加载状态组件。
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
// 导入 TRPC 客户端 Hook，用于与后端 TRPC 服务进行通信。
import { useTRPC } from "@/trpc/client";
// 导入 React Query 的 Hook，用于数据修改、查询客户端和悬浮查询。
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
// 导入会议详情视图的头部组件。
import { MeetingIdViewHeader } from "../components/meeting-id-view-header";
// 导入 Next.js 的 useRouter Hook，用于路由导航。
import { useRouter } from "next/navigation";
// 导入自定义的 useConfirm Hook，用于显示确认对话框。
import { useConfirm } from "@/hooks/use-confirm";
// 导入更新会议的对话框组件。
import { UpdateMeetingDialog } from "../components/update-meeting-dialog";
// 导入 React 的 useState Hook，用于管理组件的局部状态。
import { useState } from "react";

// 定义组件的 Props 接口。
interface Props {
  meetingId: string; // 会议的唯一标识符。
}

// 定义 MeetingIdView 函数组件。
export const MeetingIdView = ({ meetingId }: Props) => {
  // 初始化 TRPC 客户端实例。
  const trpc = useTRPC();
  // 获取 React Query 客户端实例。
  const queryClient = useQueryClient();
  // 获取路由实例。
  const router = useRouter();

  // 使用 useConfirm Hook 创建删除确认对话框及其触发函数。
  const [RemoveConfirmation, confirmRemove] = useConfirm(
    "确定要删除会议吗?", // 确认对话框的标题。
    "该删除会删除会议" // 确认对话框的描述。
  );

  // 定义 updateMeetingDialogOpen 状态，控制更新会议对话框的显示与隐藏。
  const [updateMeetingDialogOpen, setUpdateMeetingDialogOpen] = useState(false);

  // 使用 useSuspenseQuery Hook 获取会议详情数据，该 Hook 会在数据加载时触发 Suspense。
  const { data } = useSuspenseQuery(
    trpc.meetings.getOne.queryOptions({ id: meetingId }) // 调用 TRPC 接口获取指定 meetingId 的会议详情。
  );

  // 使用 useMutation Hook 定义删除会议的异步操作。
  const removeMeeting = useMutation(
    trpc.meetings.remove.mutationOptions({
      onSuccess: async () => {
        // 删除成功后的回调函数。
        // 使所有会议列表查询失效，触发重新获取最新数据。
        await queryClient.invalidateQueries(
          trpc.meetings.getMany.queryOptions({})
        );
        // 重定向到会议列表页面。
        router.push("/meetings");
      },
    })
  );

  // 处理删除会议的函数。
  const handleRemoveMeeting = async () => {
    // 弹出确认对话框，等待用户确认。
    const ok = await confirmRemove();

    // 如果用户取消删除，则直接返回。
    if (!ok) return;

    // 执行删除会议的异步操作。
    await removeMeeting.mutateAsync({ id: meetingId });
  };

  // 组件渲染内容。
  return (
    <>
      {/* 渲染删除确认对话框组件。 */}
      <RemoveConfirmation />
      {/* 渲染更新会议对话框组件。 */}
      <UpdateMeetingDialog
        open={updateMeetingDialogOpen} // 控制对话框的打开状态。
        onOpenChange={setUpdateMeetingDialogOpen} // 对话框打开状态改变时的回调函数。
        initialValues={data} // 传递会议的初始值。
      />
      {/* 主内容区域的布局。 */}
      <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
        {/* 渲染会议详情头部组件。 */}
        <MeetingIdViewHeader
          meetingId={meetingId} // 传递会议 ID。
          meetingName={data.name} // 传递会议名称。
          onEdit={() => setUpdateMeetingDialogOpen(true)} // 编辑按钮点击时打开更新会议对话框。
          onRemove={handleRemoveMeeting} // 删除按钮点击时触发删除会议操作。
        />
      </div>
    </>
  );
};

// 定义 MeetingIdViewLoading 组件，用于显示会议加载状态。
export const MeetingIdViewLoading = () => {
  return <LoadingState title="正在加载会议" description="这可能需要点时间" />;
};

// 定义 MeetingIdViewError 组件，用于显示会议加载失败状态。
export const MeetingIdViewError = () => {
  return <ErrorState title="会议加载失败" description="请稍后再试" />;
};
