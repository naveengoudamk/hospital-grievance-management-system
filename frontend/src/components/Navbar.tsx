import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, QrCode, AlertCircle, FileText, Search, PhoneCall, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, isAdmin, isCommitteeMember } = useAuth();

  const navLinks = [
    { to: '/public', label: 'Home', icon: QrCode },
    { to: '/public/report', label: 'Report an Issue', icon: FileText },
    { to: '/public/track', label: 'Track My Complaint', icon: Search },
    { to: '/public/how-it-works', label: 'How It Works', icon: Shield },
    { to: '/public/emergency', label: 'Emergency Contacts', icon: PhoneCall },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Portal Identity */}
          <Link to="/public" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-hospital-700 via-hospital-600 to-hospital-500 flex items-center justify-center text-white shadow-md shadow-hospital-500/20 group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-hospital-600">Universal QR Portal</span>
              <span className="block text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Hospital Grievance System
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-hospital-50 text-hospital-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-hospital-600' : 'text-slate-400'}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Internal Portal Link */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to={isAdmin ? '/admin/dashboard' : '/committee/dashboard'}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-all"
              >
                <Lock className="w-4 h-4 text-hospital-400" />
                <span>{isAdmin ? 'Admin Portal' : 'Committee Portal'}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-hospital-600 border border-slate-200 hover:border-hospital-300 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg transition-all"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Staff Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
