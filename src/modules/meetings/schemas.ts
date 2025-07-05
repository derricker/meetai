// 导入 Zod 库, Zod 是一个用于数据验证的 TypeScript-first 的库。
// 它可以帮助我们定义数据的结构和验证规则, 确保数据的正确性和一致性。
import { z } from "zod";

// meetingsInsertSchema 定义了用于创建新会议记录时的数据验证 schema。
// 这个 schema 确保了从客户端传入的数据格式是正确的。
export const meetingsInsertSchema = z.object({
  // 定义 name 字段的验证规则。
  name: z
    // name 必须是一个字符串。
    .string()
    // name 字符串的最小长度为1, 如果为空字符串, 则返回指定的错误消息。
    .min(1, { message: "名称是必填项" }),

  // 定义 agentId 字段的验证规则。
  agentId: z
    // agentId 必须是一个字符串。
    .string()
    // agentId 字符串的最小长度为1, 如果为空字符串, 则返回指定的错误消息。
    .min(1, { message: "智能体是必填项" }),
});

// meetingsUpdateSchema 定义了用于更新会议记录时的数据验证 schema。
// 它通过 extend 方法继承了 meetingsInsertSchema 的所有验证规则，
// 并在此基础上添加了针对 id 字段的验证。
export const meetingsUpdateSchema = meetingsInsertSchema.extend({
  // 添加 id 字段的验证规则。
  id: z
    // id 必须是一个字符串。
    .string()
    // id 字符串的最小长度为1, 这是为了确保更新操作时能准确地定位到要修改的记录。
    .min(1, { message: "ID 是必要字段" }),
});
