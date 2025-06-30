// 导入 Next.js 的路由钩子
import { useRouter } from "next/navigation";
// 导入需要使用的图标组件
import { ChevronDownIcon, CreditCardIcon, LogOutIcon } from "lucide-react";

// 导入认证客户端
import { authClient } from "@/lib/auth-client";
// 导入移动设备检测钩子
import { useIsMobile } from "@/hooks/use-mobile";
// 导入头像相关组件
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { GeneratedAvatar } from "@/components/generated-avatar";
// 导入下拉菜单相关组件
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// 导入抽屉组件 (用于移动端显示)
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
// 导入按钮组件
import { Button } from "@/components/ui/button";

// 导出仪表盘用户按钮组件
export const DashboardUserButton = () => {
  // 获取路由实例
  const router = useRouter();
  // 检查是否为移动设备
  const isMobile = useIsMobile();
  // 获取用户会话数据
  const { data, isPending } = authClient.useSession();

  // 退出登录处理函数
  const onLogout = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          // 退出成功后跳转到登录页
          router.push("/sign-in");
        },
      },
    });
  };

  // 如果正在加载或没有用户数据，返回null
  if (isPending || !data?.user) {
    return null;
  }

  // 移动端显示抽屉组件
  if (isMobile) {
    return (
      <Drawer>
        {/* 抽屉触发器，显示用户信息 */}
        <DrawerTrigger className="rounded-lg border border-border/10 p-3 w-full flex items-center justify-between bg-white/5 hover:bg-white/10 overflow-hidden gap-x-2">
          {data.user.image ? (
            <Avatar>
              <AvatarImage src={data.user.image} />
            </Avatar>
          ) : (
            <GeneratedAvatar
              seed={data.user.name}
              variant="initials"
              className="size-9 mr-3"
            />
          )}
          <div className="flex flex-col gap-0.5 text-left overflow-hidden flex-1 min-w-0">
            <p className="text-sm truncate w-full">{data.user.name}</p>
            <p className="text-xs truncate w-full">{data.user.email}</p>
          </div>
          <ChevronDownIcon className="size-4 shrink-0" />
        </DrawerTrigger>
        {/* 抽屉内容 */}
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{data.user.name}</DrawerTitle>
            <DrawerDescription>{data.user.email}</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            {/* 账单按钮 */}
            <Button variant="outline">
              <CreditCardIcon className="size-4 text-black" />
              账单
            </Button>
            {/* 退出按钮 */}
            <Button variant="outline" onClick={onLogout}>
              <LogOutIcon className="size-4 text-black" />
              退出
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  // 桌面端显示下拉菜单
  return (
    <DropdownMenu>
      {/* 下拉菜单触发器，显示用户信息 */}
      <DropdownMenuTrigger className="rounded-lg border border-border/10 p-3 w-full flex items-center justify-between bg-white/5 hover:bg-white/10 overflow-hidden gap-x-2">
        {data.user.image ? (
          <Avatar>
            <AvatarImage src={data.user.image} />
          </Avatar>
        ) : (
          <GeneratedAvatar
            seed={data.user.name}
            variant="initials"
            className="size-9 mr-3"
          />
        )}
        <div className="flex flex-col gap-0.5 text-left overflow-hidden flex-1 min-w-0">
          <p className="text-sm truncate w-full">{data.user.name}</p>
          <p className="text-xs truncate w-full">{data.user.email}</p>
        </div>
        <ChevronDownIcon className="size-4 shrink-0" />
      </DropdownMenuTrigger>
      {/* 下拉菜单内容 */}
      <DropdownMenuContent align="end" side="right" className="w-72">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <span className="font-medium truncate">{data.user.name}</span>
            <span className="text-sm font-normal text-muted-foreground truncate">
              {data.user.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* 账单菜单项 */}
        <DropdownMenuItem className="cursor-pointer flex items-center justify-between">
          账单
          <CreditCardIcon className="size-4" />
        </DropdownMenuItem>
        {/* 退出菜单项 */}
        <DropdownMenuItem
          onClick={onLogout}
          className="cursor-pointer flex items-center justify-between"
        >
          退出
          <LogOutIcon className="size-4" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
