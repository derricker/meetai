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

// 导入 streamVideo 工具函数, 该函数提供了视频流相关的核心功能: 创建和管理视频会议、处理实时视频流、管理会议参与者等
import { streamVideo } from "@/lib/stream-video";
// 导入 generateAvatarUri 工具函数, 该函数用于: 为用户和AI助手生成头像、支持多种头像样式(initials、bottts等)等
import { generateAvatarUri } from "@/lib/avatar";

// 使用 createTRPCRouter 创建一个名为 meetingsRouter 的 tRPC 路由
export const meetingsRouter = createTRPCRouter({
  /**
   * generateToken 令牌生成过程
   * 该方法用于生成视频会议所需的用户访问令牌
   *
   * 功能说明:
   * 1. 在视频服务中创建或更新用户信息
   * 2. 生成一个有效期为1小时的访问令牌
   *
   * 处理流程:
   * 1. 首先通过 upsertUsers 在视频服务中更新用户信息:
   *    - 设置用户ID和名称
   *    - 分配管理员角色
   *    - 设置用户头像(优先使用现有头像, 否则生成默认头像)
   * 2. 计算令牌的过期时间和签发时间
   * 3. 生成并返回访问令牌
   *
   * 返回数据:
   * @returns {Promise<string>} - 返回生成的访问令牌
   */
  generateToken: protectedProcedure.mutation(async ({ ctx }) => {
    // 在视频服务中创建或更新用户信息
    await streamVideo.upsertUsers([
      {
        id: ctx.auth.user.id,
        name: ctx.auth.user.name,
        role: "admin",
        image:
          ctx.auth.user.image ??
          generateAvatarUri({ seed: ctx.auth.user.name, variant: "initials" }),
      },
    ]);

    // 计算令牌过期时间(当前时间 + 1小时)、1小时后过期
    const expirationTime = Math.floor(Date.now() / 1000) + 3600;
    // 计算令牌签发时间(当前时间 - 1分钟, 留出时间缓冲)
    const issuedAt = Math.floor(Date.now() / 1000) - 60;

    // 生成用户访问令牌
    const token = streamVideo.generateUserToken({
      user_id: ctx.auth.user.id,
      exp: expirationTime,
      validity_in_seconds: issuedAt,
    });

    // 返回生成的令牌
    return token;
  }),
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
   * getOne 查询过程
   * 用于获取单个会议的详细信息
   *
   * 功能说明:
   * 1. 根据会议ID获取单个会议的完整信息
   * 2. 确保用户只能查看自己的会议
   * 3. 返回会议详情，包含关联的AI助手信息和会议时长
   *
   * 输入参数:
   * @param {string} id - 要查询的会议ID
   *
   * 返回数据:
   * @returns {Promise<Meeting & {agent: Agent, duration: number}>} - 返回会议详情，包含AI助手信息和会议时长(秒)
   *
   * 错误处理:
   * - 如果会议不存在或不属于当前用户，抛出 NOT_FOUND 错误
   */
  getOne: protectedProcedure
    // 使用 Zod 定义输入验证 schema，要求必须提供会议 ID
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // 构建查询，获取会议详情
      // 1. 选择会议表的所有字段
      // 2. 关联查询AI助手信息
      // 3. 计算会议持续时间(以秒为单位)
      const [existingMeeting] = await db
        .select({
          ...getTableColumns(meetings),
          agent: agents,
          duration: sql<number>`EXTRACT(EPOCH FROM (ended_at - started_at))`.as(
            "duration"
          ),
        })
        .from(meetings)
        // 关联 agents 表获取AI助手信息
        .innerJoin(agents, eq(meetings.agentId, agents.id))
        // 查询条件：确保会议ID匹配且属于当前用户
        .where(
          and(eq(meetings.id, input.id), eq(meetings.userId, ctx.auth.user.id))
        );

      // 如果未找到匹配的会议记录，抛出 NOT_FOUND 错误
      if (!existingMeeting) {
        throw new TRPCError({ code: "NOT_FOUND", message: "会议未找到" });
      }

      // 返回查询到的会议详情
      return existingMeeting;
    }),

  /**
   * create 创建会议过程
   * 该方法用于创建新的会议记录, 并完成视频会议的初始化设置
   *
   * 功能说明:
   * 1. 创建新的会议数据库记录
   * 2. 初始化视频会议房间
   * 3. 配置会议的录制和转写设置
   * 4. 添加AI助手为会议参与者
   *
   * 处理流程:
   * 1. 在数据库中创建会议记录
   * 2. 使用 Stream Video API 创建视频会议房间:
   *    - 设置会议元数据(ID和名称)
   *    - 配置自动录制和转写功能
   * 3. 验证并获取 AI 助手信息
   * 4. 将AI助手添加为会议参与者
   *
   * 输入参数:
   * - 通过 meetingsInsertSchema 验证的会议创建数据
   *
   * 返回数据:
   * @returns {Promise<Meeting>} - 返回新创建的会议记录
   *
   * 错误处理:
   * - 如果指定的AI助手不存在, 抛出NOT_FOUND错误
   */
  create: protectedProcedure
    // 使用 meetingsInsertSchema 验证输入参数
    .input(meetingsInsertSchema)
    .mutation(async ({ input, ctx }) => {
      // 在数据库中创建新的会议记录
      // 将用户ID和输入的会议信息组合后插入数据库
      const [createdMeeting] = await db
        .insert(meetings)
        .values({ ...input, userId: ctx.auth.user.id })
        .returning();

      // 初始化视频会议房间
      // 使用会议 ID 创建默认类型的视频通话实例
      const call = streamVideo.video.call("default", createdMeeting.id);

      // 创建视频会议并配置相关设置
      // 包括:
      // 1. 设置创建者ID
      // 2. 配置会议元数据(ID和名称)
      // 3. 设置自动转写(中文)和字幕
      // 4. 配置自动录制(1080p质量)
      await call.create({
        data: {
          created_by_id: ctx.auth.user.id,
          custom: {
            meetingId: createdMeeting.id,
            meetingName: createdMeeting.name,
          },
          settings_override: {
            transcription: {
              language: "zh",
              mode: "auto-on",
              closed_caption_mode: "auto-on",
            },
            recording: {
              mode: "auto-on",
              quality: "1080p",
            },
          },
        },
      });

      // 查询并验证AI助手是否存在
      // 从数据库中获取指定ID的AI助手信息
      const [existingAgent] = await db
        .select()
        .from(agents)
        .where(eq(agents.id, createdMeeting.agentId));

      // 如果AI助手不存在, 抛出NOT_FOUND错误
      if (!existingAgent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "未找到智能体",
        });
      }

      // 将AI助手添加为会议参与者
      // 配置AI助手的用户信息，包括:
      // 1. 使用助手ID和名称
      // 2. 设置普通用户角色
      // 3. 生成机器人风格头像
      await streamVideo.upsertUsers([
        {
          id: existingAgent.id,
          name: existingAgent.name,
          role: "user",
          image: generateAvatarUri({
            seed: existingAgent.name,
            variant: "botttsNeutral",
          }),
        },
      ]);

      // 返回创建的会议记录
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

  /**
   * remove 删除过程
   * 该方法用于删除指定ID的会议记录
   *
   * 功能说明:
   * 1. 验证用户权限，确保只能删除自己的会议
   * 2. 根据会议ID删除对应的会议记录
   * 3. 如果会议不存在则抛出错误
   *
   * 输入参数:
   * @param {string} id - 要删除的会议ID
   *
   * 返回数据:
   * @returns {Promise<Meeting>} - 返回被删除的会议记录
   *
   * 错误处理:
   * - 如果会议不存在或不属于当前用户，抛出 NOT_FOUND 错误
   */
  remove: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 执行删除操作，并返回被删除的会议记录
      const [removedMeeting] = await db
        .delete(meetings)
        // 使用 where 子句确保只删除属于当前用户的指定会议
        .where(
          and(eq(meetings.id, input.id), eq(meetings.userId, ctx.auth.user.id))
        )
        // 返回被删除的会议记录信息
        .returning();

      // 如果没有找到要删除的会议记录，抛出错误
      if (!removedMeeting) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "会议未找到",
        });
      }

      // 返回被删除的会议记录
      return removedMeeting;
    }),
});
