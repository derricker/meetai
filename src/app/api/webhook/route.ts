import { and, eq, not } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import {
  CallEndedEvent, // 通话结束事件
  CallTranscriptionReadyEvent, // 通话转录就绪事件
  CallRecordingReadyEvent, // 通话录音就绪事件
  CallSessionParticipantLeftEvent, // 通话参与者离开事件
  CallSessionStartedEvent, // 通话会话开始事件
  MessageNewEvent, // 新的消息事件
} from "@stream-io/node-sdk";

import { db } from "@/db"; // 数据库实例
import { agents, meetings } from "@/db/schema"; // 数据库 schema 中的 agents 和 meetings 表
import { streamVideo } from "@/lib/stream-video"; // Stream Video SDK 实例

// 导入 Inngest 客户端实例，用于处理异步事件和任务队列
import { inngest } from "@/inngest/client";

// 从 @/lib/stream-chat 导入 Stream Chat 客户端实例
import { streamChat } from "@/lib/stream-chat";
// 从 openai 库导入聊天完成消息参数的类型定义
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
// 导入 OpenAI 库
import OpenAI from "openai";
// 从 @/lib/avatar 导入头像 URI 生成函数
import { generateAvatarUri } from "@/lib/avatar";

// 使用环境变量中的 API 密钥初始化 OpenAI 客户端
const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

/**
 * 使用 Stream Video SDK 验证 webhook 签名。
 * @param body 请求体原始字符串。
 * @param signature 请求头中的签名。
 * @returns 签名是否有效。
 */
function verifySignatureWithSDK(body: string, signature: string): boolean {
  return streamVideo.verifyWebhook(body, signature);
}

/**
 * 处理 POST 请求的异步函数，用于接收和处理 Stream Video 的 webhook 事件。
 * @param req NextRequest 对象，包含请求信息。
 * @returns NextResponse 对象，包含响应信息。
 */
export async function POST(req: NextRequest) {
  // 获取请求头中的签名
  const signature = req.headers.get("x-signature");
  // 获取请求头中的 API 密钥
  const apiKey = req.headers.get("x-api-key");

  // 检查签名或 API 密钥是否缺失
  if (!signature || !apiKey) {
    // 返回 400 错误响应
    return NextResponse.json({ error: "缺少签名或API密钥" }, { status: 400 });
  }

  // 获取请求体原始字符串
  const body = await req.text();

  // 验证签名
  if (!verifySignatureWithSDK(body, signature)) {
    // 返回 401 错误响应
    return NextResponse.json({ error: "无效的签名" }, { status: 401 });
  }
  // 定义 payload 变量
  let payload: unknown;

  // 捕获错误
  try {
    // 解析请求体为 JSON 对象
    payload = JSON.parse(body) as Record<string, unknown>;
  } catch {
    // JSON 解析失败, 返回 400 错误响应
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // 获取事件类型
  const eventType = (payload as Record<string, unknown>)?.type;

  // 如果事件类型是 "call.session_started" (通话会话开始)
  if (eventType === "call.session_started") {
    // 将 payload 转换为 CallSessionStartedEvent 类型
    const event = payload as CallSessionStartedEvent;
    // 从事件中获取 meetingId
    const meetingId = event.call.custom?.meetingId;

    // 检查 meetingId 是否缺失
    if (!meetingId) {
      // 返回 400 错误响应
      return NextResponse.json({ error: "缺少会议ID" }, { status: 400 });
    }

    // 查询数据库中是否存在符合条件的会议
    const [existingMeeting] = await db
      .select()
      .from(meetings)
      .where(
        // 确保会议未完成、未激活、未取消、未处理
        and(
          eq(meetings.id, meetingId),
          not(eq(meetings.status, "completed")),
          not(eq(meetings.status, "active")),
          not(eq(meetings.status, "cancelled")),
          not(eq(meetings.status, "processing"))
        )
      );

    // 如果会议不存在
    if (!existingMeeting) {
      // 返回 404 错误响应
      return NextResponse.json({ error: "会议未找到" }, { status: 404 });
    }

    // 更新会议状态为 "active" (激活) 并设置开始时间
    await db
      .update(meetings)
      .set({
        status: "active",
        startedAt: new Date(),
      })
      .where(eq(meetings.id, existingMeeting.id));

    // 查询数据库中是否存在与会议关联的 Agent
    const [existingAgent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, existingMeeting.agentId));

    // 如果 Agent 不存在
    if (!existingAgent) {
      // 返回 404 错误响应
      return NextResponse.json({ error: "智能体未找到" }, { status: 404 });
    }

    // 创建指定会议的视频通话实例 (使用默认配置)
    const call = streamVideo.video.call("default", meetingId);
    // 连接 OpenAI 客户端, 建立与 OpenAI 的实时连接
    const realtimeClient = await streamVideo.video.connectOpenAi({
      // 之前创建的视频通话实例
      call,
      // 从环境变量获取 OpenAI API 密钥
      openAiApiKey: process.env.OPENAI_API_KEY!,
      // 当前智能体的 ID
      agentUserId: existingAgent.id,
    });

    // 更新会话
    realtimeClient.updateSession({
      // 将智能体的指令应用到当前会话中
      instructions: existingAgent.instructions,
    });
  } else if (eventType === "call.session_participant_left") {
    // 如果事件类型是 "call.session_participant_left" (通话参与者离开)
    // 将 payload 转换为 CallSessionParticipantLeftEvent 类型
    const event = payload as CallSessionParticipantLeftEvent;
    // 从 call_cid 中提取 meetingId (格式为 "type:id")
    const meetingId = event.call_cid.split(":")[1];

    // 检查 meetingId 是否缺失
    if (!meetingId) {
      // 返回 400 错误响应
      return NextResponse.json({ error: "缺少会议ID" }, { status: 400 });
    }

    // 创建 Stream Video Call 实例
    const call = streamVideo.video.call("default", meetingId);
    // 结束通话
    await call.end();
  } else if (eventType === "call.session_ended") {
    // 如果事件类型是 call.session_ended, 表示通话会话已结束
    // 将 payload 断言为 CallEndedEvent 类型
    const event = payload as CallEndedEvent;
    // 从事件中获取自定义的会议ID
    const meetingId = event.call.custom?.meetingId;

    // 如果会议ID不存在
    if (!meetingId) {
      // 返回错误响应, 提示缺少会议ID, 状态码为 400
      return NextResponse.json({ error: "缺少会议ID" }, { status: 400 });
    }

    // 使用 drizzle ORM 更新数据库
    await db
      // 更新 meetings 表
      .update(meetings)
      // 设置更新的字段
      .set({
        // 将会议状态设置为 "processing" (处理中)
        status: "processing",
        // 设置会议结束时间为当前时间
        endedAt: new Date(),
      })
      // 根据会议 ID 和当前状态为 active (活跃) 的条件进行更新
      .where(and(eq(meetings.id, meetingId), eq(meetings.status, "active")));
  } else if (eventType === "call.transcription_ready") {
    // 如果事件类型是 call.transcription_ready, 表示通话转录已准备就绪
    // 将 payload 断言为 CallTranscriptionReadyEvent 类型
    const event = payload as CallTranscriptionReadyEvent;
    // 从 call_cid 中提取会议 ID, call_cid 的格式是 type:id
    const meetingId = event.call_cid.split(":")[1];

    // 使用 drizzle ORM 更新数据库
    const [updatedMeeting] = await db
      // 更新meetings表
      .update(meetings)
      .set({
        // 将转录 URL 设置为事件中提供的 URL
        transcriptUrl: event.call_transcription.url,
      })
      // 根据会议ID进行更新
      .where(eq(meetings.id, meetingId))
      // 返回更新后的记录
      .returning();
    // 如果没有找到要新的会议
    if (!updatedMeeting) {
      // 返回错误响应, 提示会议未找到, 状态码为 404
      return NextResponse.json({ error: "会议未找到" }, { status: 404 });
    }

    // 发送会议处理事件到 Inngest
    // 包含会议ID和转录URL的数据
    await inngest.send({
      // 事件名称为 meetings/processing
      name: "meetings/processing",
      data: {
        // 传递更新后的会议ID
        meetingId: updatedMeeting.id,
        // 传递转录文件的URL
        transcriptUrl: updatedMeeting.transcriptUrl,
      },
    });
  } else if (eventType === "call.recording_ready") {
    // 如果事件类型是 call.recording_ready, 表示通话录音已准备就绪
    // 将 payload 断言为 CallRecordingReadyEvent 类型
    const event = payload as CallRecordingReadyEvent;
    // 从 call_cid 中提取会议ID, call_cid 的格式是 "type:id"
    const meetingId = event.call_cid.split(":")[1]; // call_cid is formatted as "type:id"
    // 使用 drizzle ORM 更新数据库
    await db
      // 更新 meetings 表
      .update(meetings)
      // 设置更新的字段
      .set({
        // 将录音 URL 设置为事件中提供的 URL
        recordingUrl: event.call_recording.url,
      })
      // 根据会议 ID 进行更新
      .where(eq(meetings.id, meetingId));
  } else if (eventType === "message.new") {
    // 如果事件类型是 message.new, 表示新消息事件
    // 将收到的 Webhook 负载断言为 MessageNewEvent 类型
    const event = payload as MessageNewEvent;

    // 从事件中提取用户 ID、频道 ID 和消息文本
    const userId = event.user?.id;
    const channelId = event.channel_id;
    const text = event.message?.text;

    // 检查必要字段是否存在，如果缺少则返回 400 错误
    if (!userId || !channelId || !text) {
      return NextResponse.json({ error: "缺少必要字段" }, { status: 400 });
    }

    // 在数据库中查询已完成的会议
    const [existingMeeting] = await db
      .select()
      .from(meetings)
      .where(and(eq(meetings.id, channelId), eq(meetings.status, "completed")));

    // 如果找不到对应的会议，则返回 404 错误
    if (!existingMeeting) {
      return NextResponse.json({ error: "会议未找到" }, { status: 404 });
    }

    // 在数据库中查询与会议关联的智能体（Agent）
    const [existingAgent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, existingMeeting.agentId));

    // 如果找不到对应的智能体，则返回 404 错误
    if (!existingAgent) {
      return NextResponse.json({ error: "智能体未找到" }, { status: 404 });
    }

    // 检查消息是否由智能体自身发送，如果不是，则继续处理
    if (userId !== existingAgent.id) {
      // 构建给 GPT-4o 的指令（instructions）
      const instructions = `
      您是一个 AI 助手，正在帮助用户回顾一个最近完成的会议。
      以下是根据会议记录生成的会议摘要：
      
      ${existingMeeting.summary}
      
      以下是您在实时会议助手期间的原始指令。在协助用户时，请继续遵循这些行为准则：
      
      ${existingAgent.instructions}
      
      用户可能会询问有关会议的问题、请求澄清或要求采取后续行动。
      请始终基于上述会议摘要进行回应。
      
      您还可以访问您与用户之间的最近对话历史记录。请使用先前消息的上下文来提供相关、连贯和有用的回应。如果用户的问题涉及到之前讨论过的内容，请务必考虑到这一点并保持对话的连续性。
      
      如果摘要中没有足够的信息来回答问题，请礼貌地告知用户。
      
      请做到简洁、有帮助，并专注于根据会议和正在进行的对话提供准确的信息。
      `;

      // 初始化 Stream Chat 客户端并指定频道
      const channel = streamChat.channel("messaging", channelId);
      // 监听频道以获取最新状态
      await channel.watch();

      // 获取并格式化最近 5 条非空消息作为对话历史
      const previousMessages = channel.state.messages
        .slice(-5)
        .filter((msg) => msg.text && msg.text.trim() !== "")
        .map<ChatCompletionMessageParam>((message) => ({
          role: message.user?.id === existingAgent.id ? "assistant" : "user",
          content: message.text || "",
        }));

      // 调用 OpenAI API 获取 GPT 的响应
      const GPTResponse = await openaiClient.chat.completions.create({
        messages: [
          { role: "system", content: instructions }, // 系统指令
          ...previousMessages, // 对话历史
          { role: "user", content: text }, // 用户的新消息
        ],
        model: "gpt-4o", // 使用的模型
      });

      // 提取 GPT 的响应文本
      const GPTResponseText = GPTResponse.choices[0].message.content;

      // 如果 GPT 未返回任何内容，则返回 400 错误
      if (!GPTResponseText) {
        return NextResponse.json(
          { error: "No response from GPT" },
          { status: 400 }
        );
      }

      // 为智能体生成一个头像 URI
      const avatarUrl = generateAvatarUri({
        seed: existingAgent.name,
        variant: "botttsNeutral",
      });

      // 在 Stream Chat 中创建或更新智能体的用户信息
      streamChat.upsertUser({
        id: existingAgent.id,
        name: existingAgent.name,
        image: avatarUrl,
      });

      // 将 GPT 生成的响应作为智能体的消息发送到频道
      channel.sendMessage({
        text: GPTResponseText,
        user: {
          id: existingAgent.id,
          name: existingAgent.name,
          image: avatarUrl,
        },
      });
    }
  }
  // 返回成功响应
  return NextResponse.json({ status: "ok" });
}
