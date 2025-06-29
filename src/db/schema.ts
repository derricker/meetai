import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

// 用户表定义
export const user = pgTable("user", {
  // 用户唯一标识符
  id: text("id").primaryKey(),
  // 用户名称
  name: text("name").notNull(),
  // 用户邮箱，唯一且不能为空
  email: text("email").notNull().unique(),
  // 邮箱验证状态，默认为 false
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  // 用户头像 URL
  image: text("image"),
  // 记录创建时间，默认为当前时间
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  // 记录更新时间，默认为当前时间
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// 会话表定义
export const session = pgTable("session", {
  // 会话唯一标识符
  id: text("id").primaryKey(),
  // 会话过期时间
  expiresAt: timestamp("expires_at").notNull(),
  // 会话令牌，唯一且不能为空
  token: text("token").notNull().unique(),
  // 会话创建时间
  createdAt: timestamp("created_at").notNull(),
  // 会话更新时间
  updatedAt: timestamp("updated_at").notNull(),
  // 用户 IP 地址
  ipAddress: text("ip_address"),
  // 用户浏览器信息
  userAgent: text("user_agent"),
  // 关联的用户 ID，级联删除
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

// 账户表定义
export const account = pgTable("account", {
  // 账户唯一标识符
  id: text("id").primaryKey(),
  // 第三方账户 ID
  accountId: text("account_id").notNull(),
  // 认证提供商 ID
  providerId: text("provider_id").notNull(),
  // 关联的用户 ID，级联删除
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  // OAuth 访问令牌
  accessToken: text("access_token"),
  // OAuth 刷新令牌
  refreshToken: text("refresh_token"),
  // OAuth ID 令牌
  idToken: text("id_token"),
  // 访问令牌过期时间
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  // 刷新令牌过期时间
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  // OAuth 权限范围
  scope: text("scope"),
  // 用户密码（如果适用）
  password: text("password"),
  // 记录创建时间
  createdAt: timestamp("created_at").notNull(),
  // 记录更新时间
  updatedAt: timestamp("updated_at").notNull(),
});

// 验证表定义
export const verification = pgTable("verification", {
  // 验证记录唯一标识符
  id: text("id").primaryKey(),
  // 验证标识符（如邮箱）
  identifier: text("identifier").notNull(),
  // 验证值（如验证码）
  value: text("value").notNull(),
  // 验证过期时间
  expiresAt: timestamp("expires_at").notNull(),
  // 记录创建时间，默认为当前时间
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
  // 记录更新时间，默认为当前时间
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
});
