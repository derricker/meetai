// 从 Next.js 导入 Image 组件, 这是一个优化过的图片组件
// 提供了自动图片优化、懒加载、响应式图片等功能
import Image from "next/image";

/**
 * EmptyState 组件的属性接口定义
 * 用于定义组件接收的 props 类型
 */
interface Props {
  title: string; // 空状态的标题文字, 必需属性
  description: string; // 空状态的描述文字, 必需属性
  image?: string; // 可选的图片路径, 如果不提供则使用默认图片
}

/**
 * EmptyState 空状态组件
 * 用于在没有数据或内容为空时显示友好的提示界面
 * 通常包含一个插图、标题和描述文字, 引导用户进行下一步操作
 *
 * @param title 显示的标题文字
 * @param description 显示的描述文字
 * @param image 可选的图片路径, 默认为 "/empty.svg"
 */
export const EmptyState = ({
  title,
  description,
  image = "/empty.svg", // 设置默认图片路径为 public 目录下的 empty.svg
}: Props) => {
  return (
    // 主容器：使用 Flexbox 垂直布局，内容居中对齐
    // flex flex-col: 垂直 Flexbox 布局
    // items-center: 水平居中对齐
    // justify-center: 垂直居中对齐
    <div className="flex flex-col items-center justify-center">
      {/* 空状态插图 */}
      {/* 使用 Next.js 的 Image 组件显示图片 */}
      {/* src: 图片源路径, 来自 props 或默认值 */}
      {/* alt: 图片的替代文字, 用于无障碍访问 */}
      {/* width/height: 图片的显示尺寸, 240x240 像素 */}
      <Image src={image} alt="Empty" width={240} height={240} />

      {/* 文字内容容器 */}
      {/* flex flex-col: 垂直 Flexbox 布局 */}
      {/* gap-y-6: 子元素之间的垂直间距 1.5rem */}
      {/* max-w-md: 最大宽度限制为 28rem (448px) */}
      {/* mx-auto: 水平居中 */}
      {/* text-center: 文字居中对齐 */}
      <div className="flex flex-col gap-y-6 max-w-md mx-auto text-center">
        {/* 标题文字 */}
        {/* text-lg: 字体大小 1.125rem */}
        {/* font-medium: 字体粗细为中等 */}
        <h6 className="text-lg font-medium">{title}</h6>

        {/* 描述文字 */}
        {/* text-sm: 字体大小 0.875rem */}
        {/* text-muted-foreground: 使用弱化的前景色, 通常为灰色 */}
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};
