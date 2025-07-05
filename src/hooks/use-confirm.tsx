import { JSX, useState } from "react";
import { Button } from "@/components/ui/button";
import { ResponsiveDialog } from "@/components/responsive-dialog";

/**
 * useConfirm hook
 * @param title - 对话框的标题
 * @param description - 对话框的描述
 * @returns {[() => JSX.Element, () => Promise<unknown>]} - 返回一个元组, 包含确认对话框组件和触发对话框的函数
 */
export const useConfirm = (
  title: string,
  description: string
): [() => JSX.Element, () => Promise<unknown>] => {
  // 使用 state 来存储 promise 的 resolve 函数，以便在用户操作后可以 resolve promise
  const [promise, setPromise] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  // confirm 函数返回一个 promise，当用户点击确认或取消时，该 promise 会被 resolve
  const confirm = () => {
    return new Promise((resolve) => {
      setPromise({ resolve });
    });
  };

  // 关闭对话框，并重置 promise state
  const handleClose = () => {
    setPromise(null);
  };

  // 处理确认操作，resolve promise 并关闭对话框
  const handleConfirm = () => {
    promise?.resolve(true);
    handleClose();
  };

  // 处理取消操作，resolve promise 并关闭对话框
  const handleCancel = () => {
    promise?.resolve(false);
    handleClose();
  };

  // 确认对话框组件
  const ConfirmationDialog = () => (
    <ResponsiveDialog
      open={promise !== null} // 当 promise 不为 null 时，对话框打开
      onOpenChange={handleClose} // 当对话框状态改变时（例如，点击外部区域），关闭对话框
      title={title}
      description={description}
    >
      <div className="pt-4 w-full flex flex-col-reverse gap-y-2 lg:flex-row gap-x-2 items-center justify-end">
        <Button
          onClick={handleCancel}
          variant="outline"
          className="w-full lg:w-auto"
        >
          取消
        </Button>
        <Button onClick={handleConfirm} className="w-full lg:w-auto">
          确认
        </Button>
      </div>
    </ResponsiveDialog>
  );

  // 返回对话框组件和触发函数
  return [ConfirmationDialog, confirm];
};
