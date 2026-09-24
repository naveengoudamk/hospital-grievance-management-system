import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  colorScheme?: 'blue' | 'purple' | 'amber' | 'emerald' | 'rose' | 'indigo';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme = 'blue',
  onClick,
}) => {
  const schemes = {
    blue: {
      bg: 'bg-hospital-50',
      text: 'text-hospital-700',
      iconBg: 'bg-hospital-500 text-white',
      border: 'border-hospital-100',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      iconBg: 'bg-purple-500 text-white',
      border: 'border-purple-100',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      iconBg: 'bg-amber-500 text-white',
      border: 'border-amber-100',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      iconBg: 'bg-emerald-500 text-white',
      border: 'border-emerald-100',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      iconBg: 'bg-rose-500 text-white',
      border: 'border-rose-100',
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      iconBg: 'bg-indigo-500 text-white',
      border: 'border-indigo-100',
    },
  };

  const current = schemes[colorScheme];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border ${current.border} p-5 sm:p-6 shadow-sm hover:shadow-md transition-all ${
        onClick ? 'cursor-pointer hover:border-hospital-300' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl ${current.iconBg} flex items-center justify-center shadow-sm flex-shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
