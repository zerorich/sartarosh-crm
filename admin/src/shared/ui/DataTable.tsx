"use client";

import React, { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Pagination } from "./Pagination";
import { TableSkeleton } from "./LoadingSkeleton";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  accessor?: (row: T) => any;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  align?: "left" | "center" | "right";
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  // Pagination
  pagination?: {
    currentPage: number;
    totalItems: number;
    pageSize?: number;
    onPageChange: (page: number) => void;
  };
  onRowClick?: (row: T) => void;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  isError = false,
  error,
  onRetry,
  emptyTitle = "No data found",
  emptyDescription = "There are no records matching your criteria.",
  emptyActionLabel,
  onEmptyAction,
  pagination,
  onRowClick,
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortOrder === "asc") setSortOrder("desc");
      else {
        setSortKey(null);
        setSortOrder("asc");
      }
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return data;

    return [...data].sort((a, b) => {
      let valA = col.accessor ? col.accessor(a) : (a as any)[sortKey];
      let valB = col.accessor ? col.accessor(b) : (b as any)[sortKey];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === "string") {
        return sortOrder === "asc"
          ? valA.localeCompare(String(valB))
          : String(valB).localeCompare(valA);
      }
      return sortOrder === "asc" ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
  }, [data, sortKey, sortOrder, columns]);

  if (isError) {
    return (
      <ErrorState
        title="Failed to load table data"
        message={error?.message || "An unexpected error occurred."}
        onRetry={onRetry}
      />
    );
  }

  if (isLoading) {
    return <TableSkeleton rows={pagination?.pageSize || 6} cols={columns.length} />;
  }

  return (
    <div
      className={cn(
        "w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-card overflow-hidden flex flex-col",
        className
      )}
    >
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                const alignClass =
                  col.align === "center"
                    ? "text-center"
                    : col.align === "right"
                    ? "text-right"
                    : "text-left";

                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={cn("px-6 py-4 select-none whitespace-nowrap", alignClass, col.className)}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(col.key)}
                        className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-slate-100 transition-colors uppercase font-bold"
                      >
                        <span>{col.header}</span>
                        {isSorted ? (
                          sortOrder === "asc" ? (
                            <ArrowUp className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60" />
                        )}
                      </button>
                    ) : (
                      <span>{col.header}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    actionLabel={emptyActionLabel}
                    onAction={onEmptyAction}
                    className="border-none rounded-none my-0 bg-transparent shadow-none"
                  />
                </td>
              </tr>
            ) : (
              sortedData.map((row, index) => {
                const key = keyExtractor(row);
                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={cn(
                      "transition-colors duration-150 group",
                      onRowClick ? "cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/60" : "hover:bg-slate-50/40 dark:hover:bg-slate-800/30"
                    )}
                  >
                    {columns.map((col) => {
                      const alignClass =
                        col.align === "center"
                          ? "text-center"
                          : col.align === "right"
                          ? "text-right"
                          : "text-left";
                      return (
                        <td
                          key={`${key}-${col.key}`}
                          className={cn("px-6 py-4 text-slate-700 dark:text-slate-300 align-middle", alignClass, col.className)}
                        >
                          {col.render
                            ? col.render(row, index)
                            : col.accessor
                            ? col.accessor(row)
                            : (row as any)[col.key]}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalItems > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          onPageChange={pagination.onPageChange}
        />
      )}
    </div>
  );
}
