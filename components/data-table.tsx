"use client";

import { Table as TableType, flexRender } from "@tanstack/react-table";
import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ColumnDef } from "@tanstack/react-table";
import Paginator from "./ui/paginator";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// Removed useSidebar dependency for portability; relying on CSS grid/flex
// import { useSidebar } from "../ui/sidebar";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  table: TableType<TData>;
  onRowClick?: (row: TData) => void;
  isLoading?: boolean;
  showPagination?: boolean;
  tableWrapperClassName?: string;
  tableClassName?: string;
  rowClassName?: string;
  tableBodyClassName?: string;
}

export default function DataTable<TData, TValue>({
  columns,
  table,
  onRowClick,
  isLoading,
  showPagination = true,
  tableWrapperClassName,
  tableClassName,
  rowClassName,
  tableBodyClassName,
}: DataTableProps<TData, TValue>) {
  //   const [screenWidth, setScreenWidth] = React.useState(0);
  // Optional: Add sidebar logic back if context is available
  // const { state } = useSidebar();
  // const sidebarCurrentWidth = state === "expanded" ? 320 : 136;

  //   React.useEffect(() => {
  //     const handleResize = () => setScreenWidth(window.innerWidth);
  //     handleResize();
  //     window.addEventListener("resize", handleResize);
  //     return () => window.removeEventListener("resize", handleResize);
  //   }, []);

  const handleRowClick = React.useCallback(
    (e: React.MouseEvent<HTMLTableCellElement>, row: TData) => {
      e.preventDefault();
      e.stopPropagation();
      const target = e.target as HTMLElement;
      // Check if the click is on or within a TableCell
      const cell = target.closest("td");
      if (!cell) return;

      // Define interactive selectors
      const interactiveSelectors = [
        "button",
        "a",
        "input",
        "select",
        "textarea",
        '[role="button"]',
        "[data-interactive]",
        "dialog",
        ".badge",
        ".dropdown",
      ].join(", ");

      // Check if the target or its closest ancestor matches an interactive element
      const isInteractiveElement = target.closest(interactiveSelectors);

      // Check if the target or its closest ancestor has the "table-button" class
      const hasTableButtonClass = target.closest(".table-button");

      // Prevent row click if the target has the "table-button" class
      if (isInteractiveElement || hasTableButtonClass) {
        return;
      }

      // Logic to ensure we don't click if there are interactive elements not caught above
      // For now, the extensive list above captures most.

      if (onRowClick) {
        onRowClick(row);
      }
    },
    [onRowClick]
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-y-3 w-full border rounded-[16px] overflow-hidden bg-white",
        tableWrapperClassName
      )}
    >
      <div className="overflow-y-auto">
        <Table className={cn("border-none", tableClassName)}>
          <TableHeader>
            {table?.getHeaderGroups()?.map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="px-6 py-4 font-semibold text-black bg-slate-50/50"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody className={`${tableBodyClassName} overflow-y-auto`}>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    "cursor-pointer hover:bg-gray-50 z-0 group",
                    rowClassName
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn("px-6 py-4", {
                        // "group-hover:underline": cell.column.columnDef.header === "Title",
                      })}
                      onClick={(e) => handleRowClick(e, row.original)}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {isLoading ? (
                    <div className="flex gap-x-2 items-center w-full justify-center text-muted-foreground">
                      <Loader2 className="animate-spin h-4 w-4" />
                      <p className="text-sm">Loading...</p>
                    </div>
                  ) : (
                    <div className="flex justify-center text-muted-foreground">
                      No results
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {showPagination && !isLoading && (
          <div className="p-4 w-full border-t">
            <Paginator
              currentPage={table.getState().pagination.pageIndex + 1}
              totalPages={table.getPageCount()}
              onPageChange={(pageNumber) => table.setPageIndex(pageNumber - 1)}
              showPreviousNext
            />
          </div>
        )}
      </div>
    </div>
  );
}
