export type BadgeType = 
  | 'role' 
  | 'status' 
  | 'boolean' 
  | 'category'
  | 'post_status';

interface StatusBadgeProps {
  type: BadgeType;
  value: string | boolean;
}

export default function StatusBadge({ type, value }: StatusBadgeProps) {
  let colorClass = 'bg-gray-500/10 text-gray-400 ring-gray-500/20';
  let label = String(value);

  if (type === 'boolean') {
    const isTrue = value === true || value === 'true';
    label = isTrue ? 'Active' : 'Inactive';
    colorClass = isTrue
      ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20'
      : 'bg-rose-500/10 text-rose-400 ring-rose-500/20';
  } else if (type === 'role') {
    if (value === 'ADMIN') {
      colorClass = 'bg-indigo-500/10 text-indigo-400 ring-indigo-500/20';
    } else {
      colorClass = 'bg-blue-500/10 text-blue-400 ring-blue-500/20';
    }
  } else if (type === 'post_status') {
    if (value === 'PUBLISHED') {
      colorClass = 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20';
    } else if (value === 'DRAFT') {
      colorClass = 'bg-amber-500/10 text-amber-400 ring-amber-500/20';
    } else if (value === 'ARCHIVED') {
      colorClass = 'bg-gray-500/10 text-gray-400 ring-gray-500/20';
    }
  } else if (type === 'category') {
    colorClass = 'bg-purple-500/10 text-purple-400 ring-purple-500/20';
  }

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${colorClass}`}
    >
      {label}
    </span>
  );
}
