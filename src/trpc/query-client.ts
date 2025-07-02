// 从 @tanstack/react-query 库中导入两个关键成员
// QueryClient: 这是创建查询客户端实例的类, QueryClient 负责管理所有查询的缓存
// defaultShouldDehydrateQuery: 这是一个默认的辅助函数, 用于决定在服务器端渲染期间, 哪些查询应该被"脱水"
import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";

// 定义并导出一个名为 makeQueryClient 的工厂函数
// 这个函数每次被调用时, 都会创建一个新的、配置好的 QueryClient 实例
// 客户端和服务端都会调用 makeQueryClient 方法创建 QueryClient 实例
export function makeQueryClient() {
  return new QueryClient({
    // 默认选项
    defaultOptions: {
      // 设置了数据在多长时间内被认为是 "新鲜的"
      // 当数据是新鲜的时, React Query 会直接从缓存中提供数据, 而不会触发新的网络请求。
      // 当数据超过了 staleTime (在这里是30秒), 它就变成了 "陈旧的"。
      // 当一个组件需要数据时, React Query 会立即从缓存中返回陈旧的数据 (让 UI 可以快速渲染)。
      // 同时在后台触发一次网络请求去获取最新的数据, 获取成功后再用新数据更新 UI。
      // 这个策略在用户体验上取得了很好的平衡：既能快速显示内容，又能保证数据最终是一致的。
      queries: {
        staleTime: 30 * 1000,
      },
      // 脱水: 在服务器端, 我们预先获取数据, 脱水就是将这些在服务器上获取到的数据序列化成一个 JSON 字符串, 然后随着 HTML 一起发送到客户端
      dehydrate: {
        // 决定哪些查询应该被包含在脱水数据中
        // 首先使用 React Query 的默认逻辑 (通常是脱水状态为 success 的查询)
        // 如果查询的状态是 pending (即在服务器上发起了请求, 但还没等到响应), 也将其脱水
        // 这对于处理流式渲染和 React Server Components 非常有用, 可以确保即使在服务器上未完成的查询也能在客户端无缝地继续进行
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      // 注水: 在客户端, 我们拿到从服务器传来的序列化后的数据, 然后将其 "注水" 到客户端
      hydrate: {},
    },
  });
}

// Next.js App Router + tRPC + React Query 技术栈中, 一个典型的服务器端渲染请求的生命周期:

// 阶段一: 服务器端 (处理用户请求, 执行脱水)
// 1. 用户请求到达: 一个用户通过浏览器请求你的一个页面。
// 2. 创建服务器端的 QueryClient: 在服务器上, 你的 Next.js 应用开始处理这个请求, 它会调用 makeQueryClient() 在服务器上创建一个全新的、专属于这次请求的 QueryClient 实例, 这个实例拥有你在代码中配置的所有 defaultOptions, 包括 dehydrate 相关的选项。
// 3. 预取数据: 在渲染 React 组件 (特别是 React Server Components) 的过程中, 会触发 tRPC 的数据请求, 这些请求实际上是在服务器内部调用你的 API (通过 createCaller), 然后用返回的数据填充刚刚创建的那个服务器端 QueryClient 的缓存。
// 4. 执行脱水: 当服务器端的渲染任务即将完成时, React Query 会介入, 它会查看服务器端 QueryClient 缓存中的所有数据, 并使用你在 dehydrate 选项中定义的逻辑 (比如 shouldDehydrateQuery 函数) 来决定哪些数据需要被序列化, 然后它将这些数据 "脱水" 成一个 JSON 字符串。
// 5. 发送响应: 服务器将渲染好的 HTML 和这个包含脱水数据的 JSON 一起发送给用户的浏览器。
// 阶段二: 客户端 (接收响应, 执行注水)
// 1. 浏览器接收: 用户的浏览器收到了 HTML 和脱水数据。
// 2. 创建客户端的 QueryClient: 在浏览器中, 你的 JavaScript 代码开始执行, 它会再一次调用同一个 makeQueryClient() 工厂函数, 在客户端创建一个新的 QueryClient 实例, 这个实例同样拥有你在代码中配置的所有 defaultOptions, 这次包括了 hydrate 相关的选项。
// 3. 执行注水: React Query 的 Provider (通常是 QueryClientProvider) 会获取到从服务器传来的脱水数据, 然后它使用你在 hydrate 选项中定义的逻辑 (比如 deserializeData 函数) 将这些数据 "注水" 到刚刚在客户端创建的 QueryClient 缓存中。
// 4. React 组件 Hydration: React 开始 "激活" 从服务器接收的静态 HTML, 将其变成可交互的动态应用。当组件需要数据时, 它会向客户端的 QueryClient 请求, 由于数据已经在上一步被注水进来了, QueryClient 会立即从缓存中返回数据, 而不需要再向服务器发送一次网络请求。
