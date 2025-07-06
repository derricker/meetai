// 导入 React 的 useState Hook，用于管理组件的局部状态。
import { useState } from "react";
// 导入 @tanstack/react-query 库的 useQuery Hook，用于数据获取和缓存。
import { useQuery } from "@tanstack/react-query";

// 导入 TRPC 客户端 Hook，用于与后端 TRPC 服务进行通信。
import { useTRPC } from "@/trpc/client";
// 导入自定义的 CommandSelect 组件，用于显示可搜索的选择框。
import { CommandSelect } from "@/components/command-select";
// 导入 GeneratedAvatar 组件，用于根据名称生成头像。
import { GeneratedAvatar } from "@/components/generated-avatar";

// 导入自定义的 useMeetingsFilters Hook，用于管理会议筛选状态。
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";

// 定义 AgentIdFilter 函数组件。
export const AgentIdFilter = () => {
  // 使用 useMeetingsFilters Hook 获取当前的筛选器状态 (filters) 和设置筛选器的方法 (setFilters)。
  const [filters, setFilters] = useMeetingsFilters();

  // 初始化 TRPC 客户端实例。
  const trpc = useTRPC();

  // 定义 agentSearch 状态，用于存储智能体搜索关键词。
  const [agentSearch, setAgentSearch] = useState("");
  // 使用 useQuery Hook 获取智能体列表数据，并根据 agentSearch 进行过滤。
  const { data } = useQuery(
    trpc.agents.getMany.queryOptions({
      pageSize: 100, // 每页获取 100 条数据。
      search: agentSearch, // 根据搜索关键词过滤智能体。
    })
  );

  // 组件渲染内容。
  return (
    // CommandSelect 组件，用于选择智能体。
    <CommandSelect
      // 选择框的样式，设置高度。
      className="h-9"
      // 选择框的占位符文本。
      placeholder="智能体"
      // 选项数组，通过映射后端返回的智能体数据生成。
      options={(data?.items ?? []).map((agent) => ({
        id: agent.id, // 选项的唯一标识。
        value: agent.id, // 选项的值。
        children: (
          // 选项的显示内容，包含智能体头像和名称。
          <div className="flex items-center gap-x-2">
            <GeneratedAvatar
              seed={agent.name} // 根据智能体名称生成头像。
              variant="botttsNeutral" // 头像样式。
              className="size-4" // 头像大小。
            />
            {agent.name}
          </div>
        ),
      }))}
      // 选中选项时的回调函数，更新筛选器状态中的 agentId 字段。
      onSelect={(value) => setFilters({ agentId: value })}
      // 搜索输入时的回调函数，更新 agentSearch 状态。
      onSearch={setAgentSearch}
      // 当前选中的值，如果 filters.agentId 为空，则默认为空字符串。
      value={filters.agentId ?? ""}
    />
  );
};
