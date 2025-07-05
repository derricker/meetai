// 导入响应式对话框组件, 用于在不同设备上显示合适的对话框样式
import { ResponsiveDialog } from "@/components/responsive-dialog";
// 导入会议表单组件, 用于创建或编辑会议信息
import { MeetingForm } from "./meeting-form";
// 导入 Next.js 的 useRouter hook, 用于程序化导航
import { useRouter } from "next/navigation";

// 定义 NewMeetingDialog 组件的 props 类型接口
interface NewMeetingDialogProps {
  // 控制对话框是否打开
  open: boolean;
  // 当对话框打开状态改变时调用的回调函数
  onOpenChange: (open: boolean) => void;
}

// 定义并导出 NewMeetingDialog 组件
export const NewMeetingDialog = ({
  open, // 解构 props 中的 open
  onOpenChange, // 解构 props 中的 onOpenChange
}: NewMeetingDialogProps) => {
  // 获取 router 实例, 用于后续的页面跳转
  const router = useRouter();

  // 返回一个响应式对话框组件
  return (
    <ResponsiveDialog
      title="新建会议" // 对话框标题
      description="创建新会议" // 对话框描述
      open={open} // 将 open 状态传递给对话框
      onOpenChange={onOpenChange} // 将 onOpenChange 回调函数传递给对话框
    >
      {/* 在对话框内容区渲染会议表单 */}
      <MeetingForm
        // 定义表单成功提交后的回调函数
        onSuccess={(id) => {
          // 关闭对话框
          onOpenChange(false);
          // 使用 router 跳转到新创建的会议详情页面
          router.push(`/meetings/${id}`);
        }}
        // 定义取消操作的回调函数
        onCancel={() => onOpenChange(false)} // 关闭对话框
      />
    </ResponsiveDialog>
  );
};
