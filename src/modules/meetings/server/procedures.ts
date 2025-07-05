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
import { meetings } from "@/db/schema";
// 导入 tRPC 的路由创建函数和受保护的过程，用于定义 API 端点
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
// 导入 tRPC 的错误类，用于抛出标准化的 API 错误
import { TRPCError } from "@trpc/server";
// 导入 Drizzle ORM 的查询操作符，用于构建 SQL 查询
import { and, count, desc, eq, ilike } from "drizzle-orm";
// 导入 Zod，一个用于数据验证的库
import { z } from "zod";

// 从 meetings 模块的 schemas 文件中导入 Zod 验证 schema，用于校验创建和更新会议时的输入数据。
import { meetingsInsertSchema, meetingsUpdateSchema } from "../schemas";

// 使用 createTRPCRouter 创建一个名为 meetingsRouter 的 tRPC 路由
export const meetingsRouter = createTRPCRouter({
  /**
   * getMany 查询过程 (Query Procedure)
   * 用于分页获取当前认证用户的所有会议列表，并支持按会议名称进行搜索。
   *
   * @param {object} input - 输入参数对象。
   * @param {number} input.page - 请求的页码，默认为 DEFAULT_PAGE。
   * @param {number} input.pageSize - 每页返回的记录数，受 MIN_PAGE_SIZE 和 MAX_PAGE_SIZE 限制，默认为 DEFAULT_PAGE_SIZE。
   * @param {string|null} input.search - 可选的搜索关键词，用于按会议名称进行模糊过滤。
   * @returns {Promise<{items: Meeting[], total: number, totalPages: number}>} 返回一个包含当前页数据、总记录数和总页数的对象。
   */
  getMany: protectedProcedure
    // 使用 Zod 定义输入参数的验证 schema
    .input(
      z.object({
        // page 是一个数字，默认为 1
        page: z.number().default(DEFAULT_PAGE),
        // pageSize 是一个数字，有最小和最大限制，默认为 10
        pageSize: z
          .number()
          .min(MIN_PAGE_SIZE)
          .max(MAX_PAGE_SIZE)
          .default(DEFAULT_PAGE_SIZE),
        // search 是一个可选的字符串
        search: z.string().nullish(),
      })
    )
    // 定义查询的实现
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;

      // 构建查询条件：
      // 1. 会议必须属于当前登录用户 (eq(meetings.userId, ctx.auth.user.id))
      // 2. 如果提供了 search 关键词，则添加名称的模糊匹配条件 (ilike)
      const whereCondition = and(
        eq(meetings.userId, ctx.auth.user.id),
        search ? ilike(meetings.name, `%${search}%`) : undefined
      );

      // 执行查询以获取分页后的数据
      const data = await db
        .select()
        .from(meetings)
        .where(whereCondition)
        // 按创建时间降序排序，保证最新创建的会议在前
        .orderBy(desc(meetings.createdAt), desc(meetings.id))
        // 设置每页数量
        .limit(pageSize)
        // 计算偏移量，用于分页
        .offset((page - 1) * pageSize);

      // 执行另一个查询以获取满足条件的总记录数
      const [total] = await db
        .select({ count: count() })
        .from(meetings)
        .where(whereCondition);

      // 根据总记录数和每页数量计算总页数
      const totalPages = Math.ceil(total.count / pageSize);

      // 返回格式化的响应数据
      return {
        items: data, // 当前页的会议列表
        total: total.count, // 总记录数
        totalPages, // 总页数
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
