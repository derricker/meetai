// 定义组件的 props 类型
interface Props {
  children: React.ReactNode; // children 是 React 节点，用于渲染子组件
}

// 定义布局组件
const Layout = ({ children }: Props) => {
  return (
    // 主容器，设置背景色、flex 布局、最小高度、垂直和水平居中对齐以及内边距
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      {/* 内容容器，限制最大宽度 */}
      <div className="w-full max-w-sm md:max-w-3xl">
        {children} {/* 渲染子组件 */}
      </div>
    </div>
  );
};

// 导出布局组件
export default Layout;
