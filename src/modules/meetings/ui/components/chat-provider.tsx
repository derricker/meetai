"use client";

import { authClient } from "@/lib/auth-client";
import { LoadingState } from "@/components/loading-state";

import { ChatUI } from "./chat-ui";

/**
 * @interface Props
 * @description ChatProvider 组件的属性定义。
 */
interface Props {
  /**
   * @property {string} meetingId - 会议的唯一标识符。
   */
  meetingId: string;
  /**
   * @property {string} meetingName - 会议的名称。
   */
  meetingName: string;
}

/**
 * @component ChatProvider
 * @description 该组件作为聊天功能的提供者。
 * 它负责处理用户会话状态，并在加载或验证用户信息时显示加载界面。
 * 验证成功后，它将渲染 ChatUI 组件，并传递必要的会议和用户信息。
 * @param {Props} props - 组件的属性，包含 meetingId 和 meetingName。
 * @returns {JSX.Element} 渲染的 React 组件。
 */
export const ChatProvider = ({ meetingId, meetingName }: Props) => {
  // 使用 authClient 的 useSession 钩子获取用户会话数据和加载状态。
  const { data, isPending } = authClient.useSession();

  // 如果正在加载会话数据或用户数据不存在，则显示加载状态组件。
  if (isPending || !data?.user) {
    return (
      <LoadingState
        title="正在加载..."
        description="请稍候，我们正在加载聊天内容"
      />
    );
  }

  // 用户数据加载成功后，渲染聊天界面组件。
  return (
    <ChatUI
      meetingId={meetingId} // 传递会议 ID
      meetingName={meetingName} // 传递会议名称
      userId={data.user.id} // 传递用户 ID
      userName={data.user.name} // 传递用户名称
      userImage={data.user.image ?? ""} // 传递用户头像，如果不存在则为空字符串
    />
  );
};
