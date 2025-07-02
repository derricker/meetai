// 从 zod 库中导入 z 对象
// 在 tRPC 中, 它被广泛用于定义 API 的输入和输出的类型, 并自动进行运行时的数据验证。这确保了进入你 API 的数据是你所期望的格式。
import { z } from "zod";
// 从父级目录的 init 文件中导入两个关键的辅助函数
// baseProcedure: 这是构建 API 端点的基础
// createTRPCRouter: 这是用于创建路由的函数
import { baseProcedure, createTRPCRouter } from "../init";

// 使用 createTRPCRouter 函数创建一个名为 appRouter 的 tRPC 路由并导出它
// 这个路由对象是你的 API 的集合, 它将包含你定义的所有端点
// 你可以把 appRouter 想象成你整个后端 API 的根节点
export const appRouter = createTRPCRouter({
  // 这是在 appRouter 中定义一个具体的 API 端点, 名为 hello
  // baseProcedure 表示这是一个基础的、公开的端点, 不需要任何特殊的权限验证。
  hello: baseProcedure
    // input 定义了这个端点期望接收的输入数据格式
    .input(
      // 它规定输入必须是一个对象, 该对象必须有一个名为 text 的属性并且该属性的值必须是字符串
      // 如果客户端发送了不符合这个格式的数据, 例如 text 不是字符串, 或者缺少 text 属性
      // tRPC 会自动拒绝请求并返回一个错误, 你的业务逻辑代码甚至不会执行
      z.object({
        text: z.string(),
      })
    )
    // 定义了这个端点的类型和实现
    // .query 表示这是一个查询操作, 通常用于获取数据
    // 与用于创建、更新或删除数据的 Mutation 相对
    .query((opts) => {
      // opts.input: 这个对象包含了经过 Zod 验证和类型推断后的客户端输入
      // 因为在 .input() 中定义了 text 是一个字符串, 所以在这里 opts.input.text 的类型就是 string
      // 你可以享受到完整的 TypeScript 类型提示和安全保障

      // 这是端点的返回值, 它会以 JSON 的形式发送回客户端。
      // tRPC 同样会推断出这个返回值的类型, 并在客户端提供相应的类型定义。
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
});

// 这是 tRPC 实现端到端类型安全的关键魔法之一
// 它使用 TypeScript 的 typeof 操作符来从我们刚刚创建的 appRouter 值中推断出它的类型, 并将其导出为 AppRouter 类型
// 这个 AppRouter 类型并不会包含 appRouter 的任何实现细节 (即业务逻辑), 它只包含了整个 API 的 "形状" 或 "骨架"
// 即所有路由的名称、它们的输入类型和输出类型。然后, 你可以在你的前端项目中导入这个 AppRouter 类型
// tRPC 的客户端库会利用它来为你提供完全类型安全的 API 调用体验, 包括自动完成和编译时错误检查
export type AppRouter = typeof appRouter;
