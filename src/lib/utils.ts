// 导入 clsx 库，用于根据条件动态组合 class 名称
import { clsx, type ClassValue } from "clsx";
// 导入 tailwind-merge 库，用于合并 Tailwind CSS 类，解决冲突
import { twMerge } from "tailwind-merge";
// 导入 humanize-duration 库，用于将时间长度转换为人类可读的格式
import humanizeDuration from "humanize-duration";

/**
 * 合并多个 class 名称，并使用 tailwind-merge 解决 Tailwind CSS 的类名冲突。
 * @param inputs - 一个或多个 class 值 (字符串、数组、对象等)
 * @returns {string} - 合并后的 class 字符串
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 将秒数格式化为人类可读的时间长度字符串。
 * @param seconds - 时间长度，单位为秒
 * @returns {string} - 格式化后的时间字符串 (例如: "1 hour", "5 minutes")
 */
export function formatDuration(seconds: number) {
  // humanize-duration 需要毫秒作为输入，所以乘以 1000
  return humanizeDuration(seconds * 1000, {
    largest: 1, // 只显示最大的时间单位 (例如，90秒会显示 "2 minutes" 而不是 "1 minute, 30 seconds")
    round: true, // 对结果进行四舍五入
    units: ["h", "m", "s"], // 使用小时(h)、分钟(m)、秒(s)作为单位
  });
}
