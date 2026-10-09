import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient: string;
  iconBg: string;
  trend?: { value: string; positive: boolean };
  color: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  gradient,
  iconBg,
  trend,
  color
}: StatCardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-md border border-white/[0.08] bg-[#1c1933]/80 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.15] hover:shadow-xl hover:shadow-purple-500/5`}
    >
      {/* Subtle gradient glow */}
      <div
        className={`absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-40 ${gradient}`}
      />

      <div className="relative flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            {title}
          </p>
          <p className="text-3xl font-bold tracking-tight text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {trend && (
            <div className="mt-1 flex items-center gap-1">
              <span
                className={`text-xs font-medium ${
                  trend.positive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {trend.positive ? '↑' : '↓'} {trend.value}
              </span>
              <span className="text-[10px] text-gray-500">vs last month</span>
            </div>
          )}
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-md ${iconBg} shadow-lg transition-transform duration-300 group-hover:scale-110`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}
