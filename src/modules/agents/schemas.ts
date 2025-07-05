// 导入 Zod 库
import { z } from "zod";

// agentsInsertSchema 是一个使用 Zod 定义的 schema 对象
// 它用于验证创建新智能体时客户端提交的数据的格式和内容
// 这个 schema 确保了传入的数据包含有效的 name 和 instructions 字段。
export const agentsInsertSchema = z.object({
  // 定义 name字段的验证规则。
  name: z
    // 必须是一个字符串
    .string()
    // 字符串长度至少为1, 如果为空则返回指定的错误消息
    .min(1, { message: "名称是必填项" }),

  // 定义 instructions 字段的验证规则。
  instructions: z
    // 必须是一个字符串
    .string()
    // 字符串长度至少为1, 如果为空则返回指定的错误消息
    .min(1, { message: "指令是必填项" }),
});

// agentsUpdateSchema 是一个用于验证更新智能体数据的 schema
// 它继承了 agentsInsertSchema 的所有验证规则 (name 和 instructions)
// 并通过 extend 方法扩展了新的验证规则
export const agentsUpdateSchema = agentsInsertSchema.extend({
  // 添加 id 字段的验证规则
  // id 必须是字符串类型
  // 字符串长度至少为1, 如果为空则返回错误消息
  id: z.string().min(1, { message: "ID 是必要字段" }),
});
