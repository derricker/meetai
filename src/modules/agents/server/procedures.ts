// 导入数据库实例, 用于数据库操作
import { db } from "@/db";
// 导入 agents 表的 schema 定义
import { agents } from "@/db/schema";
// 导入 tRPC 的基础 procedure 和 router 创建函数
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

// 导入 TRPCError 用于处理 API 错误
// import { TRPCError } from "@trpc/server";

// 从模块的 schemas 文件中导入 agentsInsertSchema, 用于验证创建新智能体时输入的合法性
import { agentsInsertSchema } from "../schemas";
// 导入 Zod 库, 用于定义和验证数据结构。
import { z } from "zod";
// eq 函数用于在数据库查询中构建等于条件
import { eq } from "drizzle-orm";

// 创建并导出 agents 相关的 tRPC 路由
export const agentsRouter = createTRPCRouter({
  /**
   * getMany 查询过程 (Query Procedure)
   * 用于获取当前用户的所有代理
   * 这是一个受保护的过程, 意味着只有登录用户才能调用
   */
  getMany: protectedProcedure.query(async () => {
    // 使用 Drizzle ORM 从 agents 数据库表中查询所有记录。
    const data = await db.select().from(agents);

    // --- 以下是用于开发和调试的示例代码, 默认被注释
    // 模拟网络延迟, 方便在前端测试加载状态。
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    // 模拟一个客户端错误, 方便在前端测试错误处理逻辑
    // throw new TRPCError({ code: "BAD_REQUEST" });
    // --- 调试代码结束 ---

    // 返回查询到的代理数据数组
    return data;
  }),

  /**
   * getOne 查询过程 (Query Procedure)
   * 用于根据指定的 ID 获取单个代理的信息
   * @param {object} input - 输入对象, 需要包含一个字符串类型的 id
   */
  getOne: protectedProcedure
    // 使用 Zod 定义输入验证, 确保 id 是一个字符串
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // 根据传入的 id 在 agents 表中查询匹配的记录
      const [existingAgent] = await db
        .select()
        .from(agents)
        // eq 函数用于创建 `agents.id = input.id` 的查询条件
        .where(eq(agents.id, input.id));
      // 返回查询到的单个代理对象, 如果未找到则为 undefined
      return existingAgent;
    }),

  /**
   * create 变更过程 (Mutation Procedure)
   * 用于创建一个新的代理
   * @param {object} input - 输入对象，其结构需要符合 agentsInsertSchema 的定义
   * @param {object} ctx - tRPC 的上下文对象，其中包含用户信息 (ctx.auth)
   */
  create: protectedProcedure
    // 使用从 schemas.ts 导入的 agentsInsertSchema 来验证输入数据
    .input(agentsInsertSchema)
    .mutation(async ({ input, ctx }) => {
      // 向 agents 表中插入一条新记录。
      const [createdAgent] = await db
        .insert(agents)
        // 将输入数据与当前用户的 ID 合并作为要插入的值
        .values({ ...input, userId: ctx.auth.user.id })
        // 返回被创建的完整记录
        .returning();
      // 返回新创建的代理对象
      return createdAgent;
    }),
});
