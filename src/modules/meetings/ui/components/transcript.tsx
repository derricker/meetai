// 从 React 导入 useState 钩子, 用于在组件中管理状态
import { useState } from "react";
// 从 date-fns 库导入 format 函数, 用于格式化日期和时间
import { format } from "date-fns";
// 从 lucide-react 库导入 SearchIcon 组件, 用于显示搜索图标
import { SearchIcon } from "lucide-react";
// 导入 react-highlight-words 组件, 用于在文本中高亮显示搜索关键词
import Highlighter from "react-highlight-words";
// 从 @tanstack/react-query 导入 useQuery 钩子, 用于数据获取和缓存
import { useQuery } from "@tanstack/react-query";

// 导入自定义的 tRPC 客户端钩子
import { useTRPC } from "@/trpc/client";
// 导入自定义的 Input 组件
import { Input } from "@/components/ui/input";
// 导入自定义的 ScrollArea 组件, 用于创建可滚动的区域
import { ScrollArea } from "@/components/ui/scroll-area";
// 导入自定义的 Avatar 和 AvatarImage 组件, 用于显示用户头像
import { Avatar, AvatarImage } from "@/components/ui/avatar";
// 导入生成头像 URI 的工具函数
import { generateAvatarUri } from "@/lib/avatar";

// 定义组件的属性接口
interface Props {
  // meetingId 属性，表示当前会议的 ID
  meetingId: string;
}

// Transcript 组件, 用于显示会议的转录文本
export const Transcript = ({ meetingId }: Props) => {
  // 初始化 tRPC 客户端
  const trpc = useTRPC();
  // 使用 useQuery 从 tRPC 后端获取会议转录数据
  const { data } = useQuery(
    // 使用 meetings.getTranscript 查询, 并传入会议 ID
    trpc.meetings.getTranscript.queryOptions({ id: meetingId })
  );

  // 使用 useState 创建一个状态变量 searchQuery, 用于存储搜索框中的文本
  const [searchQuery, setSearchQuery] = useState("");
  // 根据 searchQuery 过滤转录数据
  // 如果 data 不存在, 则使用空数组
  const filteredData = (data ?? []).filter((item) =>
    // 将转录文本和搜索查询都转换为小写进行不区分大小写的比较
    item.text.toString().toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg border px-4 py-5 flex flex-col gap-y-4 w-full">
      <p className="text-sm font-medium">会议转录</p>
      <div className="relative">
        {/* 搜索输入框 */}
        <Input
          placeholder="搜索转录内容"
          className="pl-7 h-9 w-[240px]"
          value={searchQuery} // 绑定输入框的值到 searchQuery状态
          onChange={(e) => setSearchQuery(e.target.value)} // 当输入框内容改变时，更新 searchQuery 状态
        />
        {/* 搜索图标 */}
        <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      </div>
      {/* 可滚动区域，用于显示转录内容 */}
      <ScrollArea>
        <div className="flex flex-col gap-y-4">
          {/* 遍历过滤后的转录数据并渲染每个条目 */}
          {filteredData.map((item) => {
            return (
              <div
                key={item.start_ts} // 使用起始时间戳作为唯一的 key
                className="flex flex-col gap-y-2 hover:bg-muted p-4 rounded-md border"
              >
                <div className="flex gap-x-2 items-center">
                  {/* 显示发言人头像 */}
                  <Avatar className="size-6">
                    <AvatarImage
                      src={
                        // 优先使用用户的图片，否则根据用户名生成一个头像
                        item.user.image ??
                        generateAvatarUri({
                          seed: item.user.name,
                          variant: "initials",
                        })
                      }
                      alt="User Avatar"
                    />
                  </Avatar>
                  {/* 显示发言人姓名 */}
                  <p className="text-sm font-medium">{item.user.name}</p>
                  {/* 显示发言的起始时间，格式化为 mm:ss */}
                  <p className="text-sm text-blue-500 font-medium">
                    {format(new Date(0, 0, 0, 0, 0, 0, item.start_ts), "mm:ss")}
                  </p>
                </div>
                {/* 使用 Highlighter 组件高亮显示搜索关键词 */}
                <Highlighter
                  className="text-sm text-neutral-700"
                  highlightClassName="bg-yellow-200" // 高亮样式
                  searchWords={[searchQuery]} // 需要高亮的关键词数组
                  autoEscape={true} // 自动转义特殊字符
                  textToHighlight={item.text} // 待高亮显示的完整文本
                />
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
