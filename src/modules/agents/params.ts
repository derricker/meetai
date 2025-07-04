// 从 nuqs/server 库导入服务端查询参数处理工具
// createLoader: 创建服务端查询参数加载器的函数
// parseAsInteger: 将查询参数解析为整数类型的解析器
// parseAsString: 将查询参数解析为字符串类型的解析器
import { createLoader, parseAsInteger, parseAsString } from "nuqs/server";

// 从常量文件导入默认页码值
import { DEFAULT_PAGE } from "@/constants";

/**
 * filtersSearchParams - 智能体列表过滤器查询参数配置
 *
 * 定义了智能体列表页面支持的所有查询参数及其解析规则。
 * 这个配置对象用于在服务端和客户端之间保持查询参数的一致性。
 *
 * 配置说明:
 * - search: 搜索关键词参数, 用于过滤代理列表
 * - page: 分页参数, 用于控制当前显示的页码
 *
 * 每个参数都配置了:
 * - 默认值: 当 URL 中没有该参数时使用的默认值
 * - clearOnDefault: true - 当参数值等于默认值时, 自动从 URL 中移除该参数
 */
export const filtersSearchParams = {
  // 搜索关键词参数配置
  // parseAsString: 将 URL 参数解析为字符串类型
  // withDefault(""): 设置默认值为空字符串, 表示无搜索条件
  // clearOnDefault: true - 当搜索为空时, 从 URL 中移除 search 参数, 保持 URL 简洁
  search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),

  // 页码参数配置
  // parseAsInteger: 将 URL 参数解析为整数类型
  // withDefault(DEFAULT_PAGE): 设置默认页码为常量 DEFAULT_PAGE (通常为 1)
  // clearOnDefault: true - 当页码为默认值时, 从 URL 中移除 page 参数
  page: parseAsInteger
    .withDefault(DEFAULT_PAGE)
    .withOptions({ clearOnDefault: true }),
};

/**
 * loadSearchParams - 服务端查询参数加载器
 *
 * 使用 createLoader 函数基于 filtersSearchParams 配置创建的加载器。
 * 这个加载器主要用于：
 *
 * 1. 服务端渲染: 在服务端预先解析和验证查询参数
 * 2. 类型安全: 提供完整的 TypeScript 类型支持
 * 3. 参数验证: 确保查询参数符合预定义的格式和类型
 * 4. 默认值处理: 自动应用配置的默认值
 *
 */
export const loadSearchParams = createLoader(filtersSearchParams);
