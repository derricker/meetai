// 声明这是一个客户端组件, 因为它需要使用钩子 (useIsMobile) 和处理用户交互。
"use client";

// 导入自定义钩子 useIsMobile, 用于检测当前设备是否为移动端
import { useIsMobile } from "@/hooks/use-mobile";
// 从 UI 库中导入 Dialog 相关的组件
import {
  Dialog, // 对话框容器
  DialogContent, // 对话框内容区域
  DialogHeader, // 对话框头部
  DialogTitle, // 对话框标题
  DialogDescription, // 对话框描述
} from "@/components/ui/dialog";
// 从 UI 库中导入 Drawer 相关的组件。
import {
  Drawer, // 抽屉容器
  DrawerContent, // 抽屉内容区域
  DrawerHeader, // 抽屉头部
  DrawerTitle, // 抽屉标题
  DrawerDescription, // 抽屉描述
} from "@/components/ui/drawer";

// 定义 ResponsiveDialog 组件的 props 类型接口。
interface ResponsiveDialogProps {
  title: string; // 对话框或抽屉的标题
  description: string; // 对话框或抽屉的描述文本
  children: React.ReactNode; // 要在对话框或抽屉中显示的主要内容
  open: boolean; // 控制对话框或抽屉打开/关闭状态的布尔值
  onOpenChange: (open: boolean) => void; // 当打开状态改变时触发的回调函数
}

// 定义并导出 ResponsiveDialog 组件
export const ResponsiveDialog = ({
  title, // 解构 props 中的 title
  description, // 解构 props 中的 description
  children, // 解构 props 中的 children
  open, // 解构 props 中的 open
  onOpenChange, // 解构 props 中的 onOpenChange
}: ResponsiveDialogProps) => {
  // 调用 useIsMobile 钩子, 获取一个布尔值, 表示当前是否为移动设备视图。
  const isMobile = useIsMobile();

  // 如果 isMobile 为 true, 则渲染移动端版本的抽屉。
  if (isMobile) {
    return (
      // Drawer 组件, 通过 open 和 onOpenChange props 控制其状态
      <Drawer open={open} onOpenChange={onOpenChange}>
        {/* Drawer 的内容区域 */}
        <DrawerContent>
          {/* Drawer 的头部, 包含标题和描述 */}
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          {/* 抽屉的主体内容, 通过 children 传入, 添加一些内边距以改善外观。 */}
          <div className="p-4">{children}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  // 如果 isMobile 为 false，则渲染桌面版本的对话框（Dialog）。
  return (
    // Dialog 组件，同样通过 open 和 onOpenChange props 控制其状态。
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Dialog 的内容区域 */}
      <DialogContent>
        {/* Dialog 的头部，包含标题和描述 */}
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {/* 对话框的主体内容，直接作为 DialogContent 的子元素。 */}
        {children}
      </DialogContent>
    </Dialog>
  );
};
