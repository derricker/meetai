// 从 @dicebear/core 库导入 createAvatar 函数, 用于创建头像
import { createAvatar } from "@dicebear/core";
// 从 @dicebear/collection 库导入 botttsNeutral 和 initials 样式集合, 用于生成不同风格的头像
import { botttsNeutral, initials } from "@dicebear/collection";

// 定义组件或函数的属性接口
interface Props {
  seed: string; // 用于生成头像的种子字符串, 相同的种子会生成相同的头像
  variant: "botttsNeutral" | "initials"; // 头像的样式变体, 可以是 "botttsNeutral" 或 "initials"
}

// 定义 generateAvatarUri 函数, 用于根据提供的种子和样式生成头像的 Data URI
export const generateAvatarUri = ({ seed, variant }: Props) => {
  let avatar; // 声明一个变量用于存储生成的头像对象

  // 根据传入的 variant 选择不同的头像生成样式
  if (variant === "botttsNeutral") {
    // 如果是 "botttsNeutral" 样式，使用 botttsNeutral 集合和种子创建头像
    avatar = createAvatar(botttsNeutral, { seed });
  } else {
    // 如果是 "initials" 样式, 使用 initials 集合和种子创建头像, 并设置字体粗细和字号
    avatar = createAvatar(initials, { seed, fontWeight: 500, fontSize: 42 });
  }

  // 返回生成的头像的 Data URI 字符串, 可以直接用作图片的 src 属性
  return avatar.toDataUri();
};
