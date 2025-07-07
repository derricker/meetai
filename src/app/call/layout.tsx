// 定义 Props 接口, 用于指定组件接收的属性类型
interface Props {
  children: React.ReactNode; // children属性, 表示组件的子元素, 类型为 React 节点
}

// 定义 Layout 组件, 接收一个 Props 类型的参数
const Layout = ({ children }: Props) => {
  return (
    // 返回一个div元素, 设置其高度为屏幕高度, 背景色为黑色
    <div className="h-screen bg-black">
      {/* 渲染子元素 */}
      {children}
    </div>
  );
};

// 导出 Layout 组件作为默认导出
export default Layout;
