import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import type { Channel as StreamChannel } from "stream-chat";
import {
  useCreateChatClient,
  Chat,
  Channel,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";

import { useTRPC } from "@/trpc/client";
import { LoadingState } from "@/components/loading-state";

import "stream-chat-react/dist/css/v2/index.css";

/**
 * @interface ChatUIProps
 * @description ChatUI 组件的属性定义。
 */
interface ChatUIProps {
  meetingId: string; // 会议 ID
  meetingName: string; // 会议名称
  userId: string; // 用户 ID
  userName: string; // 用户名
  userImage: string | undefined; // 用户头像 URL
}

/**
 * @component ChatUI
 * @description 渲染聊天界面的主组件。
 * @param {ChatUIProps} props - 组件的属性。
 * @returns {JSX.Element} 渲染的 React 组件。
 */
export const ChatUI = ({
  meetingId,
  meetingName,
  userId,
  userName,
  userImage,
}: ChatUIProps) => {
  // 初始化 tRPC 客户端
  const trpc = useTRPC();
  // 使用 useMutation 创建一个异步函数来生成聊天令牌
  const { mutateAsync: generateChatToken } = useMutation(
    trpc.meetings.generateChatToken.mutationOptions()
  );

  // 使用 useState 管理 StreamChat 的 channel 对象
  const [channel, setChannel] = useState<StreamChannel>();
  // 使用 useCreateChatClient 钩子创建和管理聊天客户端实例
  const client = useCreateChatClient({
    apiKey: process.env.NEXT_PUBLIC_STREAM_CHAT_API_KEY!, // 从环境变量中获取 Stream Chat API Key
    tokenOrProvider: generateChatToken, // 提供一个函数或 Promise 用于获取用户令牌
    userData: {
      // 设置当前用户的基本信息
      id: userId,
      name: userName,
      image: userImage,
    },
  });

  // 使用 useEffect 在客户端实例创建后设置频道
  useEffect(() => {
    if (!client) return; // 如果客户端尚未初始化，则不执行任何操作

    // 创建或获取一个类型为 'messaging' 的频道，使用 meetingId 作为频道 ID
    const channel = client.channel("messaging", meetingId, {
      members: [userId], // 将当前用户添加为频道成员
    });

    // 更新 channel 状态
    setChannel(channel);
  }, [client, meetingId, meetingName, userId]); // 依赖项数组，当这些值变化时会重新执行

  // 如果客户端尚未准备好，显示加载状态
  if (!client) {
    return <LoadingState title="正在加载聊天" description="这可能需要几秒钟" />;
  }

  // 渲染聊天界面
  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <Chat client={client}>
        {/* Chat 组件，提供聊天客户端实例 */}
        <Channel channel={channel}>
          {/* Channel 组件，指定当前活动的频道 */}
          <Window>
            {/* Window 组件，用于组织布局 */}
            <div className="flex-1 overflow-y-auto max-h-[calc(100vh-23rem)] border-b">
              <MessageList />
              {/* 消息列表组件 */}
            </div>
            <MessageInput
              additionalTextareaProps={{ placeholder: "请输入消息" }}
            />
            {/* 消息输入框组件 */}
          </Window>
          <Thread /> {/* 线程消息组件，用于回复 */}
        </Channel>
      </Chat>
    </div>
  );
};
