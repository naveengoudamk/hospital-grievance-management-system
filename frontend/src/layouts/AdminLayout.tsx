import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  Users,
  Tags,
  MapPin,
  QrCode,
  History,
  LogOut,
  Shield,
  Menu,
  X,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAdmin) {
    navigate('/login');
    return null;
  }

  const navItems = [
    { to: '/admin/dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { to: '/admin/complaints', label: 'All Complaints', icon: Inbox },
    { to: '/admin/users', label: 'Staff & Committee', icon: Users },
    { to: '/admin/categories', label: 'Categories', icon: Tags },
    { to: '/admin/locations', label: 'Hospital Locations', icon: MapPin },
    { to: '/admin/qr', label: 'Universal QR Code', icon: QrCode },
    { to: '/admin/audit-logs', label: 'System Audit Trail', icon: History },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-slate-100/70">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen z-50 w-64 bg-slate-900 text-white flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
            <Link to="/admin/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-hospital-500 flex items-center justify-center text-white shadow-sm">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-hospital-400">Admin Control</span>
                <span className="block text-sm font-bold text-white leading-tight">Grievance Central</span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Administration
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to || (item.to !== '/admin/dashboard' && location.pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-hospital-600 text-white shadow-sm shadow-hospital-500/20'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-hospital-700 text-white flex items-center justify-center font-bold text-xs">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="truncate">
              <span className="block text-xs font-bold text-white truncate">{user?.fullName}</span>
              <span className="block text-[10px] text-hospital-400 uppercase font-semibold">Chief Administrator</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 border border-rose-500/20 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>City General Hospital</span>
              <span>/</span>
              <span className="font-semibold text-slate-900 capitalize">
                {location.pathname.replace('/admin/', '').replace('/', ' ') || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/public"
              target="_blank"
              className="text-xs font-semibold text-hospital-600 hover:text-hospital-700 bg-hospital-50 hover:bg-hospital-100 px-3 py-1.5 rounded-lg border border-hospital-200 transition-colors"
            >
              View Public Portal
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
