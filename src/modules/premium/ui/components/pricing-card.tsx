// 导入 lucide-react 图标库中的圆形勾选图标
import { CircleCheckIcon } from "lucide-react";
// 导入 class-variance-authority 库，用于创建变体样式和类型定义
import { cva, type VariantProps } from "class-variance-authority";

// 导入工具函数，用于合并 CSS 类名
import { cn } from "@/lib/utils";
// 导入 UI 组件
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// 定义价格卡片的主要样式变体
const pricingCardVariants = cva("rounded-lg p-4 py-6 w-full", {
  variants: {
    variant: {
      default: "bg-white text-black", // 默认样式：白色背景，黑色文字
      highlighted: "bg-linear-to-br from-[#093C23] to-[#051B16] text-white", // 高亮样式：渐变背景，白色文字
    },
  },
  defaultVariants: {
    variant: "default", // 默认使用 default 变体
  },
});

// 定义价格卡片中图标的样式变体
const pricingCardIconVariants = cva("size-5", {
  variants: {
    variant: {
      default: "fill-primary text-white", // 默认样式：主色填充，白色文字
      highlighted: "fill-white text-black", // 高亮样式：白色填充，黑色文字
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

// 定义价格卡片中次要文本的样式变体
const pricingCardSecondaryTextVariants = cva("text-neutral-700", {
  variants: {
    variant: {
      default: "text-neutral-700", // 默认样式：深灰色文字
      highlighted: "text-neutral-300", // 高亮样式：浅灰色文字
    },
  },
});

// 定义价格卡片中徽章的样式变体
const pricingCardBadgeVariants = cva("text-black text-xs font-normal p-1", {
  variants: {
    variant: {
      default: "bg-primary/20", // 默认样式：主色背景，20% 透明度
      highlighted: "bg-[#F5B797]", // 高亮样式：橙色背景
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

// 定义价格卡片组件的 Props 接口
interface Props extends VariantProps<typeof pricingCardVariants> {
  badge?: string | null; // 可选的徽章文本
  price: number; // 价格数值
  features: string[]; // 功能特性列表
  title: string; // 卡片标题
  description?: string | null; // 可选的描述文本
  priceSuffix: string; // 价格后缀（如 "/month"）
  className?: string; // 可选的额外 CSS 类名
  buttonText: string; // 按钮文本
  onClick: () => void; // 按钮点击事件处理函数
}

// 导出价格卡片组件
export const PricingCard = ({
  variant,
  badge,
  price,
  features,
  title,
  description,
  priceSuffix,
  className,
  buttonText,
  onClick,
}: Props) => {
  return (
    // 主容器：应用变体样式、自定义类名和边框
    <div className={cn(pricingCardVariants({ variant }), className, "border")}>
      {/* 顶部区域：标题、徽章和价格 */}
      <div className="flex items-end gap-x-4 justify-between">
        {/* 左侧：标题和描述 */}
        <div className="flex flex-col gap-y-2">
          {/* 标题和徽章行 */}
          <div className="flex items-center gap-x-2">
            <h6 className="font-medium text-xl">{title}</h6>
            {/* 如果有徽章则显示 */}
            {badge ? (
              <Badge className={cn(pricingCardBadgeVariants({ variant }))}>
                {badge}
              </Badge>
            ) : null}
          </div>
          {/* 描述文本 */}
          <p
            className={cn(
              "text-xs",
              pricingCardSecondaryTextVariants({ variant })
            )}
          >
            {description}
          </p>
        </div>

        {/* 右侧：价格显示 */}
        <div className="flex items-end shrink-0 gap-x-0.5">
          {/* 主要价格：格式化为美元货币 */}
          <h4 className="text-3xl font-medium">
            {Intl.NumberFormat("en-US", {
              style: "currency", // 货币格式
              currency: "USD", // 美元
              minimumFractionDigits: 0, // 最少小数位数为 0
            }).format(price)}
          </h4>
          {/* 价格后缀（如计费周期） */}
          <span className={cn(pricingCardSecondaryTextVariants({ variant }))}>
            {priceSuffix}
          </span>
        </div>
      </div>

      {/* 分隔线区域 */}
      <div className="py-6">
        <Separator className="opacity-10 text-[#5D6B68]" />
      </div>

      {/* 操作按钮 */}
      <Button
        className="w-full"
        size="lg"
        // 根据变体选择按钮样式：高亮变体使用默认样式，其他使用轮廓样式
        variant={variant === "highlighted" ? "default" : "outline"}
        onClick={onClick}
      >
        {buttonText}
      </Button>

      {/* 功能特性列表 */}
      <div className="flex flex-col gap-y-2 mt-6">
        {/* 功能特性标题 */}
        <p className="font-medium uppercase">功能特性</p>
        {/* 功能特性列表 */}
        <ul
          className={cn(
            "flex flex-col gap-y-2.5",
            pricingCardSecondaryTextVariants({ variant })
          )}
        >
          {/* 遍历功能特性并渲染每一项 */}
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-x-2.5">
              {/* 勾选图标 */}
              <CircleCheckIcon
                className={cn(pricingCardIconVariants({ variant }))}
              />
              {/* 功能特性文本 */}
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
