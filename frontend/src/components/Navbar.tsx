import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, QrCode, FileText, Search, PhoneCall, Lock, Menu, X, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/public', label: 'Home', icon: QrCode },
    { to: '/public/report', label: 'Report an Issue', icon: FileText },
    { to: '/public/track', label: 'Track My Complaint', icon: Search },
    { to: '/public/how-it-works', label: 'How It Works', icon: Shield },
    { to: '/public/emergency', label: 'Emergency Contacts', icon: PhoneCall },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Portal Identity */}
          <Link to="/public" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-hospital-700 via-hospital-600 to-hospital-500 flex items-center justify-center text-white shadow-md shadow-hospital-500/25 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-hospital-600">Universal QR Redressal</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <span className="block text-base sm:text-lg font-display font-bold text-slate-900 leading-tight">
                Hospital Grievance Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-hospital-50 text-hospital-700 shadow-xs border border-hospital-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-hospital-600' : 'text-slate-400'}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Internal Portal Link & Mobile Toggle */}
          <div className="flex items-center gap-2.5">
            {isAuthenticated ? (
              <Link
                to={isAdmin ? '/admin/dashboard' : '/committee/dashboard'}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all hover:scale-[1.02]"
              >
                <Lock className="w-4 h-4 text-hospital-400" />
                <span>{isAdmin ? 'Admin Console' : 'Committee Portal'}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-hospital-600 bg-slate-100 hover:bg-hospital-50 border border-slate-200/80 hover:border-hospital-200 px-3.5 py-2 rounded-xl transition-all"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Staff Login</span>
              </Link>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/98 px-4 pt-3 pb-5 space-y-1 shadow-lg">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-hospital-50 text-hospital-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-hospital-600' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300" />
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
