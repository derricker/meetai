// 导入 Lucide React 库中的 SearchIcon 组件，用于显示搜索图标。
import { SearchIcon } from "lucide-react";

// 导入自定义的 Input 组件，通常是基于 Shadcn UI 或类似库的封装。
import { Input } from "@/components/ui/input";

// 导入自定义的 useMeetingsFilters Hook，用于管理会议筛选状态。
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";

// 定义 MeetingsSearchFilter 函数组件。
export const MeetingsSearchFilter = () => {
  // 使用 useMeetingsFilters Hook 获取当前的筛选器状态 (filters) 和设置筛选器的方法 (setFilters)。
  const [filters, setFilters] = useMeetingsFilters();

  // 组件渲染内容。
  return (
    // 搜索输入框的容器，使用相对定位以便于图标的绝对定位。
    <div className="relative">
      {/* 搜索输入框组件 */}
      <Input
        // 输入框的占位符文本。
        placeholder="根据会议名称过滤"
        // 输入框的样式，包括高度、背景色、宽度和左侧内边距（为图标留出空间）。
        className="h-9 bg-white w-[200px] pl-7"
        // 输入框的值，绑定到筛选器状态中的 search 字段。
        value={filters.search}
        // 输入框内容变化时的回调函数，更新筛选器状态中的 search 字段。
        onChange={(e) => setFilters({ search: e.target.value })}
      />
      {/* 搜索图标，绝对定位在输入框内部的左侧垂直居中位置。 */}
      <SearchIcon className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
};
