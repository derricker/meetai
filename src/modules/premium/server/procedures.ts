// 导入 drizzle-orm 中的 eq (等于) 和 count (计数) 函数, 用于数据库查询
import { eq, count } from "drizzle-orm";

// 导入数据库实例
import { db } from "@/db";
// 导入 Polar 客户端, 用于与 Polar 服务进行交互
import { polarClient } from "@/lib/polar";
// 导入数据库的 agents 和 meetings 表的 schema 定义
import { agents, meetings } from "@/db/schema";
// 导入 tRPC 的工具函数, 用于创建路由和受保护的过程
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

// 创建一个名为 premiumRouter 的 tRPC 路由
export const premiumRouter = createTRPCRouter({
  // 定义一个名为 getFreeUsage 的查询过程, 这是一个受保护的过程, 需要用户认证
  getFreeUsage: protectedProcedure.query(async ({ ctx }) => {
    // 使用 Polar 客户端根据外部 ID (即用户 ID) 获取客户状态
    const customer = await polarClient.customers.getStateExternal({
      externalId: ctx.auth.user.id,
    });

    // 获取客户的有效订阅信息
    const subscription = customer.activeSubscriptions[0];

    // 如果存在有效订阅, 则表示用户不是免费用户, 直接返回 null
    if (subscription) {
      return null;
    }

    // 查询当前用户创建的会议数量
    const [userMeetings] = await db
      .select({
        // 统计 meetings 表中的 id 数量
        count: count(meetings.id),
      })
      .from(meetings)
      // 查询条件: meetings.userId 等于当前用户 ID
      .where(eq(meetings.userId, ctx.auth.user.id));

    // 查询当前用户创建的智能体数量
    const [userAgents] = await db
      .select({
        // 统计 agents 表中的 id 数量
        count: count(agents.id),
      })
      .from(agents)
      // 查询条件: agents.userId 等于当前用户 ID
      .where(eq(agents.userId, ctx.auth.user.id));

    // 返回免费用户的使用情况, 包括会议数量和代理数量
    return {
      meetingCount: userMeetings.count,
      agentCount: userAgents.count,
    };
  }),
});
