// 导入之前配置的认证实例
import { auth } from "@/lib/auth";
// 导入 Next.js 路由处理器转换工具
import { toNextJsHandler } from "better-auth/next-js";

// 导出 POST 和 GET 处理函数, 用于处理认证相关的 HTTP 请求
// [...all] 表示这是一个动态路由, 可以处理所有认证相关的路径
export const { POST, GET } = toNextJsHandler(auth);
