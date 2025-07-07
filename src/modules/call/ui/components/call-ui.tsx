// 引入 React 的 useState 钩子, 用于管理组件状态
import { useState } from "react";
// 引入 StreamTheme 组件和 useCall 钩子, 用于视频通话 UI 和获取通话实例
import { StreamTheme, useCall } from "@stream-io/video-react-sdk";

// 引入本地组件 CallLobby, CallActive, CallEnded
import { CallLobby } from "./call-lobby"; // 通话大厅组件
import { CallActive } from "./call-active"; // 活跃通话组件
import { CallEnded } from "./call-ended"; // 通话结束组件

// 定义 CallUI 组件的 Props 接口
interface Props {
  meetingName: string; // 会议名称
}

// CallUI 组件, 负责根据通话状态渲染不同的 UI 界面 (大厅、通话中、通话结束)
export const CallUI = ({ meetingName }: Props) => {
  // 使用 useCall 钩子获取当前的通话实例
  const call = useCall();
  // 使用 useState 管理当前显示的界面状态, 初始为 "lobby" (大厅)
  const [show, setShow] = useState<"lobby" | "call" | "ended">("lobby");

  // 处理加入通话的函数
  const handleJoin = async () => {
    // 如果没有通话实例, 则直接返回
    if (!call) return;

    // 调用通话实例的 join 方法加入通话
    await call.join();

    // 设置显示状态为 "call", 切换到通话中界面
    setShow("call");
  };

  // 处理离开通话的函数
  const handleLeave = () => {
    // 如果没有通话实例, 则直接返回
    if (!call) return;

    // 调用通话实例的 endCall 方法结束通话
    call.endCall();
    // 设置显示状态为 "ended", 切换到通话结束界面
    setShow("ended");
  };

  return (
    // 使用 StreamTheme 组件包裹整个 UI, 提供 Stream 视频 SDK 的主题样式
    <StreamTheme className="h-full">
      {/* 根据 show 状态渲染不同的组件 */}
      {/* 如果是 "lobby" 状态, 显示 CallLobby 组件并传递 handleJoin 函数 */}
      {show === "lobby" && <CallLobby onJoin={handleJoin} />}
      {/* 如果是 "call" 状态, 显示 CallActive 组件并传递 handleLeave 函数和 meetingName */}
      {show === "call" && (
        <CallActive onLeave={handleLeave} meetingName={meetingName} />
      )}
      {/* 如果是 "ended" 状态, 显示 CallEnded 组件 */}
      {show === "ended" && <CallEnded />}
    </StreamTheme>
  );
};
