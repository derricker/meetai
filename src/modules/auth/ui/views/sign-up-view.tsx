// 标记为客户端组件，表示该组件在浏览器端渲染和执行
"use client";

// 导入 zod 用于数据校验
import { z } from "zod";
// 导入 Next.js 的 Link 组件，用于客户端导航
import Link from "next/link";
// 导入 React 的 useState hook，用于在组件中管理状态
import { useState } from "react";
// 导入 react-hook-form 的 useForm hook，用于表单处理
import { useForm } from "react-hook-form";
// 导入 lucide-react 的图标组件
import { OctagonAlertIcon } from "lucide-react";
// 导入 react-icons 的图标组件
import { FaGithub, FaGoogle } from "react-icons/fa";
// 导入 @hookform/resolvers/zod，用于将 zod 校验器与 react-hook-form 集成
import { zodResolver } from "@hookform/resolvers/zod";

// 导入自定义的 Input 组件
import { Input } from "@/components/ui/input";
// 导入认证客户端实例
import { authClient } from "@/lib/auth-client";
// 导入自定义的 Button 组件
import { Button } from "@/components/ui/button";
// 导入自定义的 Card 和 CardContent 组件
import { Card, CardContent } from "@/components/ui/card";
// 导入自定义的 Alert 和 AlertTitle 组件
import { Alert, AlertTitle } from "@/components/ui/alert";
// 导入自定义的 Form 相关组件
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// 使用 zod 定义表单的校验 schema
const formSchema = z
  .object({
    // name 字段不能为空
    name: z.string().min(1, { message: "请输入昵称" }),
    // email 字段必须是有效的邮箱格式
    email: z.string().email({ message: "请输入正确的邮箱" }),
    // password 字段不能为空
    password: z.string().min(1, { message: "请输入密码" }),
    // confirmPassword 字段不能为空
    confirmPassword: z.string().min(1, { message: "请再次输入密码" }),
  })
  // 自定义校验规则，确保 password 和 confirmPassword 字段的值匹配
  .refine((data) => data.password === data.confirmPassword, {
    message: "密码不匹配",
    path: ["confirmPassword"], // 指定错误信息关联到 confirmPassword 字段
  });

// 定义并导出注册视图组件
export const SignUpView = () => {
  // 定义 pending 状态，用于表示表单是否正在提交中
  const [pending, setPending] = useState(false);
  // 定义 error 状态，用于存储注册过程中发生的错误信息
  const [error, setError] = useState<string | null>(null);

  // 使用 useForm hook 初始化表单
  const form = useForm<z.infer<typeof formSchema>>({
    // 使用 zodResolver 将 zod schema 应用于表单校验
    resolver: zodResolver(formSchema),
    // 设置表单字段的默认值
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // 定义表单提交处理函数
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // 重置错误信息
    setError(null);
    // 设置为提交中状态
    setPending(true);

    // 调用认证客户端的 signUp.email 方法进行邮箱注册
    authClient.signUp.email(
      {
        name: data.name,
        email: data.email,
        password: data.password,
        // 注册成功后的回调 URL
        callbackURL: "/",
      },
      {
        // 注册成功时的回调
        onSuccess: () => {
          // 取消提交中状态
          setPending(false);
        },
        // 注册失败时的回调
        onError: ({ error }) => {
          // 取消提交中状态
          setPending(false);
          // 设置错误信息
          setError(error.message);
        },
      }
    );
  };

  // 渲染组件 UI
  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* 表单容器 */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                {/* 标题和副标题 */}
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">让我们开始吧</h1>
                  <p className="text-muted-foreground text-balance">
                    创建您的账号
                  </p>
                </div>
                {/* 昵称输入框 */}
                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>昵称</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="请输入用户昵称"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {/* 邮箱输入框 */}
                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>邮箱</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="请输入用户邮箱"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {/* 密码输入框 */}
                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>密码</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="请输入用户密码"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {/* 确认密码输入框 */}
                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>确认密码</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="请再次输入密码"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {/* 错误信息提示 */}
                {!!error && (
                  <Alert className="bg-destructive/10 border-none">
                    <OctagonAlertIcon className="h-4 w-4 !text-destructive" />
                    <AlertTitle>{error}</AlertTitle>
                  </Alert>
                )}
                {/* 注册按钮 */}
                <Button disabled={pending} type="submit" className="w-full">
                  {pending ? "注册中..." : "注册"}
                </Button>
                {/* 第三方登录分隔符 */}
                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    第三方登录
                  </span>
                </div>
                {/* 第三方登录按钮 */}
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    disabled={pending}
                    variant="outline"
                    type="button"
                    className="w-full"
                  >
                    <FaGoogle />
                  </Button>
                  <Button
                    disabled={pending}
                    variant="outline"
                    type="button"
                    className="w-full"
                  >
                    <FaGithub />
                  </Button>
                </div>
                {/* 登录链接 */}
                <div className="text-center text-sm">
                  已经有账号?{" "}
                  <Link
                    href="/sign-in"
                    className="underline underline-offset-4"
                  >
                    登录
                  </Link>
                </div>
              </div>
            </form>
          </Form>

          {/* 右侧的品牌展示区域 */}
          <div className="bg-radial from-green-700 to-green-900 relative hidden md:flex flex-col gap-y-4 items-center justify-center">
            <img src="/logo.svg" alt="Image" className="h-[92px] w-[92px]" />
            <p className="text-2xl font-semibold text-white">Meet.AI</p>
          </div>
        </CardContent>
      </Card>

      {/* 服务条款和隐私政策链接 */}
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        点击登录, 即表示您同意我们的<a href="#">服务条款</a>和
        <a href="#">隐私政策</a>
      </div>
    </div>
  );
};
