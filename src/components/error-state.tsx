// 从 lucide-react 库导入 AlertCircleIcon 图标组件
import { AlertCircleIcon } from "lucide-react";

// 定义组件的 props 接口
interface Props {
  title: string; // 错误的标题
  description: string; // 错误的描述信息
}

// 定义并导出 ErrorState 组件
export const ErrorState = ({ title, description }: Props) => {
  // 返回一个用于显示错误状态的 JSX 结构
  return (
    // 最外层容器，使用 flex 布局实现垂直和水平居中
    <div className="py-4 px-8 flex flex-1 items-center justify-center">
      {/* 错误信息卡片容器 */}
      <div className="flex flex-col items-center justify-center gap-y-6 bg-background rounded-lg p-10 shadow-sm">
        {/* 错误图标 */}
        <AlertCircleIcon className="size-6 text-red-500" />
        {/* 文本信息容器 */}
        <div className="flex flex-col gap-y-2 text-center">
          {/* 错误标题 */}
          <h6 className="text-lg font-medium">{title}</h6>
          {/* 错误描述 */}
          <p className="text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
};
