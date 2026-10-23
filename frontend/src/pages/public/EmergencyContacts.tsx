import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PhoneCall,
  AlertTriangle,
  ShieldAlert,
  HeartPulse,
  Phone,
  Ambulance,
  Flame,
  Search,
  Copy,
  Check,
  Pill,
  Clock,
  ArrowRight,
  ShieldCheck,
  Info,
} from 'lucide-react';

interface EmergencyContactItem {
  id: string;
  title: string;
  category: 'critical' | 'safety' | 'ombudsman' | 'clinical';
  categoryLabel: string;
  number: string;
  description: string;
  hours: string;
  icon: React.ElementType;
  color: string;
  accentBg: string;
}

export const EmergencyContacts: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const emergencyList: EmergencyContactItem[] = [
    {
      id: 'er-trauma',
      title: 'Hospital Emergency Room & Trauma',
      category: 'critical',
      categoryLabel: 'Critical Care (24x7)',
      number: '+1 (555) 911-0000 / Ext 101',
      description: 'Immediate medical triage, cardiac arrest, poly-trauma, stroke code, and critical ICU admissions.',
      hours: 'Open 24 Hours / 7 Days',
      icon: HeartPulse,
      color: 'border-red-200 hover:border-red-400',
      accentBg: 'bg-red-50 text-red-600',
    },
    {
      id: 'ambulance-dispatch',
      title: 'Ambulance & Critical Transport Dispatch',
      category: 'critical',
      categoryLabel: 'Critical Care (24x7)',
      number: '112 / +1 (555) 911-0112',
      description: 'Emergency road transit, mobile ventilator life-support, neonatal transit, and inter-facility transfers.',
      hours: 'Open 24 Hours / 7 Days',
      icon: Ambulance,
      color: 'border-orange-200 hover:border-orange-400',
      accentBg: 'bg-orange-50 text-orange-600',
    },
    {
      id: 'campus-security',
      title: 'Hospital Security & Campus Safety Office',
      category: 'safety',
      categoryLabel: 'Campus Safety',
      number: '+1 (555) 234-5678 / Ext 999',
      description: 'Physical safety threats, perimeter containment, lost patient search, misconduct control, and theft reporting.',
      hours: 'Open 24 Hours / 7 Days',
      icon: ShieldAlert,
      color: 'border-indigo-200 hover:border-indigo-400',
      accentBg: 'bg-indigo-50 text-indigo-600',
    },
    {
      id: 'hospital-ombudsman',
      title: 'Hospital Ombudsman & Grievance Desk',
      category: 'ombudsman',
      categoryLabel: 'Redressal Cell',
      number: '+1 (555) 234-5678 / Ext 400',
      description: 'Direct institutional escalation desk for serious staff misconduct, billing discrepancies, and grievance lodging.',
      hours: 'Mon – Sat: 8:00 AM – 7:00 PM',
      icon: Phone,
      color: 'border-sky-200 hover:border-sky-400',
      accentBg: 'bg-sky-50 text-sky-600',
    },
    {
      id: 'pharmacy-urgent',
      title: '24x7 In-Patient Pharmacy & Antidote Unit',
      category: 'clinical',
      categoryLabel: 'Clinical Support',
      number: '+1 (555) 234-5678 / Ext 204',
      description: 'Urgent medication verification, critical antidote dispensary, oncology drug supply, and nocturnal prescriptions.',
      hours: 'Open 24 Hours / 7 Days',
      icon: Pill,
      color: 'border-emerald-200 hover:border-emerald-400',
      accentBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      id: 'fire-safety',
      title: 'Fire & Occupational Hazard Response',
      category: 'safety',
      categoryLabel: 'Hazard Protocol',
      number: '+1 (555) 234-5678 / Ext 108',
      description: 'Gas line leaks, smoke detection alarms, electrical hazards, chemical containment, and evacuation management.',
      hours: 'Open 24 Hours / 7 Days',
      icon: Flame,
      color: 'border-rose-200 hover:border-rose-400',
      accentBg: 'bg-rose-50 text-rose-600',
    },
  ];

  const handleCopyNumber = (id: string, fullNumber: string) => {
    // Extract base phone number before slash
    const phoneToCopy = fullNumber.split('/')[0].trim();
    navigator.clipboard.writeText(phoneToCopy);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2200);
  };

  const filteredContacts = emergencyList.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10">
      {/* Disclaimer Banner */}
      <div className="p-6 rounded-3xl bg-amber-50/90 border border-amber-200 text-amber-950 flex flex-col sm:flex-row items-start gap-4 shadow-sm backdrop-blur-xs">
        <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
          <strong className="block text-sm sm:text-base font-bold text-amber-950">
            Emergency Notice & Triage Safety First
          </strong>
          <p>
            The online grievance portal is <strong>NOT an emergency dispatch service</strong>. For immediate life peril, acute cardiac arrest, respiratory crisis, severe trauma, or active physical conflict, please dial the 24x7 hotlines below immediately or summon the nearest on-floor nursing supervisor.
          </p>
        </div>
      </div>

      {/* Title & Search / Filter Controls */}
      <div className="space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-hospital-600 uppercase tracking-wider mb-1.5">
            <PhoneCall className="w-4 h-4" />
            <span>Institutional Helpline Directory</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Emergency & Urgent Contacts
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Direct telephonic access to hospital triage, ambulance coordination, on-duty campus security, and ombudsman desks.
          </p>
        </div>

        {/* Search Bar & Category Tabs */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by department, trauma, security, ext..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-hospital-500/20 focus:border-hospital-500 shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { key: 'all', label: 'All Units' },
              { key: 'critical', label: 'Critical Care' },
              { key: 'safety', label: 'Safety & Security' },
              { key: 'ombudsman', label: 'Ombudsman' },
              { key: 'clinical', label: 'Clinical' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedCategory(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === tab.key
                    ? 'bg-hospital-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredContacts.length > 0 ? (
          filteredContacts.map((item) => {
            const Icon = item.icon;
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className={`p-6 rounded-3xl border ${item.color} bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between group`}
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${item.accentBg} flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{item.hours}</span>
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] uppercase font-bold tracking-wider text-hospital-600 block mb-1">
                    {item.categoryLabel}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mb-1.5 group-hover:text-hospital-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${item.number.split('/')[0].trim()}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-mono font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-xs transition-colors"
                    >
                      <PhoneCall className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="truncate">{item.number}</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleCopyNumber(item.id, item.number)}
                      title="Copy telephone number"
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center transition-all ${
                        isCopied
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-1 md:col-span-2 text-center py-12 bg-slate-50 border border-slate-200 rounded-3xl">
            <Search className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No helplines match your search</p>
            <p className="text-xs text-slate-500 mt-1">Try searching for keywords like "trauma", "ambulance", or "ICU".</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold text-hospital-600 bg-white border border-hospital-200 rounded-xl hover:bg-hospital-50"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Caller Protocol Guidance & Redressal Route */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-hospital-600 uppercase tracking-wider">
            <Info className="w-4 h-4" />
            <span>Emergency Call Checklist</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            What to tell the triage operator when calling:
          </h3>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-hospital-100 text-hospital-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </span>
              <span><strong>Patient Location:</strong> Provide exact Ward name, Bed or Room number, or Campus Wing.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-hospital-100 text-hospital-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </span>
              <span><strong>Chief Condition:</strong> Unconsciousness, chest distress, severe bleeding, or violent obstruction.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-hospital-100 text-hospital-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                3
              </span>
              <span><strong>Patient Identifier:</strong> Hospital IP/OP number or Patient Name if known.</span>
            </li>
          </ul>
        </div>

        {/* Non-emergency redirection card */}
        <div className="bg-gradient-to-br from-hospital-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-hospital-300 uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Grievance Mechanism</span>
            </div>
            <h4 className="text-base font-bold text-white">Not a physical emergency?</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              If your issue concerns unofficial fees, staff misconduct, delays, or sanitation, submit an official grievance with ONE Universal QR code.
            </p>
          </div>
          <div className="pt-6">
            <Link
              to="/public/report"
              className="inline-flex items-center justify-center gap-2 w-full bg-hospital-500 hover:bg-hospital-400 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl transition-colors shadow-sm"
            >
              <span>Submit Grievance</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
