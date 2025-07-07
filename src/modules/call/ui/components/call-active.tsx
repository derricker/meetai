// 引入 Next.js 的 Link 组件, 用于客户端路由跳转
import Link from "next/link";
// 引入 Next.js 的 Image 组件, 用于优化图片加载
import Image from "next/image";
// 引入 Stream Video React SDK 相关组件
import {
  // 通话控制组件, 包含麦克风、摄像头、挂断等按钮
  CallControls,
  // 扬声器布局组件, 用于显示通话参与者的视频流
  SpeakerLayout,
} from "@stream-io/video-react-sdk";

// 定义 CallActive 组件的 Props 接口
interface Props {
  // 离开通话的回调函数
  onLeave: () => void;
  // 会议名称
  meetingName: string;
}

// CallActive 组件, 用于显示活跃通话界面
export const CallActive = ({ onLeave, meetingName }: Props) => {
  return (
    // 整体布局容器, flex 布局, 垂直方向, 内容上下对齐, 内边距为 4, 高度占满, 文字颜色为白色
    <div className="flex flex-col justify-between p-4 h-full text-white">
      {/* 顶部会议信息区域 */}
      <div className="bg-[#101213] rounded-full p-4 flex items-center gap-4">
        {/* Logo 和返回主页的链接 */}
        <Link
          href="/"
          className="flex items-center justify-center p-1 bg-white/10 rounded-full w-fit"
        >
          <Image src="/logo.svg" width={22} height={22} alt="Logo" />
        </Link>
        {/* 会议名称 */}
        <h4 className="text-base">{meetingName}</h4>
      </div>
      {/* 扬声器布局, 显示通话参与者的视频流 */}
      <SpeakerLayout />
      {/* 底部通话控制区域 */}
      <div className="bg-[#101213] rounded-full px-4">
        {/* 通话控制组件, 传入离开通话的回调函数 */}
        <CallControls onLeave={onLeave} />
      </div>
    </div>
  );
};
