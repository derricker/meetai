"use client";

// 引入 lucide-react 库中的 LoaderIcon 组件, 用于显示加载动画
import { LoaderIcon } from "lucide-react";
// 引入 React 的 useEffect 和 useState 钩子, 用于副作用处理和状态管理
import { useEffect, useState } from "react";
// 引入 @tanstack/react-query 库中的 useMutation 钩子, 用于处理数据修改操作
import { useMutation } from "@tanstack/react-query";
// 引入 @stream-io/video-react-sdk 库中的核心组件和类型
import {
  Call, // 表示一个通话实例
  CallingState, // 通话状态枚举
  StreamCall, // Stream 通话上下文提供者
  StreamVideo, // Stream 视频客户端上下文提供者
  StreamVideoClient, // Stream 视频客户端类
} from "@stream-io/video-react-sdk";

// 引入自定义的 useTRPC 钩子, 用于与 tRPC 后端服务进行交互
import { useTRPC } from "@/trpc/client";

// 引入 Stream Video SDK 的样式文件
import "@stream-io/video-react-sdk/dist/css/styles.css";
// 引入 CallUI 组件，用于显示通话的用户界面
import { CallUI } from "./call-ui";

// 定义 CallConnect 组件的 Props 接口
interface Props {
  meetingId: string; // 会议 ID
  meetingName: string; // 会议名称
  userId: string; // 用户 ID
  userName: string; // 用户名称
  userImage: string; // 用户头像 URL
}

// CallConnect 组件, 负责初始化 Stream Video 客户端和通话实例
export const CallConnect = ({
  meetingId,
  meetingName,
  userId,
  userName,
  userImage,
}: Props) => {
  // 初始化 tRPC 客户端
  const trpc = useTRPC();
  // 使用 useMutation 钩子, 定义一个用于生成 Stream token 的异步函数
  const { mutateAsync: generateToken } = useMutation(
    // 调用 tRPC 服务的 meetings 模块的 generateToken 方法
    trpc.meetings.generateToken.mutationOptions()
  );

  // 状态: StreamVideoClient 实例, 用于与 Stream Video 服务进行交互
  const [client, setClient] = useState<StreamVideoClient>();
  // useEffect 钩子, 用于在组件挂载时初始化 StreamVideoClient
  useEffect(() => {
    // 创建 StreamVideoClient 实例
    const _client = new StreamVideoClient({
      // Stream API Key
      apiKey: process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY!,
      // 用户信息
      user: {
        id: userId,
        name: userName,
        image: userImage,
      },
      // 提供 token 的函数
      tokenProvider: generateToken,
    });

    // 设置客户端状态
    setClient(_client);

    // 清理函数: 在组件卸载时断开用户连接并清除客户端实例
    return () => {
      _client.disconnectUser();
      setClient(undefined);
    };
    // 依赖项数组, 当这些值变化时重新执行 effect
  }, [userId, userName, userImage, generateToken]);

  // 状态：Call 实例
  const [call, setCall] = useState<Call>();
  // useEffect 钩子, 用于在客户端实例可用时初始化 Call 实例
  useEffect(() => {
    // 如果客户端未初始化, 则不执行后续操作
    if (!client) return;

    // 创建一个通话实例, 类型为 "default", ID 为 meetingId
    const _call = client.call("default", meetingId);
    // 默认禁用摄像头和麦克风
    _call.camera.disable();
    _call.microphone.disable();
    // 设置通话状态
    setCall(_call);

    // 清理函数: 在组件卸载时离开并结束通话
    return () => {
      // 只有当通话状态不是已离开时才执行离开和结束操作
      if (_call.state.callingState !== CallingState.LEFT) {
        _call.leave();
        _call.endCall();
        setCall(undefined);
      }
    };
  }, [client, meetingId]); // 依赖项数组，当这些值变化时重新执行 effect

  // 如果客户端或通话实例未准备好, 显示加载动画
  if (!client || !call) {
    return (
      <div className="flex h-screen items-center justify-center bg-radial from-sidebar-accent to-sidebar">
        <LoaderIcon className="size-6 animate-spin text-white" />
      </div>
    );
  }

  // 当客户端和通话实例都准备好后, 渲染 StreamVideo 和 StreamCall 组件, 并传入 CallUI
  return (
    <StreamVideo client={client}>
      {/* 提供 StreamVideoClient 实例 */}
      <StreamCall call={call}>
        {/* 提供 Call 实例 */}
        <CallUI meetingName={meetingName} />{" "}
        {/* 渲染通话用户界面，并传入会议名称 */}
      </StreamCall>
    </StreamVideo>
  );
};
