// 导入 Button 组件, 这是一个可重用的 UI 按钮组件
import { Button } from "@/components/ui/button";

// 定义组件的 Props 接口, 明确组件需要接收的参数类型
interface Props {
  page: number; // 当前页码, 从 1 开始
  totalPages: number; // 总页数
  onPageChange: (page: number) => void; // 页码变化时的回调函数
}

// 导出数据分页组件
// 这个组件提供了基本的分页功能, 包括显示当前页信息和上一页/下一页按钮
export const DataPagination = ({ page, totalPages, onPageChange }: Props) => {
  return (
    // 主容器: 使用 flex 布局, 在水平方向上分散对齐子元素
    <div className="flex items-center justify-between">
      {/* 左侧: 显示当前页码信息 */}
      <div className="flex-1 text-sm text-muted-foreground">
        {/* 显示格式: "Page X of Y"，如果总页数为 0 则显示为 1 */}
        当前页 {page} 总页数 {totalPages || 1}
      </div>

      {/* 右侧: 分页按钮区域 */}
      <div className="flex items-center justify-end space-x-2 py-4">
        {/* 上一页按钮 */}
        <Button
          // 当在第一页时禁用按钮
          disabled={page === 1}
          // 使用轮廓样式
          variant="outline"
          // 小尺寸按钮
          size="sm"
          // 点击时跳转到上一页, 但不能小于第 1 页
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          上一页
        </Button>

        {/* 下一页按钮 */}
        <Button
          // 当在最后一页或总页数为 0 时禁用按钮
          disabled={page === totalPages || totalPages === 0}
          // 使用轮廓样式
          variant="outline"
          // 小尺寸按钮
          size="sm"
          // 点击时跳转到下一页, 但不能超过总页数
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        >
          下一页
        </Button>
      </div>
    </div>
  );
};
