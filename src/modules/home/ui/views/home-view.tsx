// 声明这是一个客户端组件
"use client";

// 导入所需的组件和工具
import { Button } from "@/components/ui/button";
// 导入身份验证客户端工具
import { authClient } from "@/lib/auth-client";
// 导入路由导航工具
import { useRouter } from "next/navigation";

// 定义主页视图组件
export const HomeView = () => {
  // 获取路由实例，用于页面导航
  const router = useRouter();
  // 获取用户会话信息
  const { data: session } = authClient.useSession();

  // 如果会话未加载完成，显示加载状态
  if (!session) {
    return <p>loading...</p>;
  }

  // 渲染主页内容
  return (
    // 使用flex布局的容器，设置内边距和垂直间距
    <div className="flex flex-col p-4 gap-y-4">
      {/* 显示已登录用户的名称 */}
      <p>{session.user.name} 已登录</p>
      {/* 退出登录按钮 */}
      <Button
        onClick={() =>
          authClient.signOut({
            fetchOptions: {
              // 退出成功后跳转到登录页面
              onSuccess: () => {
                router.push("/sign-in");
              },
            },
          })
        }
      >
        退出
      </Button>
    </div>
  );
};
