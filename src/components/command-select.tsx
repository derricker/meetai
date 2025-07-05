// 导入 ReactNode 类型和 useState hook
import { ReactNode, useState } from "react";
// 导入 lucide-react 的图标
import { ChevronsUpDownIcon } from "lucide-react";

// 导入工具函数 cn, 用于合并 class 名称
import { cn } from "@/lib/utils";
// 导入自定义的 Button 组件
import { Button } from "@/components/ui/button";
// 导入自定义的 Command 组件及其子组件, 用于构建命令面板
import {
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandResponsiveDialog,
} from "@/components/ui/command";

// 定义组件的 Props 接口
interface Props {
  // 选项列表, 每个选项包含 id、value 和用于显示的 React 节点
  options: Array<{
    id: string;
    value: string;
    children: ReactNode;
  }>;
  onSelect: (value: string) => void; // 选中选项时的回调函数
  onSearch?: (value: string) => void; // 搜索输入变化时的回调函数 (可选)
  value: string; // 当前选中的值
  placeholder?: string; // 占位符文本 (可选)
  isSearchable?: boolean; // 是否可搜索
  className?: string; // 自定义 CSS 类名 (可选)
}

// 定义并导出 CommandSelect 组件
export const CommandSelect = ({
  options, // 选项列表
  onSelect, // 选中回调
  onSearch, // 搜索回调
  value, // 当前值
  placeholder = "请选择", // 默认占位符
  className, // CSS 类名
}: Props) => {
  // 使用 useState 管理命令对话框的打开/关闭状态
  const [open, setOpen] = useState(false);
  // 从选项列表中查找当前选中的选项
  const selectedOption = options.find((option) => option.value === value);

  // 处理对话框打开状态变化的函数
  const handleOpenChange = (open: boolean) => {
    onSearch?.(""); // 当对话框打开或关闭时, 清空搜索词
    setOpen(open); // 更新打开状态
  };

  return (
    <>
      {/* 触发按钮, 点击打开命令对话框 */}
      <Button
        onClick={() => setOpen(true)}
        type="button"
        variant="outline"
        className={cn(
          "h-9 justify-between font-normal px-2", // 基本样式
          !selectedOption && "text-muted-foreground", // 未选中任何项时的样式
          className // 合并外部传入的样式
        )}
      >
        {/* 显示选中的选项内容或占位符 */}
        <div>{selectedOption?.children ?? placeholder}</div>
        {/* 显示上下箭头图标 */}
        <ChevronsUpDownIcon />
      </Button>
      {/* 响应式命令对话框 */}
      <CommandResponsiveDialog
        // 如果提供了 onSearch 回调，则禁用内部过滤，由外部处理
        shouldFilter={!onSearch}
        open={open}
        onOpenChange={handleOpenChange}
      >
        {/* 搜索输入框 */}
        <CommandInput placeholder="搜索..." onValueChange={onSearch} />
        {/* 命令列表 */}
        <CommandList>
          {/* 列表为空时显示的内容 */}
          <CommandEmpty>
            <span className="text-muted-foreground text-sm">
              未找到任何选项
            </span>
          </CommandEmpty>
          {/* 遍历并渲染所有选项 */}
          {options.map((option) => (
            <CommandItem
              key={option.id}
              onSelect={() => {
                onSelect(option.value); // 调用 onSelect 回调
                setOpen(false); // 关闭对话框
              }}
            >
              {option.children} {/* 渲染选项内容 */}
            </CommandItem>
          ))}
        </CommandList>
      </CommandResponsiveDialog>
    </>
  );
};
