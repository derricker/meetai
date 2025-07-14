// 导入React相关类型和钩子
import { Dispatch, SetStateAction, useState } from "react";

// 导入命令面板相关组件
import {
  CommandInput, // 命令输入框
  CommandItem, // 命令项
  CommandList, // 命令列表
  CommandGroup, // 命令分组
  CommandEmpty,
  CommandResponsiveDialog, // 空状态显示
} from "@/components/ui/command";
// 导入头像生成组件
import { GeneratedAvatar } from "@/components/generated-avatar";

// 导入tRPC客户端钩子，用于进行类型安全的API调用
import { useTRPC } from "@/trpc/client";
// 导入Next.js路由钩子，用于页面导航
import { useRouter } from "next/navigation";
// 导入React Query的useQuery钩子，用于数据获取和缓存管理
import { useQuery } from "@tanstack/react-query";

// 定义组件属性接口
interface Props {
  // 控制命令面板的显示状态
  open: boolean;
  // 设置命令面板显示状态的函数
  setOpen: Dispatch<SetStateAction<boolean>>;
}

// 导出仪表盘命令面板组件
export const DashboardCommand = ({ open, setOpen }: Props) => {
  // 管理搜索输入的状态
  const [search, setSearch] = useState("");

  // 初始化Next.js路由器实例，用于页面导航
  const router = useRouter();

  // 初始化tRPC客户端实例，用于类型安全的API调用
  const trpc = useTRPC();

  // 获取会议列表数据
  // 使用React Query的useQuery钩子发起请求
  // 根据搜索关键词筛选，每页显示100条数据
  const meetings = useQuery(
    trpc.meetings.getMany.queryOptions({
      search,
      pageSize: 100,
    })
  );

  // 获取智能体列表数据
  // 使用React Query的useQuery钩子发起请求
  // 根据搜索关键词筛选，每页显示100条数据
  const agents = useQuery(
    trpc.agents.getMany.queryOptions({
      search,
      pageSize: 100,
    })
  );

  return (
    // 命令对话框，根据open状态显示或隐藏
    <CommandResponsiveDialog
      shouldFilter={false}
      open={open}
      onOpenChange={setOpen}
    >
      {/* 搜索输入框 */}
      <CommandInput
        placeholder="查找会议或者智能体" // 占位文本
        value={search} // 输入值
        onValueChange={(value) => setSearch(value)} // 值变化处理函数
      />
      {/* 命令列表容器 */}
      <CommandList>
        {/* 会议相关命令分组 */}
        <CommandGroup heading="Meetings">
          {/* 无结果时显示的空状态 */}
          <CommandEmpty>
            <span className="text-muted-foreground text-sm">
              没有找到任何会议
            </span>
          </CommandEmpty>
          {/* 会议项示例 */}
          {meetings.data?.items.map((meeting) => (
            <CommandItem
              onSelect={() => {
                router.push(`/meetings/${meeting.id}`);
                setOpen(false);
              }}
              key={meeting.id}
            >
              {meeting.name}
            </CommandItem>
          ))}
        </CommandGroup>
        {/* 智能体相关命令分组 */}
        <CommandGroup heading="Agents">
          {/* 无结果时显示的空状态 */}
          <CommandEmpty>
            <span className="text-muted-foreground text-sm">
              没有找到任何智能体
            </span>
          </CommandEmpty>
          {/* 智能体项示例 */}
          {agents.data?.items.map((agent) => (
            <CommandItem
              onSelect={() => {
                router.push(`/agents/${agent.id}`);
                setOpen(false);
              }}
              key={agent.id}
            >
              <GeneratedAvatar
                seed={agent.name}
                variant="botttsNeutral"
                className="size-5"
              />
              {agent.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandResponsiveDialog>
  );
};
