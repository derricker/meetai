"use client";

// 引入 lucide-react 库中的 LoaderIcon 组件, 用于显示加载动画
import { LoaderIcon } from "lucide-react";
// 引入自定义的 authClient, 用于处理用户认证会话
import { authClient } from "@/lib/auth-client";
// 引入 generateAvatarUri 函数, 用于根据用户数据生成头像 URI
import { generateAvatarUri } from "@/lib/avatar";
// 引入 CallConnect 组件, 这是实际连接通话的组件
import { CallConnect } from "./call-connect";

// 定义 CallProvider 组件的 Props 接口
interface Props {
  // 会议 ID
  meetingId: string;
  // 会议名称
  meetingName: string;
}

// CallProvider 组件, 负责获取用户会话信息并将其传递给 CallConnect 组件
export const CallProvider = ({ meetingId, meetingName }: Props) => {
  // 使用 authClient.useSession() hook 获取当前用户会话数据和加载状态
  const { data, isPending } = authClient.useSession();

  // 如果会话数据未加载完成或正在加载中 (isPending 为 true)
  if (!data || isPending) {
    return (
      // 显示加载动画和背景, 表示正在等待会话数据
      <div className="flex h-screen items-center justify-center bg-radial from-sidebar-accent to-sidebar">
        <LoaderIcon className="size-6 animate-spin text-white" />
      </div>
    );
  }

  // 如果会话数据已加载完成, 则渲染 CallConnect 组件
  return (
    <CallConnect
      // 传递会议 ID
      meetingId={meetingId}
      // 传递会议名称
      meetingName={meetingName}
      // 传递用户 ID
      userId={data.user.id}
      // 传递用户名称
      userName={data.user.name}
      // 用户头像设置
      userImage={
        // 传递用户头像 URL, 如果用户没有设置头像, 则生成一个默认头像
        data.user.image ??
        generateAvatarUri({ seed: data.user.name, variant: "initials" })
      }
    />
  );
};
