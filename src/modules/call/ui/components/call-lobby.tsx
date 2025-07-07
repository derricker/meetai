// 引入 Next.js 的 Link 组件, 用于客户端路由跳转
import Link from "next/link";
// 引入 lucide-react 库中的 LogInIcon 图标组件
import { LogInIcon } from "lucide-react";
// 引入 Stream Video React SDK 相关组件和钩子
import {
  // 默认视频占位符组件
  DefaultVideoPlaceholder,
  // Stream 视频参与者类型定义
  StreamVideoParticipant,
  // 切换音频预览按钮组件
  ToggleAudioPreviewButton,
  // 切换视频预览按钮组件
  ToggleVideoPreviewButton,
  // 用于获取通话状态相关钩子
  useCallStateHooks,
  // 视频预览组件
  VideoPreview,
} from "@stream-io/video-react-sdk";

// 引入自定义的认证客户端
import { authClient } from "@/lib/auth-client";
// 引入自定义的 Button 组件
import { Button } from "@/components/ui/button";
// 引入生成头像 URI 的工具函数
import { generateAvatarUri } from "@/lib/avatar";
// 引入 Stream Video SDK 的样式文件
import "@stream-io/video-react-sdk/dist/css/styles.css";

// 定义 CallLobby 组件的 Props 接口
interface Props {
  onJoin: () => void; // 加入通话的回调函数
}

// DisabledVideoPreview 组件: 当视频预览被禁用时显示的内容
const DisabledVideoPreview = () => {
  // 获取当前用户会话数据
  const { data } = authClient.useSession();

  return (
    <DefaultVideoPlaceholder
      participant={
        // 传递参与者信息, 用于显示默认头像或名称
        {
          name: data?.user.name ?? "", // 用户名, 如果不存在则为空字符串
          image:
            data?.user.image ?? // 用户头像, 如果不存在则生成一个默认头像
            generateAvatarUri({
              seed: data?.user.name ?? "", // 用于生成头像的种子 (通常是用户名)
              variant: "initials", // 头像变体, 这里是首字母缩写
            }),
        } as StreamVideoParticipant // 类型断言为 StreamVideoParticipant
      }
    />
  );
};

// AllowBrowserPermissions 组件: 提示用户授予浏览器权限
const AllowBrowserPermissions = () => {
  return <p className="text-sm">请授予您的浏览器访问摄像头和麦克风的权限。</p>;
};

// CallLobby 组件: 会议大厅界面, 用户可以在此设置音视频并选择加入会议
export const CallLobby = ({ onJoin }: Props) => {
  // 使用 useCallStateHooks 获取摄像头和麦克风状态相关的钩子
  const { useCameraState, useMicrophoneState } = useCallStateHooks();

  // 获取麦克风的浏览器权限状态
  const { hasBrowserPermission: hasMicPermission } = useMicrophoneState();
  // 获取摄像头的浏览器权限状态
  const { hasBrowserPermission: hasCameraPermission } = useCameraState();

  // 判断是否同时拥有摄像头和麦克风的浏览器权限
  const hasBrowserMediaPermission = hasCameraPermission && hasMicPermission;

  return (
    <div className="flex flex-col items-center justify-center h-full bg-radial from-sidebar-accent to-sidebar">
      <div className="py-4 px-8 flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-y-6 bg-background rounded-lg p-10 shadow-sm">
          <div className="flex flex-col gap-y-2 text-center">
            <h6 className="text-lg font-medium">准备加入会议?</h6>
            <p className="text-sm">加入前设置通话</p>
          </div>
          {/* 视频预览组件, 根据是否有浏览器媒体权限显示不同的占位符 */}
          <VideoPreview
            DisabledVideoPreview={
              hasBrowserMediaPermission
                ? DisabledVideoPreview // 如果有权限, 显示默认视频占位符
                : AllowBrowserPermissions // 如果没有权限, 提示用户授予权限
            }
            NoCameraPreview={() => <div>未找到摄像头</div>} // 当未找到摄像头时显示的内容
          />
          {/* 音频和视频切换按钮 */}
          <div className="flex gap-x-2">
            <ToggleAudioPreviewButton caption="切换音频" />
            <ToggleVideoPreviewButton caption="切换视频" />
          </div>
          {/* 取消和加入通话按钮 */}
          <div className="flex gap-x-2 justify-between w-full">
            <Button asChild variant="ghost">
              <Link href="/meetings">取消</Link>
              {/* 取消按钮，点击跳转到会议列表页 */}
            </Button>
            <Button onClick={onJoin}>
              {/* 加入通话按钮，点击调用 onJoin 回调函数 */}
              <LogInIcon />
              加入通话
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
