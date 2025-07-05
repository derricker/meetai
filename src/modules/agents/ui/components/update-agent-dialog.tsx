// 导入响应式对话框组件, 用于在不同设备上显示合适的对话框样式
import { ResponsiveDialog } from "@/components/responsive-dialog";

// 导入智能体表单组件, 用于创建或编辑智能体
import { AgentForm } from "./agent-form";
// 导入智能体数据类型定义
import { AgentGetOne } from "../../types";

// 定义 UpdateAgentDialog 组件的 props 类型
interface UpdateAgentDialogProps {
  // 控制对话框打开或关闭的状态
  open: boolean;
  // 当对话框打开或关闭状态改变时调用的回调函数
  onOpenChange: (open: boolean) => void;
  // 传递给表单的智能体初始值
  initialValues: AgentGetOne;
}

// 定义并导出 UpdateAgentDialog 组件
export const UpdateAgentDialog = ({
  open, // 解构 props 中的 open
  onOpenChange, // 解构 props 中的 onOpenChange
  initialValues, // 解构 props 中的 initialValues
}: UpdateAgentDialogProps) => {
  return (
    // 使用响应式对话框组件
    <ResponsiveDialog
      title="编辑智能体" // 对话框标题
      description="编辑智能体的详细信息" // 对话框描述
      open={open} // 将 open 状态传递给对话框
      onOpenChange={onOpenChange} // 将 onOpenChange 回调函数传递给对话框
    >
      {/* 嵌入智能体表单组件 */}
      <AgentForm
        // 表单提交成功时的回调，关闭对话框
        onSuccess={() => onOpenChange(false)}
        // 点击取消按钮时的回调，关闭对话框
        onCancel={() => onOpenChange(false)}
        // 将初始值传递给表单
        initialValues={initialValues}
      />
    </ResponsiveDialog>
  );
};
