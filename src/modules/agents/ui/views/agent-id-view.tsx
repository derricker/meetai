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
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
// 从 lucide-react 库导入视频图标
import { VideoIcon } from "lucide-react";
// 导入此视图专用的头部组件
import { AgentIdViewHeader } from "../components/agent-id-view-header";

// 导入 Next.js 的路由钩子，用于客户端导航
import { useRouter } from "next/navigation";
// 导入 sonner 库的 toast 函数，用于显示通知
import { toast } from "sonner";
// 导入自定义的 useConfirm 钩子，用于显示确认对话框
import { useConfirm } from "@/hooks/use-confirm";
// 导入 React 的 useState 钩子，用于在组件中管理状态
import { useState } from "react";
// 导入更新智能体对话框组件
import { UpdateAgentDialog } from "../components/update-agent-dialog";

// 定义组件的 Props 接口
interface Props {
  // agentId 是一个字符串，代表当前查看的智能体的唯一标识符
  agentId: string;
}

// AgentIdView 组件, 用于显示单个智能体的详细信息
export const AgentIdView = ({ agentId }: Props) => {
  // 初始化路由
  const router = useRouter();
  // 获取 react-query 的客户端实例，用于手动操作缓存
  const queryClient = useQueryClient();
  // 初始化 tRPC 客户端
  const trpc = useTRPC();
  // 使用 useSuspenseQuery 从 tRPC 的 agents.getOne 端点获取数据
  // 这个钩子会触发 React Suspense，直到数据加载完成
  const { data } = useSuspenseQuery(
    trpc.agents.getOne.queryOptions({ id: agentId })
  );
  // 使用 useState 钩子定义一个状态变量 updateAgentDialogOpen，
  // 用于控制更新智能体对话框的打开和关闭状态，初始值为 false (关闭)
  const [updateAgentDialogOpen, setUpdateAgentDialogOpen] = useState(false);

  // 使用 useMutation 钩子创建删除智能体的操作
  const removeAgent = useMutation(
    trpc.agents.remove.mutationOptions({
      // 删除成功后的回调函数
      onSuccess: async () => {
        // 使缓存中的智能体列表查询失效，强制重新获取最新数据
        await queryClient.invalidateQueries(
          trpc.agents.getMany.queryOptions({})
        );
        // 使免费使用额度的查询失效, 触发重新获取最新的使用情况数据
        await queryClient.invalidateQueries(
          trpc.premium.getFreeUsage.queryOptions()
        );
        // 删除成功后跳转到智能体列表页面
        router.push("/agents");
      },
      // 删除失败时的错误处理
      onError: (error) => {
        // 显示错误提示信息
        toast.error(error.message);
      },
    })
  );

  // 使用 useConfirm 钩子创建一个确认对话框实例
  // 第一个参数是对话框的标题
  // 第二个参数是对话框的描述，这里使用了模板字符串动态插入智能体名称
  const [RemoveConfirmation, confirmRemove] = useConfirm(
    "确认删除",
    `确认删除智能体 ${data.name} 吗?`
  );

  // 定义处理移除智能体操作的异步函数
  const handleRemoveAgent = async () => {
    // 调用 confirmRemove 函数显示确认对话框，并等待用户操作
    const ok = await confirmRemove();

    // 如果用户点击了取消 (ok 为 false)，则直接返回，不执行任何操作
    if (!ok) return;

    // 如果用户确认，则调用 removeAgent 的 mutateAsync 方法来执行删除操作
    await removeAgent.mutateAsync({ id: agentId });
  };

  // 渲染组件的 JSX
  return (
    <>
      {/* 渲染移除确认对话框组件 */}
      <RemoveConfirmation />
      {/* 渲染更新智能体对话框组件 */}
      <UpdateAgentDialog
        // 将对话框的打开状态与 state 绑定
        open={updateAgentDialogOpen}
        // 当对话框状态改变时，更新 state
        onOpenChange={setUpdateAgentDialogOpen}
        // 传入智能体的当前数据作为表单的初始值
        initialValues={data}
      />
      <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
        {/* 渲染视图头部, 传入 agentId、名称以及编辑和移除操作的回调函数 */}
        <AgentIdViewHeader
          agentId={agentId}
          agentName={data.name}
          // 点击编辑按钮时, 将 updateAgentDialogOpen 状态设置为 true，从而打开对话框
          onEdit={() => setUpdateAgentDialogOpen(true)}
          onRemove={handleRemoveAgent}
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
    </>
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
