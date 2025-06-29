import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

// 定义用户表, 表名为 "users"
export const usersTable = pgTable("users", {
  // 用户ID, 主键, 自动递增
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  // 用户姓名, 最大长度255, 非空
  name: varchar({ length: 255 }).notNull(),
  // 用户年龄, 非空
  age: integer().notNull(),
  // 用户邮箱, 最大长度255, 非空, 且唯一
  email: varchar({ length: 255 }).notNull().unique(),
});
