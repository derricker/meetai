// 声明这是一个客户端组件, 它将在浏览器中执行
"use client";

// 从 lucide-react 库导入图标组件
// PlusIcon: 用于显示新增/添加的加号图标
// XCircleIcon: 用于显示带圆圈的 X 图标，通常用作清除/关闭按钮
import { PlusIcon, XCircleIcon } from "lucide-react";
// 导入自定义的 Button 组件
import { Button } from "@/components/ui/button";
// 导入新建会议的对话框组件
import { NewMeetingDialog } from "./new-meeting-dialog";
// 导入 React 的 useState hook, 用于管理组件的状态
import { useState } from "react";

// 导入会议搜索过滤器组件，用于实现会议搜索功能
import { MeetingsSearchFilter } from "./meetings-search-filter";
// 导入状态过滤器组件，用于根据会议状态进行筛选
import { StatusFilter } from "./status-filter";
// 导入代理ID过滤器组件，用于根据代理ID进行筛选
import { AgentIdFilter } from "./agent-id-filter";
// 导入自定义Hook，用于管理会议列表的过滤状态
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";
// 导入默认分页常量
import { DEFAULT_PAGE } from "@/constants";
// 导入滚动区域组件，用于处理横向滚动
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// 定义并导出 MeetingsListHeader 组件
export const MeetingsListHeader = () => {
  // 使用 useState hook 创建一个状态变量 isDialogOpen, 用于控制新建会议对话框的打开和关闭
  // setIsDialogOpen 是更新这个状态的函数
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 使用自定义Hook获取过滤器状态和更新函数
  // filters包含当前的过滤条件(status状态、search搜索词、agentId代理ID)
  // setFilters用于更新过滤条件
  const [filters, setFilters] = useMeetingsFilters();

  // 检查是否有任何过滤条件被修改
  // 使用双感叹号(!!)将值转换为布尔值
  // 如果status、search或agentId任一有值，则返回true
  const isAnyFilterModified =
    !!filters.status || !!filters.search || !!filters.agentId;

  // 清除所有过滤条件的处理函数
  const onClearFilters = () => {
    // 重置所有过滤条件到初始状态:
    // - status设为null表示不按状态筛选
    // - agentId设为空字符串表示不按代理筛选
    // - search设为空字符串表示清除搜索条件
    // - page重置为默认页码
    setFilters({
      status: null,
      agentId: "",
      search: "",
      page: DEFAULT_PAGE,
    });
  };

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
        {/* 使用 ScrollArea 组件创建可滚动区域，当内容超出视口宽度时显示滚动条 */}
        <ScrollArea>
          {/* 筛选器容器：使用 flex 布局，items-center 使子元素垂直居中对齐，gap-x-2 设置水平间距为 2 个单位，p-1 设置内边距 */}
          <div className="flex items-center gap-x-2 p-1">
            {/* 会议搜索过滤器组件：用于输入关键词搜索会议 */}
            <MeetingsSearchFilter />
            {/* 状态过滤器组件：用于按会议状态进行筛选 */}
            <StatusFilter />
            {/* 代理ID过滤器组件：用于按代理ID进行筛选 */}
            <AgentIdFilter />
            {/* 当存在任何过滤条件时显示清除按钮 */}
            {isAnyFilterModified && (
              /* 清除按钮：使用 outline 样式变体，点击时触发 onClearFilters 函数 */
              <Button variant="outline" onClick={onClearFilters}>
                {/* 清除图标：使用 XCircleIcon，设置大小为 4 个单位 */}
                <XCircleIcon className="size-4" />
                清除
              </Button>
            )}
          </div>
          {/* 水平滚动条组件：当内容超出容器宽度时显示 */}
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </>
  );
};
