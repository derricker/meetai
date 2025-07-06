// 导入 Next.js 的 Link 组件，用于客户端路由导航。
import Link from "next/link";
// 导入 Lucide React 库中的图标组件。
import {
  ChevronRightIcon,
  TrashIcon,
  PencilIcon,
  MoreVerticalIcon,
} from "lucide-react";

// 导入自定义的 Button 组件。
import { Button } from "@/components/ui/button";
// 导入自定义的 DropdownMenu 相关组件，用于创建下拉菜单。
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
// 导入自定义的 Breadcrumb 相关组件，用于创建面包屑导航。
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// 定义组件的 Props 接口。
interface Props {
  meetingId: string; // 会议的唯一标识符。
  meetingName: string; // 会议的名称。
  onEdit: () => void; // 编辑按钮点击时的回调函数。
  onRemove: () => void; // 删除按钮点击时的回调函数。
}

// 定义 MeetingIdViewHeader 函数组件。
export const MeetingIdViewHeader = ({
  meetingId,
  meetingName,
  onEdit,
  onRemove,
}: Props) => {
  return (
    // 头部容器，使用 flex 布局，并使子项在主轴上两端对齐。
    <div className="flex items-center justify-between">
      {/* 面包屑导航组件 */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            {/* 面包屑链接，指向“我的会议”页面 */}
            <BreadcrumbLink asChild className="font-medium text-xl">
              <Link href="/meetings">我的会议</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {/* 面包屑分隔符 */}
          <BreadcrumbSeparator className="text-foreground text-xl font-medium [&>svg]:size-4">
            <ChevronRightIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            {/* 面包屑链接，指向当前会议详情页面 */}
            <BreadcrumbLink
              asChild
              className="font-medium text-xl text-foreground"
            >
              <Link href={`/meetings/${meetingId}`}>{meetingName}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {/* 下拉菜单，用于显示编辑和删除选项。modal={false} 避免对话框导致页面不可点击的问题。 */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          {/* 触发下拉菜单的按钮 */}
          <Button variant="ghost">
            <MoreVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        {/* 下拉菜单内容 */}
        <DropdownMenuContent align="end">
          {/* 编辑选项 */}
          <DropdownMenuItem onClick={onEdit}>
            <PencilIcon className="size-4 text-black" />
            编辑
          </DropdownMenuItem>
          {/* 删除选项 */}
          <DropdownMenuItem onClick={onRemove}>
            <TrashIcon className="size-4 text-black" />
            删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
