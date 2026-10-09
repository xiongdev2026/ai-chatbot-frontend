'use client';

import React, {
  useState,
  useMemo,
  useEffect,
} from 'react';

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Loader2,
} from 'lucide-react';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;

  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: string[];

  pageSize?: number;

  onRowClick?: (row: T) => void;

  actions?: (row: T) => React.ReactNode;

  expandRow?: (row: T) => React.ReactNode;

  emptyMessage?: string;

  headerRight?: React.ReactNode;
}

export default function DataTable<
  T extends Record<string, any>
>({
  columns,
  data,
  loading = false,

  searchable = true,
  searchPlaceholder = 'Search...',
  searchKeys = [],

  pageSize = 10,

  onRowClick,

  actions,

  expandRow,

  emptyMessage = 'No data found.',

  headerRight,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');

  const [sortKey, setSortKey] =
    useState<string | null>(null);

  const [sortDir, setSortDir] = useState<
    'asc' | 'desc'
  >('asc');

  const [page, setPage] = useState(1);

  const [expandedRows, setExpandedRows] =
    useState<Set<number>>(new Set());

  // Search
  const filtered = useMemo(() => {
    if (!search.trim()) return data;

    const query = search.toLowerCase();

    return data.filter((row) => {
      const keys =
        searchKeys.length > 0
          ? searchKeys
          : Object.keys(row);

      return keys.some((key) => {
        const value = row[key];

        if (
          value === null ||
          value === undefined
        ) {
          return false;
        }

        return String(value)
          .toLowerCase()
          .includes(query);
      });
    });
  }, [data, search, searchKeys]);

  // Sort
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;

    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      // Number sorting
      if (
        typeof aVal === 'number' &&
        typeof bVal === 'number'
      ) {
        return sortDir === 'asc'
          ? aVal - bVal
          : bVal - aVal;
      }

      const result = String(aVal ?? '')
        .toLowerCase()
        .localeCompare(
          String(bVal ?? '').toLowerCase(),
          undefined,
          {
            numeric: true,
          }
        );

      return sortDir === 'asc'
        ? result
        : -result;
    });
  }, [filtered, sortKey, sortDir]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(sorted.length / pageSize)
  );

  const paginated = sorted.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Auto Fix Invalid Page
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleSearch = (
    value: string
  ) => {
    setSearch(value);
    setPage(1);
  };

  const handleSort = (
    key: string
  ) => {
    if (sortKey === key) {
      setSortDir(
        sortDir === 'asc'
          ? 'desc'
          : 'asc'
      );
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const toggleExpand = (
    index: number
  ) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);

      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }

      return next;
    });
  };

  const goTo = (
    targetPage: number
  ) => {
    if (
      targetPage >= 1 &&
      targetPage <= totalPages
    ) {
      setPage(targetPage);
    }
  };

  const getPages = () => {
    const pages: number[] = [];

    const start = Math.max(
      1,
      page - 2
    );

    const end = Math.min(
      totalPages,
      start + 4
    );

    for (
      let i = start;
      i <= end;
      i++
    ) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      {(searchable ||
        headerRight) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          {searchable && (
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  handleSearch(
                    e.target.value
                  )
                }
                placeholder={
                  searchPlaceholder
                }
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          )}

          {headerRight && (
            <div className="flex items-center gap-2">
              {headerRight}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {columns.map(
                (column) => (
                  <th
                    key={
                      column.key
                    }
                    className={`px-5 py-3 text-left text-xs font-semibold tracking-wider text-slate-700 ${column.className || ''
                      }`}
                  >
                    {column.sortable ? (
                      <button
                        onClick={() =>
                          handleSort(
                            column.key
                          )
                        }
                        className="group flex items-center gap-1.5"
                      >
                        {
                          column.label
                        }

                        {sortKey ===
                          column.key ? (
                          sortDir ===
                            'asc' ? (
                            <ArrowUp className="h-3.5 w-3.5 text-indigo-600" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5 text-indigo-600" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-70" />
                        )}
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                )
              )}

              {actions && (
                <th className="px-5 py-3 text-right text-xs font-semibold tracking-wider text-slate-700">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (actions
                      ? 1
                      : 0)
                  }
                  className="px-5 py-16 text-center"
                >
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-indigo-600" />

                  <p className="mt-2 text-sm text-slate-500">
                    Loading...
                  </p>
                </td>
              </tr>
            ) : paginated.length ===
              0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (actions
                      ? 1
                      : 0)
                  }
                  className="px-5 py-16 text-center"
                >
                  <p className="text-sm text-slate-500">
                    {
                      emptyMessage
                    }
                  </p>
                </td>
              </tr>
            ) : (
              paginated.map(
                (
                  row,
                  index
                ) => {
                  const rowIndex =
                    (page -
                      1) *
                      pageSize +
                    index;

                  return (
                    <React.Fragment
                      key={
                        rowIndex
                      }
                    >
                      <tr
                        className={`border-b border-slate-100 transition hover:bg-slate-50 ${onRowClick || expandRow
                          ? 'cursor-pointer'
                          : ''
                          }`}
                        onClick={() => {
                          if (expandRow) toggleExpand(rowIndex);
                          onRowClick?.(row);
                        }}
                      >
                        {columns.map(
                          (
                            column
                          ) => (
                            <td
                              key={
                                column.key
                              }
                              className="px-5 py-3 text-sm text-slate-700"
                            >
                              {column.render
                                ? column.render(
                                  row
                                )
                                : String(
                                  row[
                                  column
                                    .key
                                  ] ??
                                  '—'
                                )}
                            </td>
                          )
                        )}

                        {actions && (
                          <td
                            className="px-5 py-3 text-right"
                            onClick={(
                              e
                            ) =>
                              e.stopPropagation()
                            }
                          >
                            {actions(
                              row
                            )}
                          </td>
                        )}
                      </tr>

                      {expandRow &&
                        expandedRows.has(
                          rowIndex
                        ) && (
                          <tr>
                            <td
                              colSpan={
                                columns.length +
                                (actions
                                  ? 1
                                  : 0)
                              }
                              className="bg-slate-50 px-5 py-4"
                            >
                              {expandRow(
                                row
                              )}
                            </td>
                          </tr>
                        )}
                    </React.Fragment>
                  );
                }
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {/* {totalPages > 1 && ( */}
        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
          <p className="text-xs text-slate-500">
            Showing{' '}
            {(page - 1) *
              pageSize +
              1}
            -
            {Math.min(
              page *
              pageSize,
              sorted.length
            )}{' '}
            of {sorted.length}
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                goTo(1)
              }
              disabled={
                page === 1
              }
              className="rounded-md p-2 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>

            <button
              onClick={() =>
                goTo(
                  page - 1
                )
              }
              disabled={
                page === 1
              }
              className="rounded-md p-2 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {getPages().map(
              (p) => (
                <button
                  key={p}
                  onClick={() =>
                    goTo(
                      p
                    )
                  }
                  className={`h-8 w-8 rounded-md text-sm font-medium ${p ===
                    page
                    ? 'bg-indigo-600 text-white'
                    : 'hover:bg-slate-100'
                    }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() =>
                goTo(
                  page + 1
                )
              }
              disabled={
                page ===
                totalPages
              }
              className="rounded-md p-2 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              onClick={() =>
                goTo(
                  totalPages
                )
              }
              disabled={
                page ===
                totalPages
              }
              className="rounded-md p-2 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      {/* )} */}
    </div>
  );
}