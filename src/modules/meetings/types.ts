// 从 @trpc/server 导入 inferRouterOutputs 类型工具
// 这个工具可以从 tRPC 路由器的定义中推断出其输出类型
import { inferRouterOutputs } from "@trpc/server";

// 导入整个应用的 tRPC 路由器类型 AppRouter
// 使用 'type' 关键字确保只导入类型信息，而不会在运行时引入代码
import type { AppRouter } from "@/trpc/routers/_app";

// 定义并导出 MeetingGetOne 类型
// 这个类型代表了调用 tRPC 的 meetings.getOne 过程后返回的数据结构
// inferRouterOutputs<AppRouter> 推断出整个 AppRouter 的所有输出类型
// ["meetings"]["getOne"] 访问了 meetings 路由器下 getOne 过程的输出类型
export type MeetingGetOne = inferRouterOutputs<AppRouter>["meetings"]["getOne"];

// 定义并导出 MeetingGetMany 类型
// 这个类型代表了调用 tRPC 的 meetings.getMany 过程后返回的数据列表
// inferRouterOutputs<AppRouter> 推断出整个 AppRouter 的所有输出类型
// ["meetings"]["getMany"]["items"] 访问了 meetings 路由器下 getMany 过程返回的数据项数组
export type MeetingGetMany =
  inferRouterOutputs<AppRouter>["meetings"]["getMany"]["items"];

// 定义会议状态的枚举类型
export enum MeetingStatus {
  // 即将开始的会议
  Upcoming = "upcoming",
  // 正在进行中的会议
  Active = "active",
  // 已完成的会议
  Completed = "completed",
  // 正在处理中的会议 (例如: 正在生成会议记录)
  Processing = "processing",
  // 已取消的会议
  Cancelled = "cancelled",
}
