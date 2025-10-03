import clsx from "clsx";
import React, { useState, useMemo, useCallback } from "react";

// Types
export interface Column<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: "text" | "select" | "date" | "number";
  filterOptions?: { label: string; value: any }[];
  width?: string | number;
  align?: "left" | "center" | "right";
  fixed?: "left" | "right";
}

export interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
    onChange: (page: number, pageSize: number) => void;
  };
  rowKey?: keyof T | ((record: T) => string);
  rowSelection?: {
    selectedRowKeys?: string[];
    onChange: (selectedRowKeys: string[], selectedRows: T[]) => void;
    type?: "checkbox" | "radio";
  };
  onRow?: (
    record: T,
    index: number,
  ) => {
    onClick?: () => void;
    onDoubleClick?: () => void;
    className?: string;
  };
  size?: "sm" | "md" | "lg";
  bordered?: boolean;
  hoverable?: boolean;
  striped?: boolean;
  sticky?: boolean;
  maxHeight?: string | number;
  emptyText?: string;
  className?: string;
}

type SortOrder = "asc" | "desc" | null;

interface SortState {
  column: string;
  order: SortOrder;
}

interface FilterState {
  [key: string]: any;
}

export const DataTable = <T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  pagination,
  rowKey = "id",
  rowSelection,
  onRow,
  size = "md",
  bordered = true,
  hoverable = true,
  striped = false,
  sticky = false,
  maxHeight,
  emptyText = "No data available",
  className,
}: DataTableProps<T>) => {
  const [sortState, setSortState] = useState<SortState>({
    column: "",
    order: null,
  });
  const [filterState, setFilterState] = useState<FilterState>({});
  const [_expandedRows, _setExpandedRows] = useState<Set<string>>(new Set());

  // Get row key
  const getRowKey = useCallback(
    (record: T): string => {
      if (typeof rowKey === "function") {
        return rowKey(record);
      }
      return String(record[rowKey]);
    },
    [rowKey],
  );

  // Handle sorting
  const handleSort = useCallback((columnKey: string) => {
    setSortState((prev) => {
      if (prev.column === columnKey) {
        const order =
          prev.order === null ? "asc" : prev.order === "asc" ? "desc" : null;
        return { column: columnKey, order };
      }
      return { column: columnKey, order: "asc" };
    });
  }, []);

  // Handle filtering
  const handleFilter = useCallback((columnKey: string, value: any) => {
    setFilterState((prev) => ({
      ...prev,
      [columnKey]: value,
    }));
  }, []);

  // Process data (sort and filter)
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply filters
    Object.entries(filterState).forEach(([columnKey, filterValue]) => {
      if (
        filterValue === undefined ||
        filterValue === null ||
        filterValue === ""
      )
        return;

      const column = columns.find((col) => col.key === columnKey);
      if (!column) return;

      result = result.filter((record) => {
        const value = column.dataIndex
          ? record[column.dataIndex]
          : record[columnKey];

        if (column.filterType === "text") {
          return String(value)
            .toLowerCase()
            .includes(String(filterValue).toLowerCase());
        }
        if (column.filterType === "select") {
          return value === filterValue;
        }
        if (column.filterType === "number") {
          return Number(value) === Number(filterValue);
        }
        return value === filterValue;
      });
    });

    // Apply sorting
    if (sortState.column && sortState.order) {
      const column = columns.find((col) => col.key === sortState.column);
      if (column) {
        result.sort((a, b) => {
          const valueA = column.dataIndex
            ? a[column.dataIndex]
            : a[sortState.column];
          const valueB = column.dataIndex
            ? b[column.dataIndex]
            : b[sortState.column];

          let comparison = 0;
          if (valueA < valueB) comparison = -1;
          if (valueA > valueB) comparison = 1;

          return sortState.order === "desc" ? -comparison : comparison;
        });
      }
    }

    return result;
  }, [data, columns, sortState, filterState]);

  // Size classes
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const cellPadding = {
    sm: "px-2 py-1",
    md: "px-4 py-3",
    lg: "px-6 py-4",
  };

  // Render filter input
  const renderFilter = (column: Column<T>) => {
    if (!column.filterable) return null;

    const currentValue = filterState[column.key] || "";

    if (column.filterType === "select" && column.filterOptions) {
      return (
        <select
          value={currentValue}
          onChange={(e) => handleFilter(column.key, e.target.value)}
          className="mt-1 block w-full px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-white focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All</option>
          {column.filterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={column.filterType === "number" ? "number" : "text"}
        value={currentValue}
        onChange={(e) => handleFilter(column.key, e.target.value)}
        placeholder="Filter..."
        className="mt-1 block w-full px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:ring-1 focus:ring-blue-500"
      />
    );
  };

  // Render sort indicator
  const renderSortIndicator = (column: Column<T>) => {
    if (!column.sortable) return null;

    const isActive = sortState.column === column.key;
    const order = isActive ? sortState.order : null;

    return (
      <span className="ml-2 inline-flex flex-col">
        <span
          className={clsx(
            "text-xs leading-none",
            order === "asc" ? "text-blue-400" : "text-slate-500",
          )}
        >
          ▲
        </span>
        <span
          className={clsx(
            "text-xs leading-none",
            order === "desc" ? "text-blue-400" : "text-slate-500",
          )}
        >
          ▼
        </span>
      </span>
    );
  };

  // Handle row selection
  const handleRowSelection = useCallback(
    (recordKey: string, selected: boolean) => {
      if (!rowSelection) return;

      const currentKeys = rowSelection.selectedRowKeys || [];
      let newKeys: string[];

      if (rowSelection.type === "radio") {
        newKeys = selected ? [recordKey] : [];
      } else {
        newKeys = selected
          ? [...currentKeys, recordKey]
          : currentKeys.filter((key) => key !== recordKey);
      }

      const newRows = processedData.filter((record) =>
        newKeys.includes(getRowKey(record)),
      );

      rowSelection.onChange(newKeys, newRows);
    },
    [rowSelection, processedData, getRowKey],
  );

  // Handle select all
  const handleSelectAll = useCallback(
    (selected: boolean) => {
      if (!rowSelection) return;

      const allKeys = processedData.map(getRowKey);
      const newKeys = selected ? allKeys : [];
      const newRows = selected ? processedData : [];

      rowSelection.onChange(newKeys, newRows);
    },
    [rowSelection, processedData, getRowKey],
  );

  // Check if all rows are selected
  const isAllSelected = useMemo(() => {
    if (!rowSelection || processedData.length === 0) return false;
    const selectedKeys = rowSelection.selectedRowKeys || [];
    return processedData.every((record) =>
      selectedKeys.includes(getRowKey(record)),
    );
  }, [rowSelection, processedData, getRowKey]);

  // Check if some rows are selected
  const isSomeSelected = useMemo(() => {
    if (!rowSelection || processedData.length === 0) return false;
    const selectedKeys = rowSelection.selectedRowKeys || [];
    return (
      selectedKeys.length > 0 &&
      !processedData.every((record) => selectedKeys.includes(getRowKey(record)))
    );
  }, [rowSelection, processedData, getRowKey]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="bg-slate-800 h-12 rounded-t-lg"></div>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-slate-900 h-16 border-t border-slate-700"
          ></div>
        ))}
      </div>
    );
  }

  return (
    <div className={clsx("bg-slate-900 rounded-lg overflow-hidden", className)}>
      <div
        className={clsx("overflow-auto", maxHeight && `max-h-[${maxHeight}]`)}
      >
        <table className="w-full">
          {/* Table Header */}
          <thead
            className={clsx("bg-slate-800", sticky && "sticky top-0 z-10")}
          >
            <tr>
              {rowSelection && (
                <th
                  className={clsx(
                    "text-left font-medium text-slate-300",
                    cellPadding[size],
                  )}
                >
                  {rowSelection.type !== "radio" && (
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeSelected;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-slate-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                    />
                  )}
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={clsx(
                    "text-left font-medium text-slate-300",
                    cellPadding[size],
                    bordered && "border-r border-slate-700 last:border-r-0",
                    column.sortable && "cursor-pointer hover:bg-slate-700/50",
                  )}
                  style={{ width: column.width }}
                  onClick={
                    column.sortable ? () => handleSort(column.key) : undefined
                  }
                >
                  <div className="flex items-center justify-between">
                    <span>{column.title}</span>
                    {renderSortIndicator(column)}
                  </div>
                  {renderFilter(column)}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className={sizeClasses[size]}>
            {processedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (rowSelection ? 1 : 0)}
                  className="text-center py-12 text-slate-400"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              processedData.map((record, index) => {
                const key = getRowKey(record);
                const isSelected =
                  rowSelection?.selectedRowKeys?.includes(key) || false;
                const rowProps = onRow?.(record, index) || {};

                return (
                  <tr
                    key={key}
                    className={clsx(
                      "text-slate-200",
                      bordered && "border-t border-slate-700",
                      striped && index % 2 === 1 && "bg-slate-800/30",
                      hoverable && "hover:bg-slate-800/50",
                      isSelected && "bg-blue-900/20",
                      rowProps.className,
                    )}
                    onClick={rowProps.onClick}
                    onDoubleClick={rowProps.onDoubleClick}
                  >
                    {rowSelection && (
                      <td className={cellPadding[size]}>
                        <input
                          type={
                            rowSelection.type === "radio" ? "radio" : "checkbox"
                          }
                          name={
                            rowSelection.type === "radio"
                              ? "row-selection"
                              : undefined
                          }
                          checked={isSelected}
                          onChange={(e) =>
                            handleRowSelection(key, e.target.checked)
                          }
                          className="rounded border-slate-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                        />
                      </td>
                    )}
                    {columns.map((column) => {
                      const value = column.dataIndex
                        ? record[column.dataIndex]
                        : record[column.key];
                      const content = column.render
                        ? column.render(value, record, index)
                        : value;

                      return (
                        <td
                          key={column.key}
                          className={clsx(
                            cellPadding[size],
                            bordered &&
                              "border-r border-slate-700 last:border-r-0",
                            column.align === "center" && "text-center",
                            column.align === "right" && "text-right",
                          )}
                          style={{ width: column.width }}
                        >
                          {content}
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

      {/* Pagination */}
      {pagination && (
        <div className="bg-slate-800 px-4 py-3 border-t border-slate-700 flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Showing {(pagination.current - 1) * pagination.pageSize + 1} to{" "}
            {Math.min(
              pagination.current * pagination.pageSize,
              pagination.total,
            )}{" "}
            of {pagination.total} entries
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                pagination.onChange(pagination.current - 1, pagination.pageSize)
              }
              disabled={pagination.current === 1}
              className="px-3 py-1 text-sm bg-slate-700 text-white rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <span className="text-sm text-slate-300">
              Page {pagination.current} of{" "}
              {Math.ceil(pagination.total / pagination.pageSize)}
            </span>

            <button
              onClick={() =>
                pagination.onChange(pagination.current + 1, pagination.pageSize)
              }
              disabled={
                pagination.current >=
                Math.ceil(pagination.total / pagination.pageSize)
              }
              className="px-3 py-1 text-sm bg-slate-700 text-white rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
