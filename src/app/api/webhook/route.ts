import { and, eq, not } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import {
  CallEndedEvent, // 通话结束事件
  CallTranscriptionReadyEvent, // 通话转录就绪事件
  CallRecordingReadyEvent, // 通话录音就绪事件
  CallSessionParticipantLeftEvent, // 通话参与者离开事件
  CallSessionStartedEvent, // 通话会话开始事件
} from "@stream-io/node-sdk";

import { db } from "@/db"; // 数据库实例
import { agents, meetings } from "@/db/schema"; // 数据库 schema 中的 agents 和 meetings 表
import { streamVideo } from "@/lib/stream-video"; // Stream Video SDK 实例

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
  }
  // 返回成功响应
  return NextResponse.json({ status: "ok" });
}
