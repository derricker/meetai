// 导入身份验证相关功能
import { auth } from "@/lib/auth";
// 导入主页视图组件
import { HomeView } from "@/modules/home/ui/views/home-view";
import { caller } from "@/trpc/server";
// 导入用于获取请求头的Next.js工具
import { headers } from "next/headers";
// 导入用于页面重定向的Next.js工具
import { redirect } from "next/navigation";

// 定义异步页面组件
export const Page = async () => {
  // 获取当前用户会话信息
  const session = await auth.api.getSession({
    headers: await headers(), // 传入请求头信息用于会话验证
  });

  // 如果没有有效会话，重定向到登录页面
  if (!session) return redirect("/sign-in");

  const data = await caller.hello({ text: "server" });

  return (
    <div className="flex flex-col p-4 gap-y-4">
      <p>{data.greeting}</p>
    </div>
  );

  // 如果用户已登录，渲染主页视图组件
  return <HomeView />;
};

// 导出页面组件作为默认导出
export default Page;
