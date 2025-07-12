// 导入 Next.js 的 Link 组件, 用于客户端导航
import Link from "next/link";
// 导入 react-markdown 用于将 Markdown 文本渲染为 React 组件
import Markdown from "react-markdown";
// 从 lucide-react 库导入图标组件
import {
  SparklesIcon, // 闪光图标, 用于 "互动问答" 和 "总体概述"
  FileTextIcon, // 文件文本图标, 用于 "会议转录"
  BookOpenTextIcon, // 打开的书本图标, 用于 "会议纪要"
  FileVideoIcon, // 文件视频图标, 用于 "会议记录"
  ClockFadingIcon, // 时钟图标, 用于显示时长
} from "lucide-react";
// 从 date-fns 库导入 format 函数, 用于格式化日期
import { format } from "date-fns";

// 导入自定义的 GeneratedAvatar 组件, 用于生成机器人头像
import { GeneratedAvatar } from "@/components/generated-avatar";
// 导入自定义的 ScrollArea 和 ScrollBar 组件, 用于创建可滚动的区域
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
// 导入自定义的 Tabs 组件, 用于创建选项卡界面
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// 从当前模块的类型定义中导入 MeetingGetOne 类型
import { MeetingGetOne } from "../../types";
// 导入自定义的 Badge 组件, 用于显示徽章
import { Badge } from "@/components/ui/badge";
// 导入格式化时长的工具函数
import { formatDuration } from "@/lib/utils";

// 导入 Transcript 组件, 用于显示会议转录内容的详细视图
import { Transcript } from "./transcript";
import { ChatProvider } from "./chat-provider";

// 定义组件的属性接口
interface Props {
  // data 属性, 包含一个会议的详细信息
  data: MeetingGetOne;
}

// CompletedState 组件, 用于显示已完成会议的详细信息
export const CompletedState = ({ data }: Props) => {
  return (
    <div className="flex flex-col gap-y-4">
      {/* 使用 Tabs 组件, 默认选中 'summary' 选项卡 */}
      <Tabs defaultValue="summary">
        <div className="bg-white rounded-lg border px-3">
          {/* 使用 ScrollArea 使选项卡列表可以水平滚动 */}
          <ScrollArea>
            <TabsList className="p-0 bg-background justify-start rounded-none h-13">
              {/* "会议纪要" 选项卡触发器 */}
              <TabsTrigger
                value="summary"
                className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground h-full hover:text-accent-foreground"
              >
                <BookOpenTextIcon />
                会议纪要
              </TabsTrigger>
              {/* "会议转录" 选项卡触发器 */}
              <TabsTrigger
                value="transcript"
                className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground h-full hover:text-accent-foreground"
              >
                <FileTextIcon />
                会议转录
              </TabsTrigger>
              {/* "会议记录" 选项卡触发器 */}
              <TabsTrigger
                value="recording"
                className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground h-full hover:text-accent-foreground"
              >
                <FileVideoIcon />
                会议记录
              </TabsTrigger>
              {/* "互动问答" 选项卡触发器 */}
              <TabsTrigger
                value="chat"
                className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground h-full hover:text-accent-foreground"
              >
                <SparklesIcon />
                互动问答
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
        {/* "互动问答" 选项卡内容区域 */}
        <TabsContent value="chat">
          <ChatProvider meetingId={data.id} meetingName={data.name} />
        </TabsContent>
        {/* "会议转录" 选项卡内容区域 */}
        <TabsContent value="transcript">
          <Transcript meetingId={data.id} />
        </TabsContent>
        {/* "会议记录" 选项卡内容区域 */}
        <TabsContent value="recording">
          <div className="bg-white rounded-lg border px-4 py-5">
            {/* 显示会议录像的 video 元素 */}
            <video
              src={data.recordingUrl!} // 视频源 URL
              className="w-full rounded-lg"
              controls // 显示浏览器默认的视频控件
            />
          </div>
        </TabsContent>
        {/* "会议纪要" 选项卡内容区域 */}
        <TabsContent value="summary">
          <div className="bg-white rounded-lg border">
            <div className="px-4 py-5 gap-y-5 flex flex-col col-span-5">
              {/* 显示会议名称 */}
              <h2 className="text-2xl font-medium capitalize">{data.name}</h2>
              <div className="flex gap-x-2 items-center">
                {/* 链接到对应的 Agent 页面 */}
                <Link
                  href={`/agents/${data.agent.id}`}
                  className="flex items-center gap-x-2 underline underline-offset-4 capitalize"
                >
                  {/* 显示 Agent 的头像和名称 */}
                  <GeneratedAvatar
                    variant="botttsNeutral"
                    seed={data.agent.name}
                    className="size-5"
                  />
                  {data.agent.name}
                </Link>{" "}
                {/* 显示会议开始日期 */}
                <p>{data.startedAt ? format(data.startedAt, "PPP") : ""}</p>
              </div>
              <div className="flex gap-x-2 items-center">
                <SparklesIcon className="size-4" />
                <p>总体概述</p>
              </div>
              {/* 显示会议时长 */}
              <Badge
                variant="outline"
                className="flex items-center gap-x-2 [&>svg]:size-4"
              >
                <ClockFadingIcon className="text-blue-700" />
                {data.duration ? formatDuration(data.duration) : "No duration"}
              </Badge>
              <div>
                {/* 使用 Markdown 组件渲染会议摘要 */}
                <Markdown
                  // 自定义 Markdown 元素的渲染组件, 以应用特定样式
                  components={{
                    h1: (props) => (
                      <h1 className="text-2xl font-medium mb-6" {...props} />
                    ),
                    h2: (props) => (
                      <h2 className="text-xl font-medium mb-6" {...props} />
                    ),
                    h3: (props) => (
                      <h3 className="text-lg font-medium mb-6" {...props} />
                    ),
                    h4: (props) => (
                      <h4 className="text-base font-medium mb-6" {...props} />
                    ),
                    p: (props) => (
                      <p className="mb-6 leading-relaxed" {...props} />
                    ),
                    ul: (props) => (
                      <ul className="list-disc list-inside mb-6" {...props} />
                    ),
                    ol: (props) => (
                      <ol
                        className="list-decimal list-inside mb-6"
                        {...props}
                      />
                    ),
                    li: (props) => <li className="mb-1" {...props} />,
                    strong: (props) => (
                      <strong className="font-semibold" {...props} />
                    ),
                    code: (props) => (
                      <code
                        className="bg-gray-100 px-1 py-0.5 rounded"
                        {...props}
                      />
                    ),
                    blockquote: (props) => (
                      <blockquote
                        className="border-l-4 pl-4 italic my-4"
                        {...props}
                      />
                    ),
                  }}
                >
                  {/* 会议摘要的 Markdown 文本内容 */}
                  {data.summary}
                </Markdown>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
