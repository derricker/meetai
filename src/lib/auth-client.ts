// 从 better-auth 的 React 集成包中导入创建客户端认证实例的函数
// createAuthClient 用于在浏览器端创建认证客户端, 处理用户登录、注册等前端认证操作
import { createAuthClient } from "better-auth/react";

// 创建并导出认证客户端实例
// 这个实例可以在 React 组件中使用, 用于:
// 1. 处理用户登录、注册、登出等认证操作
// 2. 获取当前用户状态
// 3. 管理认证令牌
// 4. 处理认证状态变化
// 目前使用默认配置, 可以根据需要添加自定义配置
export const authClient = createAuthClient({});
