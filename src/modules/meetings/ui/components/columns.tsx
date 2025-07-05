// 声明这是一个客户端组件，它将在浏览器中执行
"use client";

// 导入 date-fns 库中的 format 函数，用于格式化日期
import { format } from "date-fns";
// 从 @tanstack/react-table 导入 ColumnDef 类型，用于定义表格的列
import { ColumnDef } from "@tanstack/react-table";
// 导入 lucide-react 中的图标组件
import {
  CircleCheckIcon, // 圆形勾选图标
  CircleXIcon, // 圆形叉号图标
  ClockArrowUpIcon, // 时钟向上箭头图标
  ClockFadingIcon, // 时钟渐隐图标
  CornerDownRightIcon, // 右下角转角箭头图标
  LoaderIcon, // 加载中图标
} from "lucide-react";

// 导入工具函数 cn 和 formatDuration
import { cn, formatDuration } from "@/lib/utils";
// 导入自定义的 Badge 组件
import { Badge } from "@/components/ui/badge";
// 导入生成的头像组件
import { GeneratedAvatar } from "@/components/generated-avatar";

// 导入会议列表的类型定义
import { MeetingGetMany } from "../../types";

// 定义状态与图标的映射关系
const statusIconMap = {
  upcoming: ClockArrowUpIcon, // 即将开始
  active: LoaderIcon, // 进行中
  completed: CircleCheckIcon, // 已完成
  processing: LoaderIcon, // 处理中
  cancelled: CircleXIcon, // 已取消
};

// 定义状态与颜色的映射关系，用于设置 Badge 的样式
const statusColorMap = {
  upcoming: "bg-yellow-500/20 text-yellow-800 border-yellow-800/5",
  active: "bg-blue-500/20 text-blue-800 border-blue-800/5",
  completed: "bg-emerald-500/20 text-emerald-800 border-emerald-800/5",
  cancelled: "bg-rose-500/20 text-rose-800 border-rose-800/5",
  processing: "bg-gray-300/20 text-gray-800 border-gray-800/5",
};

// 定义并导出表格的列配置
// ColumnDef 的泛型参数是行数据的类型
export const columns: ColumnDef<MeetingGetMany[number]>[] = [
  {
    accessorKey: "name", // 关联数据源中的 'name' 字段
    header: "会议名称", // 列头显示的文本
    cell: (
      { row } // 自定义单元格的渲染方式
    ) => (
      <div className="flex flex-col gap-y-1">
        <span className="font-semibold capitalize">{row.original.name}</span>
        <div className="flex items-center gap-x-2">
          <div className="flex items-center gap-x-1">
            <CornerDownRightIcon className="size-3 text-muted-foreground" />
            <span className="text-sm text-muted-foreground max-w-[200px] truncate capitalize">
              {row.original.agent.name} {/* 显示关联的智能体名称 */}
            </span>
          </div>
          <GeneratedAvatar
            variant="botttsNeutral"
            seed={row.original.agent.name} // 使用智能体名称作为头像生成的种子
            className="size-4"
          />
          <span className="text-sm text-muted-foreground">
            {/* 如果有开始时间，则格式化并显示 */}
            {row.original.startedAt
              ? format(row.original.startedAt, "MMM d")
              : ""}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "status", // 关联数据源中的 'status' 字段
    header: "会议状态",
    cell: ({ row }) => {
      // 根据当前行的状态获取对应的图标组件
      const Icon =
        statusIconMap[row.original.status as keyof typeof statusIconMap];

      return (
        <Badge
          variant="outline"
          className={cn(
            "capitalize [&>svg]:size-4 text-muted-foreground", // 基本样式
            statusColorMap[row.original.status as keyof typeof statusColorMap] // 根据状态应用不同的颜色样式
          )}
        >
          <Icon
            className={cn(
              // 如果状态是 'processing'，添加旋转动画
              row.original.status === "processing" && "animate-spin"
            )}
          />
          {row.original.status} {/* 显示状态文本 */}
        </Badge>
      );
    },
  },
  {
    accessorKey: "duration", // 关联数据源中的 'duration' 字段
    header: "会议时长",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="capitalize [&>svg]:size-4 flex items-center gap-x-2"
      >
        <ClockFadingIcon className="text-blue-700" />
        {/* 如果有持续时间，则格式化显示，否则显示 '无时长' */}
        {row.original.duration
          ? formatDuration(row.original.duration)
          : "无时长"}
      </Badge>
    ),
  },
];
