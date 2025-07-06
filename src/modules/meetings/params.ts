// 从 "nuqs/server" 库中导入用于服务器端 URL 查询参数处理的函数。
// `createLoader` 用于创建一个加载器，以便在服务器端解析 URL 查询参数。
// `parseAsInteger` 用于将查询参数解析为整数。
// `parseAsString` 用于将查询参数解析为字符串。
// `parseAsStringEnum` 用于将查询参数解析为枚举类型。
import {
  createLoader,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

// 从 '@/constants' 导入默认页面常量。
import { DEFAULT_PAGE } from "@/constants";

// 从当前模块的 'types' 文件中导入 MeetingStatus 枚举。
import { MeetingStatus } from "./types";

/**
 * @constant filtersSearchParams
 * @description 定义了会议过滤器的搜索参数配置对象。
 * 这些配置用于 `nuqs` 库来解析和验证 URL 中的查询参数。
 */
export const filtersSearchParams = {
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
  agentId: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
};

/**
 * @constant loadSearchParams
 * @description 使用 `createLoader` 创建一个加载器，该加载器能够根据 `filtersSearchParams` 的定义来解析传入的 URL 查询参数。
 * 这个加载器可以在服务器端（例如 Next.js 的 `getServerSideProps` 或 `getStaticProps`）使用，用于预加载和验证数据。
 */
export const loadSearchParams = createLoader(filtersSearchParams);
