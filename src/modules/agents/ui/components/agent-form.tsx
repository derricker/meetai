// 导入 tRPC 的客户端钩子, 用于与后端进行类型安全的 API 调用
import { useTRPC } from "@/trpc/client";
// 导入 AgentGetOne 类型定义, 用于表示单个 agent 的数据结构
import { AgentGetOne } from "../../types";
// 从 @tanstack/react-query 导入 useMutation 和 useQueryClient 钩子, 用于处理数据变更和缓存管理
import { useMutation, useQueryClient } from "@tanstack/react-query";
// 从 react-hook-form 导入 useForm 钩子, 用于管理表单状态和验证
import { useForm } from "react-hook-form";
// 导入 Zod 的解析器, 用于将 Zod schema 与 react-hook-form 集成
import { zodResolver } from "@hookform/resolvers/zod";
// 导入用于创建 agent 的 Zod schema, 用于表单验证
import { agentsInsertSchema } from "../../schemas";
// 导入 Zod 库, 用于 schema 定义和验证。
import { z } from "zod";

// 导入自定义的 UI 组件, 用于构建表单界面
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GeneratedAvatar } from "@/components/generated-avatar";
// 导入 sonner 库的 toast 函数, 用于显示通知消息。
import { toast } from "sonner";
import { useRouter } from "next/navigation";

/**
 * AgentForm 组件的属性 (props) 类型定义。
 * @property {() => void} [onSuccess] - 表单成功提交后调用的回调函数
 * @property {() => void} [onCancel] - 用户取消表单操作时调用的回调函数
 * @property {AgentGetOne} [initialValues] - 表单的初始值, 用于编辑现有 agent
 */
interface AgentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialValues?: AgentGetOne;
}

/**
 * AgentForm 组件
 * 这是一个通用的表单组件, 用于创建或编辑智能体
 */
export const AgentForm = ({
  onSuccess,
  onCancel,
  initialValues,
}: AgentFormProps) => {
  // 获取 tRPC 客户端实例
  const trpc = useTRPC();
  // 获取 React Query 的查询客户端实例, 用于手动管理缓存。
  const queryClient = useQueryClient();

  // 获取路由对象
  const router = useRouter();

  // 使用 useMutation 创建一个用于 "创建 agent" 的 mutation。
  const createAgent = useMutation(
    // 使用 tRPC 提供的 mutationOptions 来配置 useMutation
    trpc.agents.create.mutationOptions({
      // 当 mutation 成功时执行
      onSuccess: async () => {
        // 使 getMany 查询失效, 这将触发 React Query 重新获取 agent 列表, 从而更新 UI
        await queryClient.invalidateQueries(
          trpc.agents.getMany.queryOptions({})
        );
        // 使免费使用额度的查询失效, 触发重新获取最新的使用情况数据
        await queryClient.invalidateQueries(
          trpc.premium.getFreeUsage.queryOptions()
        );
        // 调用父组件传入的 onSuccess 回调, 例如关闭对话框。
        onSuccess?.();
      },
      // 当 mutation 失败时执行
      onError: (error) => {
        // 使用 toast 显示错误消息
        toast.error(error.message);
        // 如果错误数据存在且错误码为 "FORBIDDEN"（禁止访问）
        if (error.data?.code === "FORBIDDEN") {
          // 重定向用户到 "/upgrade" 页面，通常表示需要升级账户才能继续操作
          router.push("/upgrade");
        }
      },
    })
  );

  // 使用 useMutation 创建一个用于 "更新 agent" 的 mutation
  const updateAgent = useMutation(
    // 使用 tRPC 提供的 mutationOptions 来配置 useMutation
    trpc.agents.update.mutationOptions({
      // 当 mutation 成功时执行
      onSuccess: async () => {
        // 使 getMany 查询失效, 重新获取 agent 列表以更新 UI
        await queryClient.invalidateQueries(
          trpc.agents.getMany.queryOptions({})
        );

        // 如果是在编辑模式下 (有 initialValues.id)
        if (initialValues?.id) {
          // 使对应的 getOne 查询失效, 重新获取该 agent 的最新数据
          await queryClient.invalidateQueries(
            trpc.agents.getOne.queryOptions({ id: initialValues.id })
          );
        }
        // 调用父组件传入的 onSuccess 回调, 例如关闭对话框
        onSuccess?.();
      },
      // 当 mutation 失败时执行
      onError: (error) => {
        // 使用 toast 显示错误消息
        toast.error(error.message);
      },
    })
  );

  // 使用 useForm 初始化表单, 并配置验证和默认值
  const form = useForm<z.infer<typeof agentsInsertSchema>>({
    // 使用 Zod schema 进行表单验证
    resolver: zodResolver(agentsInsertSchema),
    defaultValues: {
      // 如果提供了 initialValues, 则使用它来填充"名称"字段, 否则为空字符串
      name: initialValues?.name ?? "",
      // 如果提供了 initialValues, 则使用它来填充"指令"字段, 否则为空字符串
      instructions: initialValues?.instructions ?? "",
    },
  });

  // 判断当前是编辑模式还是创建模式
  const isEdit = !!initialValues?.id;
  // 判断创建或更新操作是否正在进行中, 用于禁用按钮等
  const isPending = createAgent.isPending || updateAgent.isPending;

  // 表单提交处理函数
  const onSubmit = (values: z.infer<typeof agentsInsertSchema>) => {
    if (isEdit) {
      // 如果是编辑模式, 则调用 updateAgent mutation
      // 将表单值与 agent ID 合并后作为参数传递
      updateAgent.mutate({ ...values, id: initialValues.id });
    } else {
      // 如果是创建模式, 则调用 createAgent mutation。
      createAgent.mutate(values);
    }
  };

  return (
    // 使用 shadcn/ui 的 Form 组件包裹表单, 提供上下文
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        {/* 根据表单中的 name 动态生成一个头像预览 */}
        <GeneratedAvatar
          seed={form.watch("name")} // watch 会监听字段变化并触发重新渲染
          variant="botttsNeutral"
          className="border size-16"
        />
        {/* 名称字段 */}
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>名称</FormLabel>
              <FormControl>
                <Input {...field} placeholder="例如: 数学导师" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* 指令字段 */}
        <FormField
          name="instructions"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>指令</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="您是一位乐于助人的数学助手, 可以回答问题并帮助完成作业。"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* 表单操作按钮区域 */}
        <div className="flex justify-between gap-x-2">
          {/* 如果提供了 onCancel 回调, 则显示 "取消" s按钮 */}
          {onCancel && (
            <Button
              variant="ghost"
              disabled={isPending} // 操作进行中时禁用按钮
              type="button" // 避免触发表单提交
              onClick={() => onCancel()} // 点击时调用 onCancel 回调
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
  );
};
