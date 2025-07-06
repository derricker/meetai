// 导入响应式对话框组件
import { ResponsiveDialog } from "@/components/responsive-dialog";
// 导入会议表单组件
import { MeetingForm } from "./meeting-form";
// 导入会议详情类型定义
import { MeetingGetOne } from "../../types";

// 定义更新会议对话框组件的 Props 接口
interface UpdateMeetingDialogProps {
  // 控制对话框是否打开
  open: boolean;
  // 对话框打开/关闭状态改变时的回调函数
  onOpenChange: (open: boolean) => void;
  // 会议的初始值，用于编辑表单
  initialValues: MeetingGetOne;
}

export const UpdateMeetingDialog = ({
  open,
  onOpenChange,
  initialValues,
}: UpdateMeetingDialogProps) => {
  return (
    <ResponsiveDialog
      title="编辑会议" // 对话框标题
      description="编辑会议详情" // 对话框描述
      open={open} // 绑定对话框的打开状态
      onOpenChange={onOpenChange} // 绑定对话框状态改变的回调
    >
      <MeetingForm
        onSuccess={() => onOpenChange(false)} // 表单提交成功后关闭对话框
        onCancel={() => onOpenChange(false)} // 表单取消后关闭对话框
        initialValues={initialValues} // 将初始值传递给会议表单组件
      />
    </ResponsiveDialog>
  );
};
