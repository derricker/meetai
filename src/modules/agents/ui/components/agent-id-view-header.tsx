// 导入 Next.js 的 Link 组件，用于客户端路由导航
import Link from "next/link";
// 从 lucide-react 库导入图标组件
import {
  ChevronRightIcon, // 右V形图标，通常用作面包屑分隔符
  TrashIcon, // 垃圾桶图标，用于删除操作
  PencilIcon, // 铅笔图标，用于编辑操作
  MoreVerticalIcon, // 垂直三点图标，用于打开更多选项菜单
} from "lucide-react";

// 导入自定义的 Button UI 组件
import { Button } from "@/components/ui/button";
// 导入自定义的 DropdownMenu 相关组件，用于创建下拉菜单
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
// 导入自定义的 Breadcrumb 相关组件, 用于创建面包屑导航
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// 定义组件的 Props 接口
interface Props {
  agentId: string; // 智能体的唯一标识符
  agentName: string; // 智能体的名称
  onEdit: () => void; // 编辑按钮的点击事件处理函数
  onRemove: () => void; // 删除按钮的点击事件处理函数
}

// AgentIdViewHeader 组件, 用于显示智能体详细信息页面的头部
export const AgentIdViewHeader = ({
  agentId,
  agentName,
  onEdit,
  onRemove,
}: Props) => {
  return (
    // 根容器, 使用 flexbox 进行布局, 子元素垂直居中并两端对齐
    <div className="flex items-center justify-between">
      {/* 面包屑导航组件 */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            {/* 面包屑链接项，链接到“我的智能体”页面 */}
            <BreadcrumbLink asChild className="font-medium text-xl">
              <Link href="/agents">我的智能体</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {/* 面包屑分隔符 */}
          <BreadcrumbSeparator className="text-foreground text-xl font-medium [&>svg]:size-4">
            <ChevronRightIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            {/* 当前智能体页面的面包屑链接项, 不可点击 */}
            <BreadcrumbLink
              asChild
              className="font-medium text-xl text-foreground"
            >
              <Link href={`/agents/${agentId}`}>{agentName}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {/* 下拉菜单组件，modal={false} 允许在菜单打开时与页面其他部分交互 */}
      <DropdownMenu modal={false}>
        {/* 菜单触发器，这里是一个带有“更多”图标的按钮 */}
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">
            <MoreVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        {/* 菜单内容，align="end" 表示菜单向右对齐 */}
        <DropdownMenuContent align="end">
          {/* 编辑菜单项 */}
          <DropdownMenuItem onClick={onEdit}>
            <PencilIcon className="size-4 text-black" />
            编辑
          </DropdownMenuItem>
          {/* 删除菜单项 */}
          <DropdownMenuItem onClick={onRemove}>
            <TrashIcon className="size-4 text-black" />
            删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
