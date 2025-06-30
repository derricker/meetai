// 导入DiceBear的核心创建头像函数
import { createAvatar } from "@dicebear/core";
// 导入两种头像样式：botttsNeutral（机器人风格）和initials（文字初始化）
import { botttsNeutral, initials } from "@dicebear/collection";

// 导入工具函数和头像UI组件
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// 定义组件属性接口
interface GeneratedAvatarProps {
  // 用于生成头像的种子字符串
  seed: string;
  // 可选的自定义类名
  className?: string;
  // 头像变体类型：可以是机器人风格或文字初始化
  variant: "botttsNeutral" | "initials";
}

// 导出生成头像组件
export const GeneratedAvatar = ({
  seed,
  className,
  variant,
}: GeneratedAvatarProps) => {
  let avatar;

  // 根据variant选择不同的头像生成方式
  if (variant === "botttsNeutral") {
    // 生成机器人风格的头像
    avatar = createAvatar(botttsNeutral, {
      seed,
    });
  } else {
    // 生成基于文字初始化的头像
    avatar = createAvatar(initials, {
      seed,
      fontWeight: 500,  // 设置字体粗细
      fontSize: 42,     // 设置字体大小
    });
  }

  return (
    // 渲染头像组件，合并自定义类名
    <Avatar className={cn(className)}>
      {/* 显示生成的头像图片 */}
      <AvatarImage src={avatar.toDataUri()} alt="Avatar" />
      {/* 当图片加载失败时显示种子字符串的首字母大写形式 */}
      <AvatarFallback>{seed.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
};
