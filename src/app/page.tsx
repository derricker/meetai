// 声明这是一个客户端组件
"use client";

// 导入所需的 UI 组件
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// 导入认证客户端实例
import { authClient } from "@/lib/auth-client";
// 导入 React 的 useState 钩子用于状态管理
import { useState } from "react";

// 定义首页组件
export default function Home() {
  // 定义表单状态
  const [name, setName] = useState(""); // 用户昵称
  const [email, setEmail] = useState(""); // 用户邮箱
  const [password, setPassword] = useState(""); // 用户密码

  // 获取当前用户会话信息
  // data 被重命名为 session，包含了用户的登录状态和信息
  const { data: session } = authClient.useSession();

  // 处理用户注册
  const register = () => {
    authClient.signUp.email(
      {
        name, // 用户昵称
        email, // 用户邮箱
        password, // 用户密码
      },
      {
        // 注册失败的回调
        onError: () => {
          window.alert("发生了错误");
        },
        // 注册成功的回调
        onSuccess: () => {
          window.alert("注册成功");
        },
      }
    );
  };

  // 处理用户登录
  const login = () => {
    authClient.signIn.email(
      {
        email, // 用户邮箱
        password, // 用户密码
      },
      {
        // 登录失败的回调
        onError: () => {
          window.alert("发生了错误");
        },
        // 登录成功的回调
        onSuccess: () => {
          window.alert("登录成功");
        },
      }
    );
  };

  // 如果用户已登录，显示用户信息和退出按钮
  if (session) {
    return (
      <div className="p-4 flex flex-col gap-y-4">
        <p>{session.user.name} 登录了</p>
        <Button onClick={() => authClient.signOut()}>退出登录</Button>
      </div>
    );
  }

  // 如果用户未登录，显示注册和登录表单
  return (
    <>
      {/* 注册表单 */}
      <div className="p-4 flex flex-col gap-y-4">
        <Input
          type="text"
          placeholder="输入昵称"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          type="email"
          placeholder="输入邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="输入密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button onClick={register}>创建用户</Button>
      </div>
      {/* 登录表单 */}
      <div className="p-4 flex flex-col gap-y-4">
        <Input
          type="email"
          placeholder="输入邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="输入密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button onClick={login}>用户登录</Button>
      </div>
    </>
  );
}
