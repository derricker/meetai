// 导入 better-auth 核心库，这是一个用于处理用户认证的框架
// betterAuth 函数用于创建和配置认证系统实例
import { betterAuth } from "better-auth";

// 导入 Drizzle ORM 的数据库适配器
// drizzleAdapter 用于将 better-auth 的数据存储层与 Drizzle ORM 集成
// 这样可以使用 Drizzle ORM 来管理用户、会话等认证相关的数据表
import { drizzleAdapter } from "better-auth/adapters/drizzle";

// 导入数据库连接实例
// 这个实例包含了与数据库的连接配置
import { db } from "@/db";

// 导入数据库表结构定义
// schema 包含了所有的数据表定义，包括用户表、会话表等
import * as schema from "@/db/schema";

// 初始化并导出认证系统实例
// 这个实例将被用于处理所有的认证相关操作
export const auth = betterAuth({
  // 配置社交登录提供商
  socialProviders: {
    github: {
      // GitHub 客户端 ID
      clientId: process.env.GITHUB_CLIENT_ID as string,
      // GitHub 客户端密钥
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  // 配置邮箱和密码认证方式
  // 这是最基本的认证方式，允许用户使用邮箱和密码进行注册和登录
  emailAndPassword: {
    // 启用邮箱密码认证功能
    enabled: true,
  },

  // 配置数据库适配器
  // 这里使用 Drizzle ORM 来处理所有的数据库操作
  database: drizzleAdapter(db, {
    // 指定数据库类型为 PostgreSQL
    // 这告诉适配器使用 PostgreSQL 特定的功能和语法
    provider: "pg",

    // 传入数据库表结构定义
    // 这些表结构将被用于存储用户信息、认证会话等数据
    schema: {
      ...schema,
    },
  }),
});
