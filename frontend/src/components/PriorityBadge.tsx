import React from 'react';
import { Priority } from '../types';
import { AlertCircle, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';

interface PriorityBadgeProps {
  priority: Priority | string;
  showIcon?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, showIcon = true }) => {
  const getStyle = (p: string) => {
    switch (p) {
      case 'CRITICAL':
        return {
          classes: 'bg-red-50 text-red-700 border-red-200',
          icon: AlertCircle,
        };
      case 'HIGH':
        return {
          classes: 'bg-orange-50 text-orange-700 border-orange-200',
          icon: AlertTriangle,
        };
      case 'MEDIUM':
        return {
          classes: 'bg-sky-50 text-sky-700 border-sky-200',
          icon: ArrowUp,
        };
      case 'LOW':
        return {
          classes: 'bg-slate-50 text-slate-700 border-slate-200',
          icon: ArrowDown,
        };
      default:
        return {
          classes: 'bg-gray-50 text-gray-700 border-gray-200',
          icon: ArrowDown,
        };
    }
  };

  const style = getStyle(priority);
  const Icon = style.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-md border uppercase tracking-wider ${style.classes}`}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      <span>{priority}</span>
    </span>
  );
};
