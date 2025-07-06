// 导入 Link 组件用于客户端路由导航
import Link from "next/link";
// 导入 VideoIcon 图标组件，来自 lucide-react 库
import { VideoIcon } from "lucide-react";

// 导入自定义的 Button 组件和 EmptyState 组件
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";

// 定义组件的 props 接口
interface Props {
  meetingId: string; // 会议 ID
}

// 定义 UpcomingState 函数组件
// 这是一个用于显示即将开始会议状态的组件
export const UpcomingState = ({ meetingId }: Props) => {
  return (
    // 根容器，设置背景颜色、圆角、内边距，并使用 flex 布局进行内容居中和垂直排列
    <div className="bg-white rounded-lg px-4 py-5 flex flex-col gap-y-8 items-center justify-center">
      {/* 
        EmptyState 组件用于显示即将开始会议的视觉提示。
        - image: 指定要显示的 SVG 图片路径，这里是即将开始会议的图标。
        - title: 设置状态标题，显示“会议待开始”。
        - description: 提供更详细的描述，说明“一旦您开始此会议，摘要将显示在此处”。
      */}
      <EmptyState
        image="/upcoming.svg"
        title="会议待开始"
        description="一旦您开始此会议，摘要将显示在此处"
      />
      {/* 按钮容器，根据屏幕大小调整布局方向和对齐方式 */}
      <div className="flex flex-col-reverse lg:flex-row lg:justify-center items-center gap-2 w-full">
        {/* 
          Button 组件，作为 Link 组件的子组件，实现路由跳转。
          - asChild: 将 Button 的样式和行为应用到其子组件 Link 上。
          - className: 设置按钮的宽度，在小屏幕上全宽，大屏幕上自适应。
        */}
        <Button asChild className="w-full lg:w-auto">
          {/* 
            Link 组件，点击后导航到 `/call/${meetingId}` 路径。
            - href: 目标路由路径，包含会议 ID。
          */}
          <Link href={`/call/${meetingId}`}>
            <VideoIcon /> {/* 视频图标 */}
            开始会议 {/* 按钮文本 */}
          </Link>
        </Button>
      </div>
    </div>
  );
};
