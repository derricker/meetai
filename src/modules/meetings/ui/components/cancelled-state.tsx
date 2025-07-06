// 导入 EmptyState 组件，用于显示空状态或特定状态的占位符
import { EmptyState } from "@/components/empty-state";

// 定义 CancelledState 函数组件
// 这是一个用于显示会议已取消状态的组件
export const CancelledState = () => {
  return (
    // 根容器，设置背景颜色、圆角、内边距，并使用 flex 布局进行内容居中和垂直排列
    <div className="bg-white rounded-lg px-4 py-5 flex flex-col gap-y-8 items-center justify-center">
      {/* 
        EmptyState 组件用于显示取消会议的视觉提示。
        - image: 指定要显示的 SVG 图片路径，这里是取消会议的图标。
        - title: 设置状态标题，显示“会议取消”。
        - description: 提供更详细的描述，说明“会议已取消”。
      */}
      <EmptyState
        image="/cancelled.svg"
        title="会议取消"
        description="会议已取消"
      />
    </div>
  );
};
