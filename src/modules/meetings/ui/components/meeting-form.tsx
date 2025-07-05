// 导入 zod, 一个用于数据验证的库
import { z } from "zod";
// 导入 sonner 中的 toast, 用于显示通知
import { toast } from "sonner";
// 导入 React 的 useState hook
import { useState } from "react";
// 导入 react-hook-form 的 useForm hook, 用于表单状态管理
import { useForm } from "react-hook-form";
// 导入 zodResolver, 用于将 zod schema 与 react-hook-form 集成
import { zodResolver } from "@hookform/resolvers/zod";
// 导入 @tanstack/react-query 的 hooks, 用于数据获取和缓存
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// 导入自定义的 tRPC hook
import { useTRPC } from "@/trpc/client";
// 导入自定义的 Input 组件
import { Input } from "@/components/ui/input";
// 导入自定义的 Button 组件
import { Button } from "@/components/ui/button";

// 导入表单相关的 UI 组件
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// 导入会议相关的类型定义
import { MeetingGetOne } from "../../types";
// 导入会议数据的插入 schema
import { meetingsInsertSchema } from "../../schemas";

// 导入新建智能体对话框组件
import { NewAgentDialog } from "@/modules/agents/ui/components/new-agent-dialog";
// 导入 Next.js 的 router hook
import { useRouter } from "next/navigation";
// 导入命令选择组件
import { CommandSelect } from "@/components/command-select";
// 导入生成头像的组件
import { GeneratedAvatar } from "@/components/generated-avatar";

// 定义 MeetingForm 组件的 props 接口
interface MeetingFormProps {
  // 成功回调, 可选, 接收一个可选的 id 参数
  onSuccess?: (id?: string) => void;
  // 取消回调, 可选
  onCancel?: () => void;
  // 表单初始值, 可选, 用于编辑模式
  initialValues?: MeetingGetOne;
}

// 定义并导出 MeetingForm 组件
export const MeetingForm = ({
  onSuccess, // 成功回调函数
  onCancel, // 取消回调函数
  initialValues, // 表单初始值
}: MeetingFormProps) => {
  // 初始化 tRPC 客户端
  const trpc = useTRPC();
  // 初始化 Next.js router
  const router = useRouter();
  // 获取 react-query 的 queryClient 实例
  const queryClient = useQueryClient();

  // 定义 state 用于存储智能体搜索关键词
  const [agentSearch, setAgentSearch] = useState("");

  // 使用 useQuery 从 tRPC 获取智能体列表
  const agents = useQuery(
    trpc.agents.getMany.queryOptions({
      pageSize: 100, // 每页大小
      search: agentSearch, // 搜索关键词
    })
  );

  // 定义 state 控制新建智能体对话框的显示
  const [openNewAgentDialog, setOpenNewAgentDialog] = useState(false);

  // 使用 useMutation 定义创建会议的 mutation
  const createMeeting = useMutation(
    trpc.meetings.create.mutationOptions({
      onSuccess: async (data) => {
        // 成功后，使相关的查询失效，以重新获取最新数据
        await queryClient.invalidateQueries(
          trpc.meetings.getMany.queryOptions({})
        );
        onSuccess?.(data.id); // 调用成功回调，并传递新会议的 id
      },
      onError: (error) => {
        // 发生错误时，显示错误通知
        toast.error(error.message);

        // 如果是权限错误，则跳转到升级页面
        if (error.data?.code === "FORBIDDEN") {
          router.push("/upgrade");
        }
      },
    })
  );

  // 使用 useMutation 定义更新会议的 mutation
  const updateMeeting = useMutation(
    trpc.meetings.update.mutationOptions({
      onSuccess: async () => {
        // 成功后，使相关的查询失效
        await queryClient.invalidateQueries(
          trpc.meetings.getMany.queryOptions({})
        );

        if (initialValues?.id) {
          // 如果是编辑模式，也使单个会议的查询失效
          await queryClient.invalidateQueries(
            trpc.meetings.getOne.queryOptions({ id: initialValues.id })
          );
        }
        onSuccess?.(); // 调用成功回调
      },
      onError: (error) => {
        // 发生错误时，显示错误通知
        toast.error(error.message);
      },
    })
  );

  // 使用 useForm 初始化表单
  const form = useForm<z.infer<typeof meetingsInsertSchema>>({
    resolver: zodResolver(meetingsInsertSchema), // 使用 zod schema 进行验证
    defaultValues: {
      // 设置表单默认值
      name: initialValues?.name ?? "", // 如果有初始值，则使用它
      agentId: initialValues?.agentId ?? "",
    },
  });

  const isEdit = !!initialValues?.id; // 判断当前是否为编辑模式
  const isPending = createMeeting.isPending || updateMeeting.isPending; // 判断是否有操作正在进行中

  // 表单提交处理函数
  const onSubmit = (values: z.infer<typeof meetingsInsertSchema>) => {
    if (isEdit) {
      // 如果是编辑模式，调用更新 mutation
      updateMeeting.mutate({ ...values, id: initialValues.id });
    } else {
      // 否则，调用创建 mutation
      createMeeting.mutate(values);
    }
  };

  return (
    <>
      {/* 新建智能体对话框 */}
      <NewAgentDialog
        open={openNewAgentDialog}
        onOpenChange={setOpenNewAgentDialog}
      />
      {/* 表单组件 */}
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          {/* 会议名称字段 */}
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>会议名称</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="例如: 数学咨询" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* 智能体选择字段 */}
          <FormField
            name="agentId"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>智能体</FormLabel>
                <FormControl>
                  {/* 命令选择组件, 用于选择智能体 */}
                  <CommandSelect
                    options={(agents.data?.items ?? []).map((agent) => ({
                      // 将智能体数据映射为选项
                      id: agent.id,
                      value: agent.id,
                      // 自定义选项的渲染内容
                      children: (
                        <div className="flex items-center gap-x-2">
                          <GeneratedAvatar
                            seed={agent.name}
                            variant="botttsNeutral"
                            className="border size-6"
                          />
                          <span>{agent.name}</span>
                        </div>
                      ),
                    }))}
                    onSelect={field.onChange} // 选中后的回调
                    onSearch={setAgentSearch} // 搜索时的回调
                    value={field.value} // 当前选中的值
                    placeholder="选择智能体" // 占位符
                  />
                </FormControl>
                <FormDescription>
                  未找到智能体? {/* 创建新智能体的按钮 */}
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => setOpenNewAgentDialog(true)}
                  >
                    创建新智能体
                  </button>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* 表单操作按钮 */}
          <div className="flex justify-between gap-x-2">
            {onCancel && ( // 如果有取消回调，则显示取消按钮
              <Button
                variant="ghost"
                disabled={isPending}
                type="button"
                onClick={() => onCancel()}
              >
                取消
              </Button>
            )}
            {/* 提交按钮 */}
            <Button disabled={isPending} type="submit">
              {isEdit ? "更新" : "创建"} {/* 根据模式显示不同文本 */}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};
