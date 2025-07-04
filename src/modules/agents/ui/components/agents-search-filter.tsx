// 从 lucide-react 图标库导入搜索图标组件
import { SearchIcon } from "lucide-react";

// 导入 UI 组件库中的输入框组件
import { Input } from "@/components/ui/input";

// 导入自定义的代理过滤器 Hook, 用于管理搜索状态
import { useAgentsFilters } from "../../hooks/use-agents-filters";

/**
 * AgentsSearchFilter - 智能体搜索过滤器组件
 *
 * 这是一个用于智能体列表页面的搜索过滤器组件。
 * 主要功能：
 * 1. 提供搜索输入框, 允许用户输入关键词过滤代理列表
 * 2. 集成搜索图标, 提升用户体验
 * 3. 与 URL 查询参数同步, 支持状态持久化和分享
 * 4. 实时搜索, 用户输入时立即更新过滤条件
 *
 * @returns {JSX.Element} 返回搜索过滤器的 JSX 元素
 */
export const AgentsSearchFilter = () => {
  // 使用自定义 Hook 获取当前的过滤器状态和更新函数
  // filters: 包含当前搜索关键词和页码的对象
  // setFilters: 用于更新过滤器状态的函数，会自动同步到 URL
  const [filters, setFilters] = useAgentsFilters();

  return (
    // 外层容器，使用相对定位为搜索图标提供定位基准
    <div className="relative">
      {/* 搜索输入框 */}
      <Input
        // 占位符文本，提示用户输入内容
        placeholder="根据智能体名称过滤"
        // 样式类名：
        // h-9: 设置高度为 36px
        // bg-white: 白色背景
        // w-[200px]: 固定宽度 200px
        // pl-7: 左内边距 28px，为搜索图标留出空间
        className="h-9 bg-white w-[200px] pl-7"
        // 受控组件：输入框的值绑定到过滤器状态中的搜索关键词
        value={filters.search}
        // 输入变化处理函数：
        // 当用户输入时，更新搜索关键词
        // 这会触发 URL 更新和列表重新过滤
        onChange={(e) => setFilters({ search: e.target.value })}
      />
      {/* 搜索图标 */}
      <SearchIcon
        // 样式类名：
        // size-4: 设置图标大小为 16x16px
        // absolute: 绝对定位
        // left-2: 距离左边 8px
        // top-1/2: 距离顶部 50%
        // -translate-y-1/2: 向上偏移自身高度的 50%，实现垂直居中
        // text-muted-foreground: 使用主题中的次要文字颜色
        className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
};
