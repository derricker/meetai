// 导入在 @/lib/auth.ts 中配置的认证实例, 用于处理认证逻辑
import { auth } from "@/lib/auth";
// 导入登录视图组件, 该组件包含了登录表单和相关 UI
import { SignInView } from "@/modules/auth/ui/views/sign-in-view";
// 导入 Next.js 的 headers 函数, 用于在服务器组件中获取请求头
import { headers } from "next/headers";
// 导入 Next.js 的 redirect 函数, 用于在服务器端进行重定向
import { redirect } from "next/navigation";

// 定义一个异步页面组件
const Page = async () => {
  // 在服务器端调用 auth.api.getSession 方法获取当前用户的会话信息
  // 需要传入从 headers() 获取的请求头, 以便认证库能够正确处理请求
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 检查会话是否存在。如果 !!session 为 true, 表示用户已登录
  if (!!session) {
    // 如果用户已登录, 则重定向到首页 ("/")
    redirect("/");
  }
  // 如果用户未登录, 则渲染 SignInView 组件, 显示登录页面
  return <SignInView />;
};

// 导出 Page 组件作为该路由的默认导出
export default Page;
