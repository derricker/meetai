"use client";

// 从 @tanstack/react-table 导入列定义类型
import { ColumnDef } from "@tanstack/react-table";
// 导入智能体数据类型定义
import { AgentGetOne } from "../../types";
// 导入生成头像组件
import { GeneratedAvatar } from "@/components/generated-avatar";
// 从 lucide-react 导入图标组件
import { CornerDownRightIcon, VideoIcon } from "lucide-react";
// 导入徽章组件
import { Badge } from "@/components/ui/badge";

/**
 * 智能体表格的列定义配置
 * 定义了表格中每一列的结构、标题和渲染方式
 */
export const columns: ColumnDef<AgentGetOne>[] = [
  {
    // 数据访问键, 对应 AgentGetOne 类型中的 name 字段
    accessorKey: "name",
    // 列标题显示文本
    header: "智能体",
    // 自定义单元格渲染函数
    cell: ({ row }) => (
      // 垂直布局容器, 包含智能体名称和说明
      <div className="flex flex-col gap-y-1">
        {/* 智能体名称行: 包含头像和名称 */}
        <div className="flex items-center gap-x-2">
          {/* 生成的头像组件 */}
          <GeneratedAvatar
            variant="botttsNeutral" // 头像风格: 中性机器人风格
            seed={row.original.name} // 使用智能体名称作为头像生成种子
            className="size-6" // 头像尺寸: 6x6
          />
          {/* 智能体名称: 加粗显示, 首字母大写 */}
          <span className="font-semibold capitalize">{row.original.name}</span>
        </div>
        {/* 智能体说明行: 包含缩进图标和说明文字 */}
        <div className="flex items-center gap-x-2">
          {/* 缩进指示图标: 表示这是子级信息 */}
          <CornerDownRightIcon className="size-3 text-muted-foreground" />
          {/* 智能体说明文字: 弱化颜色, 限制宽度并截断过长文本 */}
          <span className="text-sm text-muted-foreground max-w-[200px] truncate capitalize">
            {row.original.instructions}
          </span>
        </div>
      </div>
    ),
  },
  {
    // 数据访问键, 对应会议数量字段
    accessorKey: "meetingCount",
    // 列标题显示文本
    header: "会议",
    // 自定义单元格渲染函数
    cell: ({ row }) => (
      // 徽章组件: 显示会议相关信息
      <Badge
        // 徽章样式: 轮廓样式
        variant="outline"
        // 水平布局, 图标尺寸4x4
        className="flex items-center gap-x-2 [&>svg]:size-4"
      >
        {/* 视频会议图标：蓝色 */}
        <VideoIcon className="text-blue-700" />
        {row.original.meetingCount} 会议
      </Badge>
    ),
  },
];
