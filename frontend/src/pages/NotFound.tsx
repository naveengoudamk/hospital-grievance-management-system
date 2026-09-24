import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, QrCode } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
        <div className="w-16 h-16 rounded-3xl bg-hospital-50 text-hospital-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <span className="text-4xl font-extrabold text-slate-900 block font-mono">404</span>
          <h2 className="text-xl font-bold text-slate-800 mt-1">Page Not Found</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            The page you are trying to access does not exist or has been moved.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <Link
            to="/public"
            className="inline-flex items-center justify-center gap-2 bg-hospital-600 hover:bg-hospital-700 text-white font-bold text-xs py-3 rounded-xl shadow-xs transition-colors"
          >
            <QrCode className="w-4 h-4" />
            <span>Go to Universal QR Portal</span>
          </Link>

          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900 font-semibold text-xs py-2"
          >
            <span>Staff Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
