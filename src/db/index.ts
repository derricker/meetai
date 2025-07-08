// 从 "drizzle-orm/node-postgres" 模块导入 drizzle 函数，用于创建 Drizzle ORM 实例
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// 创建 PostgreSQL 连接池
const pool = new Pool({
  // process.env.DATABASE_URL! 表示从环境变量中获取 DATABASE_URL，并使用非空断言确保其不为 null 或 undefined
  connectionString: process.env.DATABASE_URL!,
});

// 导出 db 常量, 它是 Drizzle ORM 的数据库实例
// drizzle 函数接收一个数据库连接字符串作为参数
export const db = drizzle(pool);
