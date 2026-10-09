"use client";

interface FilterOption {
  label: string;
  value: string;
}

export interface FilterDef {
  key: string;
  label: string;
  value: string;
  type?: "select" | "text";
  options?: FilterOption[];
}

interface FilterBarProps {
  filters: FilterDef[];
  onChange: (key: string, value: string) => void;
  onClear: () => void;
}

export default function FilterBar({
  filters,
  onChange,
  onClear,
}: FilterBarProps) {
  if (filters.length === 0) return null;

  const hasActiveFilters = filters.some((f) => f.value.trim() !== "");

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      {filters.map((f) =>
        f.type === "text" ? (
          <input
            key={f.key}
            type="text"
            value={f.value}
            placeholder={`Search ${f.label.toLowerCase()}...`}
            onChange={(e) => onChange(f.key, e.target.value)}
            className="rounded-lg border border-white/10 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none transition hover:border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        ) : (
          <select
            key={f.key}
            value={f.value}
            onChange={(e) => onChange(f.key, e.target.value)}
            className="rounded-lg border border-white/10 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none transition hover:border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">{f.label} All</option>

            {f.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )
      )}

      {hasActiveFilters && (
        <button
          onClick={onClear}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-red-600"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}