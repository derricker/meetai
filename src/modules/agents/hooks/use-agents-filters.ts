// 从 nuqs 库导入用于解析和管理 URL 查询参数的工具函数
// parseAsInteger: 将查询参数解析为整数类型
// parseAsString: 将查询参数解析为字符串类型
// useQueryStates: 用于管理多个查询参数状态的 Hook
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

// 从常量文件导入默认页码值
import { DEFAULT_PAGE } from "@/constants";

/**
 * useAgentsFilters - 智能体列表过滤器 Hook
 *
 * 这个自定义 Hook 用于管理智能体列表页面的过滤和分页状态
 * 它将过滤条件同步到 URL 查询参数中, 使得页面状态可以通过 URL 分享和恢复
 *
 * @returns {Object} 返回包含查询状态和更新函数的对象
 * @returns {string} search - 搜索关键词, 默认为空字符串
 * @returns {number} page - 当前页码, 默认为 DEFAULT_PAGE 常量值
 * @returns {Function} setSearch - 更新搜索关键词的函数
 * @returns {Function} setPage - 更新页码的函数
 * @returns {Function} setFilters - 批量更新过滤条件的函数
 */
export const useAgentsFilters = () => {
  return useQueryStates({
    // 搜索关键词参数配置
    // parseAsString: 将 URL 参数解析为字符串
    // withDefault(""): 设置默认值为空字符串
    // clearOnDefault: true - 当值为默认值时, 从 URL 中移除该参数, 保持 URL 简洁
    search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),

    // 页码参数配置
    // parseAsInteger: 将 URL 参数解析为整数
    // withDefault(DEFAULT_PAGE): 设置默认页码值
    // clearOnDefault: true - 当页码为默认值时，从 URL 中移除该参数
    page: parseAsInteger
      .withDefault(DEFAULT_PAGE)
      .withOptions({ clearOnDefault: true }),
  });
};
