// 从 @trpc/server 包中导入 initTRPC 函数
// 这是创建和配置 tRPC 实例的入口点
import { auth } from "@/lib/auth";
// 导入 tRPC 服务器的核心工具
// initTRPC 用于初始化 tRPC 实例
// TRPCError 用于处理和抛出特定于 tRPC 的错误
import { initTRPC, TRPCError } from "@trpc/server";
// 从 Next.js 导入 headers 函数, 用于在服务器端访问 HTTP 请求头
import { headers } from "next/headers";
// 从 react 库中导入 cache 函数
// cache 用于在服务器端渲染期间缓存函数的返回值
// 在同一个请求-响应周期内, 无论调用多少次被 cache 包装的函数
// 它都只会执行一次, 后续调用将直接返回缓存的结果
// 这有助于避免重复的数据获取或计算, 提升性能
import { cache } from "react";

// 导入数据库实例
import { db } from "@/db";
// 导入数据库表结构定义
import { agents, meetings } from "@/db/schema";
// 导入 Polar 客户端，用于处理订阅和付费相关功能
import { polarClient } from "@/lib/polar";
// 导入免费版本的使用限制常量
import {
  MAX_FREE_AGENTS,
  MAX_FREE_MEETINGS,
} from "@/modules/premium/constants";
// 导入 Drizzle ORM 的工具函数
// count: 用于计数查询
// eq: 用于构建相等条件的查询
import { count, eq } from "drizzle-orm";

// 定义并导出一个名为 createTRPCContext 的异步函数, 用于创建 tRPC 的上下文对象
// 它包含了所有 tRPC 路由和程序都可以访问的数据
// 这通常是存放数据库连接、用户身份验证信息等共享资源的地方
// 使用 cache 函数包装, 确保在单次请求处理流程中, 这个上下文创建函数只执行一次
export const createTRPCContext = cache(async () => {
  // 在这个例子中, 返回了一个包含硬编码 userId 的简单对象
  // 在实际应用中， 这里会通过解析请求头中的 cookie 或 token 来获取当前登录用户的信息
  return { userId: "user_123" };
});

// 初始化 tRPC 实例, 并将其赋值给常量 t
const t = initTRPC.create({});

// 这是 t.router 的别名
// 你将使用它来创建 API 的路由
// 例如, 你可以创建一个 userRouter 和一个 postRouter, 然后将它们合并成一个主应用路由 appRouter
export const createTRPCRouter = t.router;
// 这是 t.createCallerFactory 的别名
// 它用于在服务器端直接调用 tRPC API, 而无需通过 HTTP 请求
// 这对于在 Next.js 的 getServerSideProps 中获取数据非常有用
export const createCallerFactory = t.createCallerFactory;
// 这是 t.procedure 的别名
// 它是构建所有 API 端点的基础
// 你还可以基于它来创建更复杂的 Procedure
// 例如需要用户登录才能访问的受保护 Procedure（Protected Procedure）。
export const baseProcedure = t.procedure;

// 创建一个受保护的 tRPC 过程 (Protected Procedure)
// 这是一个中间件, 用于确保只有经过身份验证的用户才能访问特定的 API 路由
// 它会在执行实际的路由处理程序之前, 检查用户的会话状态
export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  // 从请求头中获取会话信息, headers() 函数用于访问传入请求的头部
  // auth.api.getSession 是认证库提供的方法, 用于验证会话
  const session = await auth.api.getSession({
    // 必须传入请求头信息, 以便认证库可以验证和解析会话 cookie 或令牌
    headers: await headers(),
  });

  // 检查会话是否存在, 如果 session 为 null 或 undefined, 表示用户未登录或会话无效
  if (!session) {
    // 如果用户未通过身份验证, 则抛出一个 TRPCError 异常。
    // `UNAUTHORIZED` 是一个标准的 HTTP 401 错误码, 表示请求需要身份验证。
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "该请求需要身份验证",
    });
  }

  // 如果会话验证成功, 则调用 next() 函数继续执行请求处理链
  // 同时, 将获取到的会话信息 session 加到 tRPC 的上下文中
  // 这样, 后续的路由处理程序就可以通过 ctx.auth 访问到当前用户的会话信息
  return next({ ctx: { ...ctx, auth: session } });
});

// 导出一个名为 premiumProcedure 的函数, 它接受一个实体类型 ("meetings" 或 "agents") 作为参数
// 这个函数用于创建一个受保护的 tRPC 过程, 增加了对免费用户使用限制的检查
export const premiumProcedure = (entity: "meetings" | "agents") =>
  // 使用 protectedProcedure.use 来创建一个中间件
  protectedProcedure.use(async ({ ctx, next }) => {
    // 通过 polarClient 获取外部客户状态, 这里的外部 ID 是当前用户的 ID
    const customer = await polarClient.customers.getStateExternal({
      externalId: ctx.auth.user.id,
    });

    // 查询当前用户创建的会议数量
    const [userMeetings] = await db
      .select({
        // 统计 meetings 表中的记录数
        count: count(meetings.id),
      })
      .from(meetings)
      // 条件是 userId 匹配当前用户
      .where(eq(meetings.userId, ctx.auth.user.id));

    // 查询当前用户创建的智能体数量
    const [userAgents] = await db
      .select({
        // 统计 agents 表中的记录数
        count: count(agents.id),
      })
      .from(agents)
      // 条件是 userId 匹配当前用户
      .where(eq(agents.userId, ctx.auth.user.id));

    // 检查用户是否为付费用户 (是否有有效的订阅)
    const isPremium = customer.activeSubscriptions.length > 0;
    // 检查免费用户的智能体数量是否已达到上限
    const isFreeAgentLimitReached = userAgents.count >= MAX_FREE_AGENTS;
    // 检查免费用户的会议数量是否已达到上限
    const isFreeMeetingLimitReached = userMeetings.count >= MAX_FREE_MEETINGS;

    // 判断是否应该抛出会议相关的错误
    // 条件: 实体是 "meetings", 会议数量达到上限, 且用户不是付费用户
    const shouldThrowMeetingError =
      entity === "meetings" && isFreeMeetingLimitReached && !isPremium;
    // 判断是否应该抛出代理相关的错误
    // 条件: 实体是 "agents", 代理数量达到上限, 且用户不是付费用户
    const shouldThrowAgentError =
      entity === "agents" && isFreeAgentLimitReached && !isPremium;

    // 如果应该抛出会议错误, 则抛出一个 TRPCError
    if (shouldThrowMeetingError) {
      throw new TRPCError({
        // 错误码为 FORBIDDEN
        code: "FORBIDDEN",
        // 错误信息
        message: "您已达到免费会议的最大数量限制",
      });
    }

    // 如果应该抛出代理错误, 则抛出一个 TRPCError
    if (shouldThrowAgentError) {
      throw new TRPCError({
        // 错误码为 FORBIDDEN
        code: "FORBIDDEN",
        // 错误信息
        message: "您已达到免费智能体的最大数量限制",
      });
    }

    // 如果没有达到限制，则继续执行下一个中间件或过程
    // 并将 customer 信息添加到上下文中
    return next({ ctx: { ...ctx, customer } });
  });
