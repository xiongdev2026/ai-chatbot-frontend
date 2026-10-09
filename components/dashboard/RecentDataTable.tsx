"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface RecentDataRow {
  question: string;
  answer: string;
  // createdAt: string;
  // user?: {
  //   fullName?: string;
  //   email?: string;
  // };
  time: string;
}

interface RecentDataTableProps {
  data: RecentDataRow[];
  pageSize?: number;
}

export default function RecentDataTable({
  data,
  pageSize = 5,
}: RecentDataTableProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize);

  const paginated = data.slice((page - 1) * pageSize, page * pageSize);

  const goTo = (p: number) => {
    if (p >= 1 && p <= totalPages) {
      setPage(p);
    }
  };

  const getPages = () => {
    const pages: number[] = [];

    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const formatTime = (time: string) => {
    return format(new Date(time), "yyyy-MM-dd HH:mm:ss");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <h3 className="font-semibold text-slate-800">Recent Data</h3>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="px-4 py-3 text-left text-xs">Question</th>

              <th className="px-4 py-3 text-left text-xs">Answer</th>

              <th className="px-4 py-3 text-left text-xs">Time</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((row, index) => (
              <tr key={index} className="border-b hover:bg-slate-50">
                <td className="px-4 py-3 text-sm">{row.question}</td>
                <td className="px-4 py-3 text-sm">{row.answer}</td>

                <td className="px-4 py-3 text-sm text-slate-500">
                  {formatTime(row.time)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 border-t p-3">
          <button onClick={() => goTo(1)}>
            <ChevronsLeft size={16} />
          </button>

          <button onClick={() => goTo(page - 1)}>
            <ChevronLeft size={16} />
          </button>

          {getPages().map((p) => (
            <button
              key={p}
              onClick={() => goTo(p)}
              className={`h-8 w-8 rounded ${
                p === page ? "bg-indigo-500 text-white" : "hover:bg-slate-100"
              }`}
            >
              {p}
            </button>
          ))}

          <button onClick={() => goTo(page + 1)}>
            <ChevronRight size={16} />
          </button>

          <button onClick={() => goTo(totalPages)}>
            <ChevronsRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
