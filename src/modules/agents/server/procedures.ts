// 导入数据库实例, 用于数据库操作
import { db } from "@/db";
// 导入 agents 表的 schema 定义
import { agents, meetings } from "@/db/schema";
// 导入 tRPC 的基础 procedure 和 router 创建函数
import {
  createTRPCRouter,
  premiumProcedure,
  protectedProcedure,
} from "@/trpc/init";

// 导入 TRPCError 用于处理 API 错误
// import { TRPCError } from "@trpc/server";

// 从模块的 schemas 文件中导入 agentsInsertSchema, 用于验证创建新智能体时输入的合法性
import { agentsInsertSchema, agentsUpdateSchema } from "../schemas";
// 导入 Zod 库, 用于定义和验证数据结构。
import { z } from "zod";
// eq 函数用于在数据库查询中构建等于条件
import { and, count, desc, eq, getTableColumns, ilike } from "drizzle-orm";

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "@/constants";

// 导入 TRPCError 用于处理 API 错误
import { TRPCError } from "@trpc/server";

// 创建并导出 agents 相关的 tRPC 路由
export const agentsRouter = createTRPCRouter({
  /**
   * getMany 查询过程 (Query Procedure)
   * 用于分页获取当前用户的所有智能体列表，支持按名称搜索
   *
   * @param {object} input - 输入参数对象
   * @param {number} input.page - 当前页码, 默认为 DEFAULT_PAGE
   * @param {number} input.pageSize - 每页数量, 受 MIN_PAGE_SIZE 和 MAX_PAGE_SIZE 限制
   * @param {string|null} input.search - 可选的搜索关键词, 用于按名称过滤
   * @returns {Promise<{items: Agent[], total: number, totalPages: number}>} 返回分页后的数据列表和分页信息
   */
  getMany: protectedProcedure
    // 定义输入参数的验证规则
    .input(
      z.object({
        // 页码参数, 默认为 DEFAULT_PAGE
        page: z.number().default(DEFAULT_PAGE),
        // 每页数量参数, 设置最小和最大限制, 默认为 DEFAULT_PAGE_SIZE
        pageSize: z
          .number()
          .min(MIN_PAGE_SIZE)
          .max(MAX_PAGE_SIZE)
          .default(DEFAULT_PAGE_SIZE),
        // 搜索关键词参数, 可以为空
        search: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;

      // 构建基础查询条件: 必须匹配当前用户ID
      // 如果有搜索关键词, 添加模糊匹配条件
      const whereCondition = and(
        eq(agents.userId, ctx.auth.user.id),
        search ? ilike(agents.name, `%${search}%`) : undefined
      );

      // 查询分页数据
      const data = await db
        .select({
          ...getTableColumns(agents),
          meetingCount: db.$count(meetings, eq(agents.id, meetings.agentId)),
        })
        .from(agents)
        .where(whereCondition)
        // 按创建时间和ID降序排序
        .orderBy(desc(agents.createdAt), desc(agents.id))
        // 应用分页限制
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      // 查询总记录数
      const [total] = await db
        .select({ count: count() })
        .from(agents)
        .where(whereCondition);

      // 计算总页数
      const totalPages = Math.ceil(total.count / pageSize);

      // 返回分页数据和分页信息
      return {
        items: data, // 当前页的数据列表
        total: total.count, // 总记录数
        totalPages, // 总页数
      };
    }),

  /**
   * getOne 查询过程 (Query Procedure)
   * 用于根据指定的 ID 获取单个代理的信息
   * @param {object} input - 输入对象, 需要包含一个字符串类型的 id
   */
  getOne: protectedProcedure
    // 使用 Zod 定义输入验证, 确保 id 是一个字符串
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // 根据传入的 id 在 agents 表中查询匹配的记录
      const [existingAgent] = await db
        .select({
          ...getTableColumns(agents),
          meetingCount: db.$count(meetings, eq(agents.id, meetings.agentId)),
        })
        .from(agents)
        // eq 函数用于创建 `agents.id = input.id` 的查询条件
        .where(
          and(eq(agents.id, input.id), eq(agents.userId, ctx.auth.user.id))
        );

      // 如果没有查询到智能体
      if (!existingAgent) {
        // 抛出错误
        throw new TRPCError({ code: "NOT_FOUND", message: "智能体未找到" });
      }

      // 返回查询到的单个代理对象, 如果未找到则为 undefined
      return existingAgent;
    }),

  /**
   * create 变更过程 (Mutation Procedure)
   * 用于创建一个新的代理
   * @param {object} input - 输入对象，其结构需要符合 agentsInsertSchema 的定义
   * @param {object} ctx - tRPC 的上下文对象，其中包含用户信息 (ctx.auth)
   */
  create: premiumProcedure("agents")
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
  /**
   * remove 变更过程 (Mutation Procedure)
   * 用于删除指定ID的智能体
   *
   * @param {object} input - 输入参数对象
   * @param {string} input.id - 要删除的智能体ID
   * @returns {Promise<Agent>} 返回被删除的智能体信息
   * @throws {TRPCError} 当找不到指定ID的智能体时抛出 NOT_FOUND 错误
   */
  remove: protectedProcedure
    // 使用 Zod 验证输入参数必须包含字符串类型的 id
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // 从数据库中删除指定ID且属于当前用户的智能体
      const [removedAgent] = await db
        .delete(agents)
        .where(
          and(eq(agents.id, input.id), eq(agents.userId, ctx.auth.user.id))
        )
        .returning();

      // 如果未找到要删除的智能体, 抛出错误
      if (!removedAgent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "智能体未找到",
        });
      }

      // 返回被删除的智能体信息
      return removedAgent;
    }),

  /**
   * update 变更过程 (Mutation Procedure)
   * 用于更新指定ID的智能体信息
   *
   * @param {object} input - 符合 agentsUpdateSchema 的输入参数对象
   * @param {string} input.id - 要更新的智能体ID
   * @returns {Promise<Agent>} 返回更新后的智能体信息
   * @throws {TRPCError} 当找不到指定ID的智能体时抛出 NOT_FOUND 错误
   */
  update: protectedProcedure
    // 使用 agentsUpdateSchema 验证更新数据的格式
    .input(agentsUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      // 更新数据库中指定ID且属于当前用户的智能体信息
      const [updatedAgent] = await db
        .update(agents)
        .set(input)
        .where(
          and(eq(agents.id, input.id), eq(agents.userId, ctx.auth.user.id))
        )
        .returning();

      // 如果未找到要更新的智能体, 抛出错误
      if (!updatedAgent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "智能体未找到",
        });
      }

      // 返回更新后的智能体信息
      return updatedAgent;
    }),
});
