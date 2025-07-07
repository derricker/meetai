// 引入 Next.js 的 Link 组件, 用于客户端路由导航
import Link from "next/link";

// 引入自定义的 Button 组件, 通常来自 UI 组件库
import { Button } from "@/components/ui/button";

/**
 * @description CallEnded 组件用于显示通话结束后的界面。
 * 它会告知用户通话已结束, 并提供一个返回会议列表的链接。
 */
export const CallEnded = () => {
  return (
    // 根容器, 全屏高度, 使用径向渐变背景, 并居中显示内容
    <div className="flex flex-col items-center justify-center h-full bg-radial from-sidebar-accent to-sidebar">
      {/* 内容区域, 垂直和水平居中, 并占据可用空间 */}
      <div className="py-4 px-8 flex flex-1 items-center justify-center">
        {/* 内部卡片容器, 包含通话结束信息和返回按钮 */}
        <div className="flex flex-col items-center justify-center gap-y-6 bg-background rounded-lg p-10 shadow-sm">
          {/* 文本信息区域, 显示通话结束提示和摘要生成提示 */}
          <div className="flex flex-col gap-y-2 text-center">
            {/* 通话结束标题 */}
            <h6 className="text-lg font-medium">你已经结束了通话</h6>
            {/* 摘要生成提示 */}
            <p className="text-sm">摘要将在几分钟后出现</p>
          </div>
          {/* 返回会议列表的按钮 */}
          <Button asChild>
            {/* Link 组件包裹 Button, 实现导航 */}
            <Link href="/meetings">返回会议列表</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
