// 从 lucide-react 库中导入所需的图标组件。
import {
  CircleXIcon,
  CircleCheckIcon,
  ClockArrowUpIcon,
  VideoIcon,
  LoaderIcon,
} from "lucide-react";

// 导入自定义的 CommandSelect 组件，用于显示可搜索的选择框。
import { CommandSelect } from "@/components/command-select";

// 导入 MeetingStatus 枚举类型和 useMeetingsFilters Hook。
import { MeetingStatus } from "../../types";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";

// 定义筛选选项数组，每个选项包含 id, value 和 children（用于渲染显示内容）。
const options = [
  {
    id: MeetingStatus.Upcoming,
    value: MeetingStatus.Upcoming,
    children: (
      // 即将开始会议的显示内容，包含一个时钟图标和状态文本。
      <div className="flex items-center gap-x-2 capitalize">
        <ClockArrowUpIcon />
        {MeetingStatus.Upcoming}
      </div>
    ),
  },
  {
    id: MeetingStatus.Completed,
    value: MeetingStatus.Completed,
    children: (
      // 已完成会议的显示内容，包含一个对勾图标和状态文本。
      <div className="flex items-center gap-x-2 capitalize">
        <CircleCheckIcon />
        {MeetingStatus.Completed}
      </div>
    ),
  },
  {
    id: MeetingStatus.Active,
    value: MeetingStatus.Active,
    children: (
      // 活跃会议的显示内容，包含一个视频图标和状态文本。
      <div className="flex items-center gap-x-2 capitalize">
        <VideoIcon />
        {MeetingStatus.Active}
      </div>
    ),
  },
  {
    id: MeetingStatus.Processing,
    value: MeetingStatus.Processing,
    children: (
      // 处理中会议的显示内容，包含一个加载图标和状态文本。
      <div className="flex items-center gap-x-2 capitalize">
        <LoaderIcon />
        {MeetingStatus.Processing}
      </div>
    ),
  },
  {
    id: MeetingStatus.Cancelled,
    value: MeetingStatus.Cancelled,
    children: (
      // 已取消会议的显示内容，包含一个叉号图标和状态文本。
      <div className="flex items-center gap-x-2 capitalize">
        <CircleXIcon />
        {MeetingStatus.Cancelled}
      </div>
    ),
  },
];

// 定义 StatusFilter 函数组件。
export const StatusFilter = () => {
  // 使用 useMeetingsFilters Hook 获取当前的筛选器状态 (filters) 和设置筛选器的方法 (setFilters)。
  const [filters, setFilters] = useMeetingsFilters();

  // 组件渲染内容。
  return (
    // CommandSelect 组件，用于选择会议状态。
    <CommandSelect
      // 选择框的占位符文本。
      placeholder="会议状态"
      // 选择框的样式，设置高度。
      className="h-9"
      // 传递预定义的选项数组。
      options={options}
      // 选中选项时的回调函数，更新筛选器状态中的 status 字段。
      onSelect={(value) => setFilters({ status: value as MeetingStatus })}
      // 当前选中的值，如果 filters.status 为空，则默认为空字符串。
      value={filters.status ?? ""}
    />
  );
};
