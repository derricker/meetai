// 从 nuqs 库中导入用于解析 URL 查询参数的函数
// parseAsInteger 用于将查询参数解析为整数
// parseAsString 用于将查询参数解析为字符串
// useQueryStates 是一个自定义 Hook，用于管理 URL 查询参数中的多个状态
// parseAsStringEnum 用于将查询参数解析为枚举类型
import {
  parseAsInteger,
  parseAsString,
  useQueryStates,
  parseAsStringEnum,
} from "nuqs";

// 从 @/constants 导入默认页面常量
import { DEFAULT_PAGE } from "@/constants";

// 从当前模块的 types 文件中导入 MeetingStatus 枚举
import { MeetingStatus } from "../types";

/**
 * @function useMeetingsFilters
 * @description 一个自定义 React Hook，用于管理会议列表的过滤状态，这些状态通过 URL 查询参数进行同步。
 * 它利用 `nuqs` 库来解析和更新 URL 中的查询参数，从而实现状态的持久化和共享。
 * @returns 返回一个对象，其中包含会议过滤器的状态以及更新这些状态的方法。
 */
export const useMeetingsFilters = () => {
  // 使用 `useQueryStates` Hook 来定义和管理多个与 URL 查询参数绑定的状态。
  return useQueryStates({
    /**
     * @property {string} search - 会议名称的搜索关键字。
     * `parseAsString` 表示将其解析为字符串。
     * `withDefault("")` 设置默认值为空字符串。
     * `withOptions({ clearOnDefault: true })` 表示当值为默认值时，从 URL 中清除该查询参数，保持 URL 简洁。
     */
    search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
    /**
     * @property {number} page - 当前会议列表的页码。
     * `parseAsInteger` 表示将其解析为整数。
     * `withDefault(DEFAULT_PAGE)` 设置默认值为 `DEFAULT_PAGE` 常量。
     * `withOptions({ clearOnDefault: true })` 表示当值为默认值时，从 URL 中清除该查询参数。
     */
    page: parseAsInteger
      .withDefault(DEFAULT_PAGE)
      .withOptions({ clearOnDefault: true }),
    /**
     * @property {MeetingStatus} status - 会议的状态过滤。
     * `parseAsStringEnum(Object.values(MeetingStatus))` 表示将其解析为 `MeetingStatus` 枚举中的一个值。
     * `Object.values(MeetingStatus)` 用于获取枚举的所有可能值，以便 `nuqs` 进行验证。
     */
    status: parseAsStringEnum(Object.values(MeetingStatus)),
    /**
     * @property {string} agentId - 代理的 ID 过滤。
     * `parseAsString` 表示将其解析为字符串。
     * `withDefault("")` 设置默认值为空字符串。
     * `withOptions({ clearOnDefault: true })` 表示当值为默认值时，从 URL 中清除该查询参数。
     */
    agentId: parseAsString
      .withDefault("")
      .withOptions({ clearOnDefault: true }),
  });
};
