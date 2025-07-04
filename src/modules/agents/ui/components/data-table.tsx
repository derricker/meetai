"use client";

// 从 @tanstack/react-table 库导入必要的类型和函数
import {
  ColumnDef, // 列类型定义, 用于定义表格列的结构和行为
  flexRender, // 灵活渲染函数, 用于渲染表格单元格内容
  getCoreRowModel, // 获取核心行模型的函数, 提供基础的行数据处理
  useReactTable, // React Table 的主要 hook, 用于创建和管理表格实例
} from "@tanstack/react-table";

// 从本地 UI 组件库导入表格相关组件
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

/**
 * DataTable 组件的属性接口定义
 * @template TData 表格数据的类型
 * @template TValue 表格单元格值的类型
 */
interface DataTableProps<TData, TValue> {
  // 表格列定义数组, 描述每列的结构、渲染方式等
  columns: ColumnDef<TData, TValue>[];
  // 表格数据数组, 包含要显示的所有行数据
  data: TData[];
  // 可选的行点击回调函数, 当用户点击某行时触发
  onRowClick?: (row: TData) => void;
}

/**
 * 通用数据表格组件
 * 基于 @tanstack/react-table 构建, 支持泛型以确保类型安全
 * 提供基础的数据展示和行点击交互功能
 *
 * @param columns 表格列定义, 决定表格的结构和每列的渲染方式
 * @param data 要显示的数据数组
 * @param onRowClick 可选的行点击处理函数
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  // 使用 useReactTable hook 创建表格实例
  // 这个实例包含了表格的所有状态和方法
  const table = useReactTable({
    // 传入表格数据
    data,
    // 传入列定义
    columns,
    // 设置核心行模型, 负责基础的数据处理和行生成
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    // 表格容器: 设置圆角边框、背景色和溢出隐藏
    <div className="rounded-lg border bg-background overflow-hidden">
      <Table>
        <TableBody>
          {/* 条件渲染: 检查是否有数据行 */}
          {table.getRowModel().rows?.length ? (
            // 有数据时: 遍历所有行并渲染
            table.getRowModel().rows.map((row) => (
              <TableRow
                // 使用行 ID 作为 React key
                key={row.id}
                // 根据行选中状态设置 data 属性
                data-state={row.getIsSelected() && "selected"}
                // 设置鼠标悬停时显示手型指针
                className="cursor-pointer"
                // 绑定行点击事件, 传递原始数据
                onClick={() => onRowClick?.(row.original)}
              >
                {/* 遍历当前行的所有可见单元格 */}
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    // 使用单元格 ID 作为 React key
                    key={cell.id}
                    // 设置文字大小和内边距
                    className="text-sm p-4"
                  >
                    {/* 使用 flexRender 渲染单元格内容 */}
                    {/* flexRender 可以处理各种类型的单元格内容：字符串、组件、函数等 */}
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            // 无数据时: 显示空状态提示
            <TableRow>
              <TableCell
                // 跨越所有列
                colSpan={columns.length}
                // 设置高度、居中对齐和弱化文字颜色
                className="h-19 text-center text-muted-foreground"
              >
                未找到任何智能体
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
