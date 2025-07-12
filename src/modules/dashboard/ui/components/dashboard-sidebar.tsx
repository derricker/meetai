// 声明这是一个客户端组件
"use client";

// 导入必要的Next.js组件和hooks
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
// 导入需要使用的图标组件
import { BotIcon, StarIcon, VideoIcon } from "lucide-react";
// 导入工具函数和UI组件
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// 导入用户按钮组件
import { DashboardUserButton } from "./dashboard-user-button";

// 导入试用版组件, 用于显示用户试用状态和相关信息
import { DashboardTrial } from "./dashboard-trial";

// 定义侧边栏第一部分的导航项配置
const firstSection = [
  {
    icon: VideoIcon,
    label: "会议",
    href: "/meetings",
  },
  {
    icon: BotIcon,
    label: "智能体",
    href: "/agents",
  },
];

// 定义侧边栏第二部分的导航项配置
const secondSection = [
  {
    icon: StarIcon,
    label: "升级",
    href: "/upgrade",
  },
];

// 导出仪表盘侧边栏组件
export const DashboardSidebar = () => {
  // 获取当前路径, 用于高亮当前激活的导航项
  const pathname = usePathname();

  return (
    // 侧边栏容器，设置背景色
    <Sidebar className="bg-amber-700">
      {/* 侧边栏头部, 包含logo和标题 */}
      <SidebarHeader className="text-sidebar-accent-foreground">
        <Link href="/" className="flex items-center gap-2 px-2 pt-2">
          <Image src="/logo.svg" height={36} width={36} alt="Meet.AI" />
          <p className="text-2xl font-semibold">Meet.AI</p>
        </Link>
      </SidebarHeader>
      {/* 分隔线 */}
      <div className="px-4 py-2">
        <Separator className="opacity-10 text-[#5D6B68]" />
      </div>
      {/* 侧边栏主要内容区域 */}
      <SidebarContent>
        {/* 第一组导航菜单 */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {firstSection.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      // 按钮基础样式和悬停效果
                      "h-10 hover:bg-linear-to-r/oklch border border-transparent hover:border-[#5D6B68]/10 from-sidebar-accent from-5% via-30% via-sidebar/50 to-sidebar/50",
                      // 当前路径匹配时应用激活样式
                      pathname === item.href &&
                        "bg-linear-to-r/oklch border-[#5D6B68]/10"
                    )}
                    isActive={pathname === item.href}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-5" />
                      <span className="text-sm font-medium tracking-tight">
                        {item.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* 分隔线 */}
        <div className="px-4 py-2">
          <Separator className="opacity-10 text-[#5D6B68]" />
        </div>
        {/* 第二组导航菜单 */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondSection.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      // 按钮基础样式和悬停效果
                      "h-10 hover:bg-linear-to-r/oklch border border-transparent hover:border-[#5D6B68]/10 from-sidebar-accent from-5% via-30% via-sidebar/50 to-sidebar/50",
                      // 当前路径匹配时应用激活样式
                      pathname === item.href &&
                        "bg-linear-to-r/oklch border-[#5D6B68]/10"
                    )}
                    isActive={pathname === item.href}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-5" />
                      <span className="text-sm font-medium tracking-tight">
                        {item.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {/* 侧边栏底部, 包含用户按钮 */}
      <SidebarFooter className="text-white">
        <DashboardTrial />
        <DashboardUserButton />
      </SidebarFooter>
    </Sidebar>
  );
};
