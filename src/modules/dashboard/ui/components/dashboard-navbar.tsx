// 声明这是一个客户端组件
"use client";

// 导入React钩子
import { useEffect, useState } from "react";
// 导入图标组件
import { PanelLeftCloseIcon, PanelLeftIcon, SearchIcon } from "lucide-react";

// 导入UI组件
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

// 导入命令面板组件
import { DashboardCommand } from "./dashboard-command";

// 导出仪表盘导航栏组件
export const DashboardNavbar = () => {
  // 使用侧边栏钩子获取状态和控制方法
  const { state, toggleSidebar, isMobile } = useSidebar();
  // 控制命令面板的显示状态
  const [commandOpen, setCommandOpen] = useState(false);

  // 添加键盘快捷键监听
  useEffect(() => {
    // 处理键盘按下事件
    const down = (e: KeyboardEvent) => {
      // 当按下 Cmd+K 或 Ctrl+K 时
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault(); // 阻止默认行为
        setCommandOpen((open) => !open); // 切换命令面板的显示状态
      }
    };

    // 添加事件监听器
    document.addEventListener("keydown", down);
    // 清理函数：移除事件监听器
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      {/* 渲染命令面板组件 */}
      <DashboardCommand open={commandOpen} setOpen={setCommandOpen} />
      {/* 导航栏 */}
      <nav className="flex px-4 gap-x-2 items-center py-3 border-b bg-background">
        {/* 侧边栏切换按钮 */}
        <Button className="size-9" variant="outline" onClick={toggleSidebar}>
          {/* 根据侧边栏状态和设备类型显示不同的图标 */}
          {state === "collapsed" || isMobile ? (
            <PanelLeftIcon className="size-4" />
          ) : (
            <PanelLeftCloseIcon className="size-4" />
          )}
        </Button>
        {/* 搜索按钮 */}
        <Button
          className="h-9 w-[240px] justify-start font-normal text-muted-foreground hover:text-muted-foreground"
          variant="outline"
          size="sm"
          onClick={() => setCommandOpen((open) => !open)}
        >
          <SearchIcon />
          搜索
          {/* 显示快捷键提示 */}
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">&#8984;</span>K
          </kbd>
        </Button>
      </nav>
    </>
  );
};
