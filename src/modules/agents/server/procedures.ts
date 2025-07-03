// 导入数据库实例, 用于数据库操作
import { db } from "@/db";
// 导入 agents 表的 schema 定义
import { agents } from "@/db/schema";
// 导入 tRPC 的基础 procedure 和 router 创建函数
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
// 导入 TRPCError 用于处理 API 错误
// import { TRPCError } from "@trpc/server";

// 创建并导出 agents 相关的 tRPC 路由
export const agentsRouter = createTRPCRouter({
  // 定义一个名为 getMany 的查询 procedure
  getMany: baseProcedure.query(async () => {
    // 从 agents 表中查询所有数据
    const data = await db.select().from(agents);
    // 下面是用于测试的注释代码
    // 模拟一个 1 秒的延迟
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    // 抛出一个 "BAD_REQUEST" 错误
    // throw new TRPCError({ code: "BAD_REQUEST" });
    // 返回查询到的数据
    return data;
  }),
});
