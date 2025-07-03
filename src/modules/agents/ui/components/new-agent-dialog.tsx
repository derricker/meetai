// 从自定义的响应式对话框组件中导入 ResponsiveDialog
import { ResponsiveDialog } from "@/components/responsive-dialog";
// 从当前目录下的 agent-form 文件导入 AgentForm 组件
import { AgentForm } from "./agent-form";

/**
 * 定义 NewAgentDialog 组件的属性 (props) 类型。
 * @property {boolean} open - 控制对话框是否可见
 * @property {(open: boolean) => void} onOpenChange - 当对话框的打开状态改变时调用的回调函数
 */
interface NewAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * NewAgentDialog 组件
 * 这是一个用于创建新智能体的对话框。
 * 它封装了 ResponsiveDialog 和 AgentForm, 提供了一个完整的模态框表单体验
 * @param {NewAgentDialogProps} props - 组件的属性, 包括 open 和 onOpenChange
 */
export const NewAgentDialog = ({ open, onOpenChange }: NewAgentDialogProps) => {
  return (
    // 使用 ResponsiveDialog 组件作为对话框的基础框架
    <ResponsiveDialog
      // 对话框的标题
      title="创建新智能体"
      // 对话框的描述性文字
      description="创建一个新智能体来帮助您完成任务。"
      // 将父组件传入的 open 状态绑定到对话框, 控制其显示和隐藏
      open={open}
      // 将父组件传入的 onOpenChange 函数传递给对话框, 实现状态的向上同步
      onOpenChange={onOpenChange}
    >
      {/* 
        在对话框内容区域渲染 AgentForm 组件
        这个表单用于输入新智能体的具体信息
      */}
      <AgentForm
        // 当表单成功提交时, 调用 onOpenChange(false) 来关闭对话框
        onSuccess={() => onOpenChange(false)}
        // 当用户取消表单操作时, 同样调用 onOpenChange(false) 来关闭对话框
        onCancel={() => onOpenChange(false)}
      />
    </ResponsiveDialog>
  );
};
