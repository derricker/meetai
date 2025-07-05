// 声明这是一个客户端组件, 它将在浏览器中执行
"use client";

// 导入 PlusIcon 组件, 用于显示加号图标
import { PlusIcon } from "lucide-react";
// 导入自定义的 Button 组件
import { Button } from "@/components/ui/button";
// 导入新建会议的对话框组件
import { NewMeetingDialog } from "./new-meeting-dialog";
// 导入 React 的 useState hook, 用于管理组件的状态
import { useState } from "react";

// 定义并导出 MeetingsListHeader 组件
export const MeetingsListHeader = () => {
  // 使用 useState hook 创建一个状态变量 isDialogOpen, 用于控制新建会议对话框的打开和关闭
  // setIsDialogOpen 是更新这个状态的函数
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 返回组件的 JSX 结构
  return (
    <>
      {/* 新建会议对话框组件，通过 open 和 onOpenChange props 控制其可见性 */}
      <NewMeetingDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />

      {/* 头部区域容器 */}
      <div className="py-4 px-4 md:px-8 flex flex-col gap-y-4">
        {/* 标题和按钮的容器 */}
        <div className="flex items-center justify-between">
          {/* 页面标题 */}
          <h5 className="font-medium text-xl">我的会议</h5>
          {/* "新建会议 "按钮, 点击时调用 setIsDialogOpen(true) 来打开对话框 */}
          <Button onClick={() => setIsDialogOpen(true)}>
            {/* 按钮中的加号图标 */}
            <PlusIcon />
            新建会议
          </Button>
        </div>
      </div>

      {/* 筛选器区域的占位符 */}
      <div className="flex items-center gap-x-2 p-1">TODO: FILTERS</div>
    </>
  );
};
