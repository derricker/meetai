// 从 "drizzle-orm/neon-http" 模块导入 drizzle 函数, 用于创建 Drizzle ORM 实例
import { drizzle } from "drizzle-orm/neon-http";

// 导出 db 常量, 它是 Drizzle ORM 的数据库实例
// drizzle 函数接收一个数据库连接字符串作为参数
// process.env.DATABASE_URL! 表示从环境变量中获取 DATABASE_URL，并使用非空断言确保其不为 null 或 undefined
export const db = drizzle(process.env.DATABASE_URL!);
