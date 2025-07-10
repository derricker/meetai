// 从 inngest 包中导入 Inngest 类
// Inngest 是一个帮助你轻松、可靠地运行后台函数、处理事件和构建工作流的平台
import { Inngest } from "inngest";

// 创建并导出一个 Inngest 客户端实例
// 这个实例是与 Inngest 服务交互的主要方式
// id 参数是你的 Inngest 应用的唯一标识符, 这里设置为 "meet-ai"。
export const inngest = new Inngest({ id: "meet-ai" });
