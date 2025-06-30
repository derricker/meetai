// 导入侧边栏相关组件: SidebarProvider 用于提供侧边栏上下文, SidebarTrigger 用于触发侧边栏的显示/隐藏
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
// 导入仪表盘专用的侧边栏组件
import { DashboardSidebar } from "@/modules/dashboard/ui/components/dashboard-sidebar";

// 定义组件接收的属性类型
interface Props {
  // children属性用于接收子组件，类型为React节点
  children: React.ReactNode;
}

// 定义仪表盘布局组件, 接收 children 作为参数
const Layout = ({ children }: Props) => {
  return (
    // 使用 SidebarProvider 包裹整个布局, 为子组件提供侧边栏上下文
    <SidebarProvider>
      {/* 渲染仪表盘侧边栏组件 */}
      <DashboardSidebar />
      {/* 主要内容区域: 使用 flex 布局, 占满整个视口高度和宽度, 背景色为 muted */}
      <main className="flex flex-col h-screen w-screen bg-muted">
        {/* 侧边栏触发器, 用于在移动端显示/隐藏侧边栏 */}
        <SidebarTrigger />
        {/* 渲染传入的子组件内容 */}
        {children}
      </main>
    </SidebarProvider>
  );
};

// 导出 Layout 组件作为默认导出
export default Layout;
