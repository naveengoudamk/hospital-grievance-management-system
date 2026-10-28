import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Command,
  X,
  FileText,
  PhoneCall,
  Shield,
  LayoutDashboard,
  Users,
  QrCode,
  History,
  LifeBuoy,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PaletteItem {
  id: string;
  title: string;
  description: string;
  category: 'Public Services' | 'Emergency & Hotlines' | 'Staff Portals';
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  badge?: string;
}

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const items: PaletteItem[] = [
    {
      id: 'report',
      title: 'Report New Grievance',
      description: 'Submit an incident report or service complaint via guided wizard',
      category: 'Public Services',
      icon: FileText,
      action: () => {
        navigate('/public/report');
        setIsOpen(false);
      },
      badge: 'Public',
    },
    {
      id: 'track',
      title: 'Track Complaint Status',
      description: 'Check investigation milestones using reference number & token',
      category: 'Public Services',
      icon: Search,
      action: () => {
        navigate('/public/track');
        setIsOpen(false);
      },
      badge: 'Real-time',
    },
    {
      id: 'charter',
      title: 'Patient Rights & Redressal Charter',
      description: 'Learn about standard resolution SLAs and committee procedures',
      category: 'Public Services',
      icon: Shield,
      action: () => {
        navigate('/public/how-it-works');
        setIsOpen(false);
      },
    },
    {
      id: 'emergency',
      title: 'Emergency Contacts & Security Desk',
      description: 'Immediate casualty, police liaison, and ombudsman contacts',
      category: 'Emergency & Hotlines',
      icon: PhoneCall,
      action: () => {
        navigate('/public/emergency');
        setIsOpen(false);
      },
      badge: '24/7 Hotlines',
    },
    {
      id: 'er-call',
      title: 'Direct Casualty Emergency: Dial 102',
      description: 'Immediate ambulance and trauma center dispatch hotline',
      category: 'Emergency & Hotlines',
      icon: LifeBuoy,
      action: () => {
        window.location.href = 'tel:102';
        setIsOpen(false);
      },
    },
    ...(isAuthenticated
      ? [
          {
            id: 'admin-dash',
            title: isAdmin ? 'Admin Console Dashboard' : 'Committee Portal Dashboard',
            description: 'Monitor active caseloads, response times, and departmental analytics',
            category: 'Staff Portals' as const,
            icon: LayoutDashboard,
            action: () => {
              navigate(isAdmin ? '/admin/dashboard' : '/committee/dashboard');
              setIsOpen(false);
            },
          },
          ...(isAdmin
            ? [
                {
                  id: 'admin-users',
                  title: 'User & Staff Directory',
                  description: 'Manage committee assignments and portal roles',
                  category: 'Staff Portals' as const,
                  icon: Users,
                  action: () => {
                    navigate('/admin/users');
                    setIsOpen(false);
                  },
                },
                {
                  id: 'admin-qr',
                  title: 'Universal QR Code Generator',
                  description: 'Regenerate physical signage QR codes for hospital wards',
                  category: 'Staff Portals' as const,
                  icon: QrCode,
                  action: () => {
                    navigate('/admin/qr');
                    setIsOpen(false);
                  },
                },
                {
                  id: 'admin-audit',
                  title: 'Audit Trail & Compliance Log',
                  description: 'Immutable record of operator authentications and status transitions',
                  category: 'Staff Portals' as const,
                  icon: History,
                  action: () => {
                    navigate('/admin/audit-logs');
                    setIsOpen(false);
                  },
                },
              ]
            : []),
        ]
      : []),
  ];

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleItemClick = (item: PaletteItem) => {
    item.action();
  };

  const handleKeyDownNav = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-slate-900/90 hover:bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl backdrop-blur-xs border border-slate-700/50 flex items-center gap-2 group transition-all hover:scale-105"
        title="Quick Navigator (Cmd + K)"
        aria-label="Open command palette"
      >
        <Command className="w-5 h-5 text-hospital-400 group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline text-xs font-semibold pr-1">Quick Search</span>
        <kbd className="hidden sm:inline px-1.5 py-0.5 text-[10px] bg-slate-800 border border-slate-700 rounded-md font-mono text-slate-300">
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div
        className="fixed inset-0"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-scale-up">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-hospital-600 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownNav}
            placeholder="Type a destination, department, or action..."
            className="w-full text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
          />
          <kbd className="hidden sm:inline px-2 py-0.5 text-[10px] bg-slate-100 border border-slate-200 rounded font-mono text-slate-500">
            ESC
          </kbd>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No matching actions or hospital destinations found for "{query}".
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                    isSelected
                      ? 'bg-hospital-50 border border-hospital-200 text-hospital-900 shadow-xs'
                      : 'hover:bg-slate-50 border border-transparent text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isSelected
                          ? 'bg-hospital-600 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        {item.description}
                      </span>
                    </div>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 transition-transform ${
                      isSelected
                        ? 'text-hospital-600 translate-x-0.5'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigate with <kbd className="font-mono">↑</kbd> <kbd className="font-mono">↓</kbd></span>
          <span>Select with <kbd className="font-mono">Enter</kbd></span>
        </div>
      </div>
    </div>
  );
};
