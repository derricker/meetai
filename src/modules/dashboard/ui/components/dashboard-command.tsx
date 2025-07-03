// 导入React相关类型和钩子
import { Dispatch, SetStateAction, useState } from "react";

// 导入命令面板相关组件
import {
  CommandInput, // 命令输入框
  CommandItem, // 命令项
  CommandList, // 命令列表
  CommandGroup, // 命令分组
  CommandEmpty,
  CommandResponsiveDialog, // 空状态显示
} from "@/components/ui/command";
// 导入头像生成组件
import { GeneratedAvatar } from "@/components/generated-avatar";

// 定义组件属性接口
interface Props {
  // 控制命令面板的显示状态
  open: boolean;
  // 设置命令面板显示状态的函数
  setOpen: Dispatch<SetStateAction<boolean>>;
}

// 导出仪表盘命令面板组件
export const DashboardCommand = ({ open, setOpen }: Props) => {
  // 管理搜索输入的状态
  const [search, setSearch] = useState("");
  return (
    // 命令对话框，根据open状态显示或隐藏
    <CommandResponsiveDialog open={open} onOpenChange={setOpen}>
      {/* 搜索输入框 */}
      <CommandInput
        placeholder="查找会议或者智能体" // 占位文本
        value={search} // 输入值
        onValueChange={(value) => setSearch(value)} // 值变化处理函数
      />
      {/* 命令列表容器 */}
      <CommandList>
        {/* 会议相关命令分组 */}
        <CommandGroup heading="Meetings">
          {/* 无结果时显示的空状态 */}
          <CommandEmpty>
            <span className="text-muted-foreground text-sm">
              没有找到任何会议
            </span>
          </CommandEmpty>
          {/* 会议项示例 */}
          <CommandItem>会议名称</CommandItem>
        </CommandGroup>
        {/* 智能体相关命令分组 */}
        <CommandGroup heading="Agents">
          {/* 无结果时显示的空状态 */}
          <CommandEmpty>
            <span className="text-muted-foreground text-sm">
              没有找到任何智能体
            </span>
          </CommandEmpty>
          {/* 智能体项示例 */}
          <CommandItem>
            <GeneratedAvatar
              seed="智能体名称" // 用于生成头像的种子字符串
              variant="botttsNeutral" // 头像样式
              className="size-5" // 头像大小
            />
            智能体名称
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandResponsiveDialog>
  );
};
