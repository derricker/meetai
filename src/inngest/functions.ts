// 从 'drizzle-orm' 导入 eq 和 inArray, 用于构建数据库查询条件
import { eq, inArray } from "drizzle-orm";
// 导入 JSONL 用于解析和字符串化 JSON Lines 格式的数据
import JSONL from "jsonl-parse-stringify";
// 从 '@inngest/agent-kit' 导入创建 agent 和与 openai 交互的工具
import { createAgent, openai, TextMessage } from "@inngest/agent-kit";

// 导入数据库实例
import { db } from "@/db";
// 导入数据库表结构
import { agents, meetings, user } from "@/db/schema";
// 导入 inngest 客户端
import { inngest } from "@/inngest/client";

// 导入会议模块的类型定义
import { StreamTranscriptItem } from "@/modules/meetings/types";

// 创建一个名为 'summarizer' 的 agent, 用于生成会议摘要
const summarizer = createAgent({
  // agent 的名称
  name: "summarizer",
  // 系统提示, 指导 AI 如何行动
  system: `
    您是一位专业的摘要撰写员。您能撰写可读、简洁、简单的内容。您将获得一份会议记录，需要对其进行摘要。

    请为每个输出使用以下 markdown 结构：

    ### 概述
    详细、引人入胜地总结会议内容。重点关注主要功能、用户工作流程以及任何关键要点。以叙事风格撰写，使用完整的句子。突出产品、平台或讨论的独特或强大之处。

    ### 笔记
    将关键内容按主题分解，并附上时间戳范围。每个部分应以项目符号格式总结要点、行动或演示。

    示例：
    #### 部分名称
    - 此处显示的主要观点或演示
    - 另一个关键见解或互动
    - 提供的后续工具或解释

    #### 下一部分
    - 功能 X 会自动执行 Y
    - 提及与 Z 的集成
  `.trim(),
  // 使用 OpenAI 的 gpt-4o 模型
  model: openai({ model: "gpt-4o", apiKey: process.env.OPENAI_API_KEY }),
});

// 创建一个 Inngest 函数, 用于处理会议
export const meetingsProcessing = inngest.createFunction(
  // 函数的唯一 ID
  { id: "meetings/processing" },
  // 触发此函数的事件名称
  { event: "meetings/processing" },
  async ({ event, step }) => {
    // 步骤1: 获取会议记录
    const response = await step.run("fetch-transcript", async () => {
      return fetch(event.data.transcriptUrl).then((res) => res.text());
    });

    // 步骤2: 解析会议记录
    const transcript = await step.run("parse-transcript", async () => {
      // 将获取的文本解析为 StreamTranscriptItem 类型的数组
      return JSONL.parse<StreamTranscriptItem>(response);
    });

    // 步骤3: 为记录添加发言人信息
    const transcriptWithSpeakers = await step.run("add-speakers", async () => {
      // 提取所有唯一的发言人 ID
      const speakerIds = [
        ...new Set(transcript.map((item) => item.speaker_id)),
      ];

      // 从数据库中查询用户信息
      const userSpeakers = await db
        .select()
        .from(user)
        .where(inArray(user.id, speakerIds))
        .then((users) =>
          users.map((user) => ({
            ...user,
          }))
        );

      // 从数据库中查询 agent 信息
      const agentSpeakers = await db
        .select()
        .from(agents)
        .where(inArray(agents.id, speakerIds))
        .then((agents) =>
          agents.map((agent) => ({
            ...agent,
          }))
        );

      // 合并用户和 agent 发言人
      const speakers = [...userSpeakers, ...agentSpeakers];

      // 将发言人信息映射到会议记录的每个项目中
      return transcript.map((item) => {
        const speaker = speakers.find(
          (speaker) => speaker.id === item.speaker_id
        );

        // 如果找不到发言人, 则标记为未知
        if (!speaker) {
          return {
            ...item,
            user: {
              name: "Unknown",
            },
          };
        }

        // 返回带有发言人姓名的记录项
        return {
          ...item,
          user: {
            name: speaker.name,
          },
        };
      });
    });

    // 步骤4: 使用 summarizer agent 生成摘要
    const { output } = await summarizer.run(
      "总结以下记录: " + JSON.stringify(transcriptWithSpeakers)
    );

    // 步骤5: 保存摘要到数据库
    await step.run("save-summary", async () => {
      await db
        // 更新 meetings 表
        .update(meetings)
        .set({
          // 设置摘要内容
          summary: (output[0] as TextMessage).content as string,
          // 将状态更新为"已完成"
          status: "completed",
        })
        // 根据会议 ID 匹配记录
        .where(eq(meetings.id, event.data.meetingId));
    });
  }
);
