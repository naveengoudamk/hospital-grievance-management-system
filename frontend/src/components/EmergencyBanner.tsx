import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, PhoneCall } from 'lucide-react';

export const EmergencyBanner: React.FC = () => {
  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 sm:py-3 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div className="flex items-center gap-2 justify-center">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong>Immediate Medical Emergency?</strong> This grievance portal is for service inquiries and issues. Do not use for urgent clinical danger.
          </span>
        </div>
        <Link
          to="/public/emergency"
          className="inline-flex items-center gap-1 font-semibold text-amber-900 hover:text-amber-950 underline decoration-amber-400 underline-offset-2 flex-shrink-0"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Dial 24x7 Emergency Help</span>
        </Link>
      </div>
    </div>
  );
};
