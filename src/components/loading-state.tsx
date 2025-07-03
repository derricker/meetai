// 从 lucide-react 库导入 Loader2Icon 图标组件，用于显示加载动画
import { Loader2Icon } from "lucide-react";

// 定义组件的 props 接口
interface Props {
  title: string; // 加载状态的标题
  description: string; // 加载状态的描述信息
}

// 定义并导出 LoadingState 组件
export const LoadingState = ({ title, description }: Props) => {
  // 返回一个用于显示加载状态的 JSX 结构
  return (
    // 最外层容器，使用 flex 布局实现垂直和水平居中
    <div className="py-4 px-8 flex flex-1 items-center justify-center">
      {/* 加载信息卡片容器 */}
      <div className="flex flex-col items-center justify-center gap-y-6 bg-background rounded-lg p-10 shadow-sm">
        {/* 加载图标，带有旋转动画 */}
        <Loader2Icon className="size-6 animate-spin text-primary" />
        {/* 文本信息容器 */}
        <div className="flex flex-col gap-y-2 text-center">
          {/* 加载标题 */}
          <h6 className="text-lg font-medium">{title}</h6>
          {/* 加载描述 */}
          <p className="text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
};
