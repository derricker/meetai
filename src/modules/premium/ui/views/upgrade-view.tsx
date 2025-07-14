// 指定这是一个客户端组件，在 Next.js 13+ 的 App Router 中使用
"use client";

// 导入 TanStack Query 的 useSuspenseQuery hook，用于数据获取和 Suspense 集成
import { useSuspenseQuery } from "@tanstack/react-query";

// 导入自定义的 tRPC 客户端 hook
import { useTRPC } from "@/trpc/client";
// 导入身份验证客户端，用于处理结账和客户门户
import { authClient } from "@/lib/auth-client";
// 导入错误状态组件
import { ErrorState } from "@/components/error-state";
// 导入加载状态组件
import { LoadingState } from "@/components/loading-state";

// 导入价格卡片组件
import { PricingCard } from "../components/pricing-card";

// 主要的升级视图组件
export const UpgradeView = () => {
  // 获取 tRPC 客户端实例
  const trpc = useTRPC();

  // 使用 Suspense 查询获取所有可用的产品列表
  const { data: products } = useSuspenseQuery(
    trpc.premium.getProducts.queryOptions()
  );

  // 使用 Suspense 查询获取当前用户的订阅信息
  const { data: currentSubscription } = useSuspenseQuery(
    trpc.premium.getCurrentSubscription.queryOptions()
  );

  return (
    // 主容器：全高度，垂直和水平内边距，垂直布局
    <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-10">
      {/* 内容区域：顶部边距，垂直布局，居中对齐 */}
      <div className="mt-4 flex-1 flex flex-col gap-y-10 items-center">
        {/* 标题：显示当前订阅计划 */}
        <h5 className="font-medium text-2xl md:text-3xl">
          您当前使用的是{" "}
          <span className="font-semibold text-primary">
            {/* 显示当前订阅名称，如果没有订阅则显示 "免费版" */}
            {currentSubscription?.name ?? "免费版"}
          </span>{" "}
          套餐
        </h5>

        {/* 产品网格：在移动设备上单列，在中等屏幕及以上三列 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 遍历所有产品并渲染价格卡片 */}
          {products.map((product) => {
            // 判断当前产品是否为用户当前订阅的产品
            const isCurrentProduct = currentSubscription?.id === product.id;
            // 判断用户是否为付费用户（有任何订阅）
            const isPremium = !!currentSubscription;

            // 默认按钮文本和点击事件
            let buttonText = "升级";
            let onClick = () => authClient.checkout({ products: [product.id] });

            // 如果是当前订阅的产品
            if (isCurrentProduct) {
              buttonText = "管理"; // 按钮文本改为"管理"
              onClick = () => authClient.customer.portal(); // 点击跳转到客户门户
            }
            // 如果用户已经是付费用户但不是当前产品
            else if (isPremium) {
              buttonText = "更换计划"; // 按钮文本改为"更换计划"
              onClick = () => authClient.customer.portal(); // 点击跳转到客户门户
            }

            return (
              <PricingCard
                key={product.id}
                buttonText={buttonText}
                onClick={onClick}
                // 根据产品元数据设置卡片变体（高亮或默认）
                variant={
                  product.metadata.variant === "highlighted"
                    ? "highlighted"
                    : "default"
                }
                title={product.name} // 产品名称
                // 计算价格：如果是固定价格则除以100（从分转换为元），否则为0
                price={
                  product.prices[0].amountType === "fixed"
                    ? product.prices[0].priceAmount / 100
                    : 0
                }
                description={product.description} // 产品描述
                // 价格后缀：显示计费周期
                priceSuffix={`/${product.prices[0].recurringInterval}`}
                // 产品特性列表：从产品福利中提取描述
                features={product.benefits.map(
                  (benefit) => benefit.description
                )}
                // 产品徽章：从元数据中获取
                badge={product.metadata.badge as string | null}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

// 升级视图的加载状态组件
export const UpgradeViewLoading = () => {
  return <LoadingState title="加载中" description="这可能需要点时间" />;
};

// 升级视图的错误状态组件
export const UpgradeViewError = () => {
  return <ErrorState title="发生了错误" description="请稍后再试" />;
};
