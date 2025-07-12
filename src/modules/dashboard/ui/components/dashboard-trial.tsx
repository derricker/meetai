// 导入 Next.js 的 Link 组件，用于客户端路由导航
import Link from "next/link";
// 导入 lucide-react 图标库中的火箭图标
import { RocketIcon } from "lucide-react";
// 导入 TanStack Query 的 useQuery hook，用于数据获取和缓存
import { useQuery } from "@tanstack/react-query";

// 导入自定义的 tRPC 客户端 hook
import { useTRPC } from "@/trpc/client";
// 导入 UI 组件：按钮组件
import { Button } from "@/components/ui/button";
// 导入 UI 组件：进度条组件
import { Progress } from "@/components/ui/progress";

// 导入免费用户的限制常量
import {
  MAX_FREE_AGENTS, // 免费用户最大智能体数量
  MAX_FREE_MEETINGS, // 免费用户最大会议数量
} from "@/modules/premium/constants";

// 导出仪表板试用版组件
export const DashboardTrial = () => {
  // 获取 tRPC 客户端实例
  const trpc = useTRPC();
  // 使用 useQuery 获取免费用户的使用情况数据
  const { data } = useQuery(trpc.premium.getFreeUsage.queryOptions());

  // 如果没有数据，则不渲染任何内容
  if (!data) return null;

  return (
    // 主容器：带有边框、圆角、半透明背景的卡片样式
    <div className="border border-border/10 rounded-lg w-full bg-white/5 flex flex-col gap-y-2">
      {/* 内容区域：包含标题和进度条 */}
      <div className="p-3 flex flex-col gap-y-4">
        {/* 标题区域：包含火箭图标和"免费额度"文字 */}
        <div className="flex items-center gap-2">
          <RocketIcon className="size-4" />
          <p className="text-sm font-medium">免费额度</p>
        </div>

        {/* 智能体使用情况显示区域 */}
        <div className="flex flex-col gap-y-2">
          {/* 显示当前智能体数量/最大智能体数量 */}
          <p className="text-xs">
            {data.agentCount}/{MAX_FREE_AGENTS} 智能体
          </p>
          {/* 智能体使用进度条，计算使用百分比 */}
          <Progress value={(data.agentCount / MAX_FREE_AGENTS) * 100} />
        </div>

        {/* 会议使用情况显示区域 */}
        <div className="flex flex-col gap-y-2">
          {/* 显示当前会议数量/最大会议数量 */}
          <p className="text-xs">
            {data.meetingCount}/{MAX_FREE_MEETINGS} 会议
          </p>
          {/* 会议使用进度条，计算使用百分比 */}
          <Progress value={(data.meetingCount / MAX_FREE_MEETINGS) * 100} />
        </div>
      </div>

      {/* 升级按钮：透明背景，顶部边框，悬停时背景变亮 */}
      <Button
        className="bg-transparent border-t border-border/10 hover:bg-white/10 rounded-t-none"
        asChild // 使用 asChild 属性，让 Button 组件将其样式应用到子元素上
      >
        {/* 链接到升级页面 */}
        <Link href="/upgrade">升级</Link>
      </Button>
    </div>
  );
};
