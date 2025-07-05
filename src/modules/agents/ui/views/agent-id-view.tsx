// "use client" 指令将此组件标记为客户端组件, 这意味着它将在浏览器中渲染和执行
"use client";

// 导入自定义的错误状态组件, 用于显示错误信息
import { ErrorState } from "@/components/error-state";
// 导入头像生成组件, 用于根据种子生成一个独特的头像
import { GeneratedAvatar } from "@/components/generated-avatar";
// 导入自定义的加载状态组件, 用于显示加载指示器
import { LoadingState } from "@/components/loading-state";
// 导入 UI 库中的 Badge 组件, 用于显示徽章或标签
import { Badge } from "@/components/ui/badge";
// 导入 tRPC 的客户端钩子, 用于在客户端组件中进行 API 调用
import { useTRPC } from "@/trpc/client";
// 导入 @tanstack/react-query 的 useSuspenseQuery 钩子, 它与 React Suspense 集成, 用于数据获取
import { useSuspenseQuery } from "@tanstack/react-query";
// 从 lucide-react 库导入视频图标
import { VideoIcon } from "lucide-react";
// 导入此视图专用的头部组件
import { AgentIdViewHeader } from "../components/agent-id-view-header";

// 定义组件的 Props 接口
interface Props {
  // agentId 是一个字符串，代表当前查看的智能体的唯一标识符
  agentId: string;
}

// AgentIdView 组件, 用于显示单个智能体的详细信息
export const AgentIdView = ({ agentId }: Props) => {
  // 初始化 tRPC 客户端
  const trpc = useTRPC();
  // 使用 useSuspenseQuery 从 tRPC 的 agents.getOne 端点获取数据
  // 这个钩子会触发 React Suspense，直到数据加载完成
  const { data } = useSuspenseQuery(
    trpc.agents.getOne.queryOptions({ id: agentId })
  );
  // 渲染组件的 JSX
  return (
    <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
      {/* 渲染视图头部, 传入 agentId、名称以及编辑和移除操作的回调函数 */}
      <AgentIdViewHeader
        agentId={agentId}
        agentName={data.name}
        onEdit={() => {}}
        onRemove={() => {}}
      />
      {/* 主内容区域, 白色背景、圆角和边框 */}
      <div className="bg-white rounded-lg border">
        <div className="px-4 py-5 gap-y-5 flex flex-col col-span-5">
          <div className="flex items-center gap-x-3">
            {/* 显示生成的头像 */}
            <GeneratedAvatar
              variant="botttsNeutral"
              // 使用智能体名称作为生成头像的种子
              seed={data.name}
              className="size-10"
            />
            {/* 显示智能体名称 */}
            <h2 className="text-2xl font-medium">{data.name}</h2>
          </div>
          {/* 显示会议数量的徽章 */}
          <Badge
            variant="outline"
            className="flex items-center gap-x-2 [&>svg]:size-4"
          >
            <VideoIcon className="text-blue-700" />5 会议
          </Badge>
          {/* 显示智能体的指令部分 */}
          <div className="flex flex-col gap-y-4">
            <p className="text-lg font-medium">Instructions</p>
            <p className="text-neutral-800">{data.instructions}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// AgentIdViewLoading 组件, 用作 AgentIdView 的加载状态后备 UI
export const AgentIdViewLoading = () => {
  return (
    <LoadingState title="正在加载智能体" description="这可能需要一点时间" />
  );
};

// AgentIdViewError 组件, 用作 AgentIdView 的错误状态后备 UI
export const AgentIdViewError = () => {
  return <ErrorState title="智能体加载失败" description="发生了错误" />;
};
