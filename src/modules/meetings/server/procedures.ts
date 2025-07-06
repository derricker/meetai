// 导入分页相关的常量，用于设置默认值和限制
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "@/constants";
// 导入数据库实例，用于执行数据库操作
import { db } from "@/db";
// 导入数据库 schema 中的 meetings 表定义
import { agents, meetings } from "@/db/schema";
// 导入 tRPC 的路由创建函数和受保护的过程，用于定义 API 端点
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
// 导入 tRPC 的错误类，用于抛出标准化的 API 错误
import { TRPCError } from "@trpc/server";
// 导入 Drizzle ORM 的查询操作符，用于构建 SQL 查询
import { and, count, desc, eq, getTableColumns, ilike, sql } from "drizzle-orm";
// 导入 Zod，一个用于数据验证的库
import { z } from "zod";

// 从 meetings 模块的 schemas 文件中导入 Zod 验证 schema，用于校验创建和更新会议时的输入数据。
import { meetingsInsertSchema, meetingsUpdateSchema } from "../schemas";
// 导入会议状态枚举
import { MeetingStatus } from "../types";

// 使用 createTRPCRouter 创建一个名为 meetingsRouter 的 tRPC 路由
export const meetingsRouter = createTRPCRouter({
  /**
   * getMany 查询过程
   * 该方法用于获取会议列表，支持分页、搜索和多种筛选功能
   *
   * 功能说明:
   * 1. 分页获取当前用户的会议列表
   * 2. 支持按会议名称进行模糊搜索
   * 3. 支持按AI助手ID筛选
   * 4. 支持按会议状态筛选
   * 5. 自动计算会议持续时间
   * 6. 返回分页信息和会议总数
   *
   * 输入参数:
   * @param {number} page - 页码，从1开始，默认为1
   * @param {number} pageSize - 每页记录数，默认10，最小1，最大100
   * @param {string} search - 可选，会议名称搜索关键词
   * @param {string} agentId - 可选，AI助手ID
   * @param {MeetingStatus} status - 可选，会议状态(即将开始/进行中/已完成/处理中/已取消)
   *
   * 返回数据:
   * @returns {Promise<{
   *   items: Array<Meeting & {agent: Agent, duration: number}>, // 会议列表，包含AI助手信息和会议时长
   *   total: number,    // 总记录数
   *   totalPages: number // 总页数
   * }>}
   */
  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(MIN_PAGE_SIZE)
          .max(MAX_PAGE_SIZE)
          .default(DEFAULT_PAGE_SIZE),
        search: z.string().nullish(),
        agentId: z.string().nullish(),
        status: z
          .enum([
            MeetingStatus.Upcoming,
            MeetingStatus.Active,
            MeetingStatus.Completed,
            MeetingStatus.Processing,
            MeetingStatus.Cancelled,
          ])
          .nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search, agentId, status } = input;

      // 构建多条件查询
      // 1. 必须是当前用户的会议
      // 2. 如果有搜索关键词，进行会议名称的模糊匹配
      // 3. 如果指定了会议状态，添加状态筛选
      // 4. 如果指定了AI助手ID，添加助手筛选
      const whereCondition = and(
        eq(meetings.userId, ctx.auth.user.id),
        search ? ilike(meetings.name, `%${search}%`) : undefined,
        status ? eq(meetings.status, status) : undefined,
        agentId ? eq(meetings.agentId, agentId) : undefined
      );

      // 查询会议列表
      // 1. 获取会议表的所有字段
      // 2. 关联查询AI助手信息
      // 3. 计算会议持续时间(秒)
      const data = await db
        .select({
          ...getTableColumns(meetings),
          agent: agents,
          duration: sql<number>`EXTRACT(EPOCH FROM (ended_at - started_at))`.as(
            "duration"
          ),
        })
        .from(meetings)
        .innerJoin(agents, eq(meetings.agentId, agents.id))
        .where(whereCondition)
        .orderBy(desc(meetings.createdAt), desc(meetings.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      // 获取符合条件的会议总数
      const [total] = await db
        .select({ count: count() })
        .from(meetings)
        .innerJoin(agents, eq(meetings.agentId, agents.id))
        .where(whereCondition);

      // 计算总页数
      const totalPages = Math.ceil(total.count / pageSize);

      // 返回会议列表、总数和分页信息
      return {
        items: data,
        total: total.count,
        totalPages,
      };
    }),
  /**
   * getOne 查询过程 (Query Procedure)
   * 用于根据指定的 ID 获取单个会议的详细信息。
   * @param {object} input - 输入对象，必须包含一个字符串类型的 id。
   */
  getOne: protectedProcedure
    // 使用 Zod 定义输入验证，确保 id 是一个非空字符串
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // 根据传入的 id 和当前用户 ID 在 meetings 表中查询匹配的记录
      const [existingMeeting] = await db
        .select()
        .from(meetings)
        // 查询条件：ID 匹配且 userId 匹配
        .where(
          and(eq(meetings.id, input.id), eq(meetings.userId, ctx.auth.user.id))
        );

      // 如果没有找到匹配的会议记录
      if (!existingMeeting) {
        // 抛出一个 "NOT_FOUND" 错误
        throw new TRPCError({ code: "NOT_FOUND", message: "会议未找到" });
      }

      // 返回查询到的会议对象
      return existingMeeting;
    }),

  // 定义一个名为 create 的受保护的 procedure, 用于创建新的会议记录。
  create: protectedProcedure
    // 使用从 ../schemas 导入的 meetingsInsertSchema 来验证客户端传入的输入数据。
    // input 方法确保只有符合 meetingsInsertSchema 结构的数据才能进入 mutation。
    .input(meetingsInsertSchema)
    // .mutation 定义了此 procedure 的核心逻辑, 它会修改数据库。
    .mutation(async ({ input, ctx }) => {
      // 在 meetings 表中插入一条新的记录。
      const [createdMeeting] = await db
        .insert(meetings)
        // values 指定了要插入的数据。这里我们将客户端提供的 input 数据
        // 与当前认证用户的 ID 合并, 以确保会议记录与用户关联。
        .values({ ...input, userId: ctx.auth.user.id })
        // returning 方法指定在插入操作成功后, 返回新创建的完整记录。
        .returning();
      // 将新创建的会议对象返回给客户端。
      return createdMeeting;
    }),

  // 定义一个名为 update 的受保护的 procedure, 用于更新已存在的会议记录。
  update: protectedProcedure
    // 使用 meetingsUpdateSchema 来验证客户端传入的更新数据。
    // 这确保了更新操作所需的所有字段 (如 ID) 都存在且格式正确。
    .input(meetingsUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      // 在 meetings 表中更新一条记录。
      const [updatedMeeting] = await db
        .update(meetings)
        // set 方法指定要更新的字段, 这里使用客户端传入的 input 数据。
        .set(input)
        // where 子句用于定位要更新的记录。
        // and 函数确保只有同时满足以下两个条件的记录才会被更新：
        // 1. meetings.id 与 input.id 匹配。
        // 2. meetings.userId 与当前认证用户的 ID 匹配, 防止用户修改不属于自己的会议。
        .where(
          and(eq(meetings.id, input.id), eq(meetings.userId, ctx.auth.user.id))
        )
        // returning 方法指定在更新操作成功后, 返回更新后的完整记录。
        .returning();

      // 如果 updatedMeeting 为空, 意味着没有找到匹配的记录 (可能因为会议 ID 不存在或不属于当前用户)。
      if (!updatedMeeting) {
        // 抛出一个 TRPCError 错误, 告知客户端请求的资源未找到。
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "会议未找到",
        });
      }

      // 将更新后的会议对象返回给客户端。
      return updatedMeeting;
    }),
});
