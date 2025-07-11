import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// 根据 NODE_ENV 的值加载不同的 .env 文件
// 如果是 'production'，加载 .env.production
// 否则，加载 .env.development
if (process.env.NODE_ENV === "production") {
  config({ path: ".env.production" });
} else {
  config({ path: ".env.development" });
}

// 导出 Drizzle ORM 配置
export default defineConfig({
  // 迁移文件输出目录
  out: "./drizzle",
  // 数据库 schema 文件路径
  schema: "./src/db/schema.ts",
  // 数据库方言, 此处使用 PostgreSQL
  dialect: "postgresql",
  // 数据库连接凭据
  dbCredentials: {
    // 数据库连接 URL，从环境变量中获取
    url: process.env.DATABASE_URL!,
  },
});
