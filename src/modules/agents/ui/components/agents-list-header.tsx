// "use client" 指令声明这是一个客户端组件。在 Next.js App Router 中，
// 这意味着该组件将在浏览器中渲染，并且可以使用客户端独有的功能，如 state 和 effects。
"use client";

// 从 lucide-react 库导入 PlusIcon 组件，用于显示一个加号图标。
import { PlusIcon, XCircleIcon } from "lucide-react";
// 从自定义的 UI 组件库中导入 Button 组件。
import { Button } from "@/components/ui/button";
// 从当前目录下的 new-agent-dialog 文件导入 NewAgentDialog 组件。
import { NewAgentDialog } from "./new-agent-dialog";
// 从 React 导入 useState hook，用于在函数组件中添加和管理状态。
import { useState } from "react";

// 导入智能体过滤器钩子，用于管理列表筛选状态
import { useAgentsFilters } from "../../hooks/use-agents-filters";
// 导入默认页码常量
import { DEFAULT_PAGE } from "@/constants";
// 导入智能体搜索过滤器组件
import { AgentsSearchFilter } from "./agents-search-filter";
/**
 * AgentsListHeader 组件
 * 这个组件负责渲染智能体列表页面的头部区域
 * 包括标题和一个用于打开"创建新智能体"对话框的按钮
 */
export const AgentsListHeader = () => {
  // 获取过滤条件状态和修改状态的方法
  const [filters, setFilters] = useAgentsFilters();
  // 使用 useState 创建一个状态变量 isDialogOpen 来控制对话框的打开和关闭
  // setIsDialogOpen 是更新这个状态的函数, 初始值为 false (关闭)
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 检查是否有任何过滤条件被修改 (当前仅检查搜索条件是否存在)
  const isAnyFilterModified = !!filters.search;

  // 清除所有过滤条件的处理函数
  const onClearFilters = () => {
    setFilters({
      search: "", // 清空搜索内容
      page: DEFAULT_PAGE, // 重置页码到默认值
    });
  };

  return (
    <>
      {/* 
        渲染"创建新智能体"对话框组件
        open 属性绑定到 isDialogOpen 状态, 控制对话框的显示与隐藏
        onOpenChange 属性接收一个回调函数, 当对话框的打开状态发生变化时这个函数会被调用, 从而更新 isDialogOpen 状态
      */}
      <NewAgentDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />

      {/* 头部区域的容器，设置了内边距和 flex 布局 */}
      <div className="py-4 px-4 md:px-8 flex flex-col gap-y-4">
        {/* 标题和按钮的容器，使用 flex 布局实现水平对齐和两端对齐 */}
        <div className="flex items-center justify-between">
          {/* 页面主标题 */}
          <h5 className="font-medium text-xl">我的智能体</h5>
          {/* “创建新智能体”按钮 */}
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusIcon /> {/* 按钮内的加号图标 */}
            创建新智能体
          </Button>
        </div>
        {/* 搜索过滤器区域，使用flex布局并设置间距 */}
        <div className="flex items-center gap-x-2 p-1">
          {/* 渲染智能体搜索过滤器组件 */}
          <AgentsSearchFilter />
          {/* 当有过滤条件被修改时，显示清除按钮 */}
          {isAnyFilterModified && (
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              <XCircleIcon /> {/* 显示X形圆圈图标 */}
              清除
            </Button>
          )}
        </div>
      </div>
    </>
  );
};
