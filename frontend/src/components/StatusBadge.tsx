import React from 'react';
import { ComplaintStatus } from '../types';

interface StatusBadgeProps {
  status: ComplaintStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const getStyle = (s: string) => {
    switch (s) {
      case 'SUBMITTED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'UNDER_REVIEW':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'ASSIGNED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'INVESTIGATION':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'ACTION_TAKEN':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'RESOLVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'CLOSED':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getLabel = (s: string) => {
    return s.replace(/_/g, ' ');
  };

  const sizeClasses = {
    sm: 'text-[11px] px-2.5 py-0.5 font-semibold',
    md: 'text-xs px-3 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border uppercase tracking-wider ${getStyle(
        status
      )} ${sizeClasses[size]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70"></span>
      {getLabel(status)}
    </span>
  );
};
