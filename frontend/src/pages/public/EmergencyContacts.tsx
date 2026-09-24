import React from 'react';
import { PhoneCall, AlertTriangle, ShieldAlert, HeartPulse, Phone, Ambulance, Flame } from 'lucide-react';

export const EmergencyContacts: React.FC = () => {
  const emergencyList = [
    {
      title: 'Hospital Emergency Room & Trauma (24x7)',
      number: '+1 (555) 911-0000 / Ext 101',
      description: 'Immediate medical triage, cardiac arrest, trauma, ICU admission',
      icon: HeartPulse,
      color: 'bg-red-50 text-red-600 border-red-200',
    },
    {
      title: 'Ambulance & Critical Transport Dispatch',
      number: '112 / +1 (555) 911-0112',
      description: 'Emergency ambulance pickup, oxygen support transfer',
      icon: Ambulance,
      color: 'bg-orange-50 text-orange-600 border-orange-200',
    },
    {
      title: 'Hospital Security & Campus Safety Office',
      number: '+1 (555) 234-5678 / Ext 999',
      description: 'Physical danger, theft, violent misconduct, campus trespassing',
      icon: ShieldAlert,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
    {
      title: 'Hospital Ombudsman & Grievance Desk',
      number: '+1 (555) 234-5678 / Ext 400',
      description: 'Direct telephonic grievance registration during working hours (9 AM - 6 PM)',
      icon: Phone,
      color: 'bg-sky-50 text-sky-600 border-sky-200',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10">
      {/* Disclaimer Banner */}
      <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 text-amber-950 flex flex-col sm:flex-row items-start gap-4 shadow-sm">
        <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs sm:text-sm leading-relaxed">
          <strong className="block text-sm sm:text-base font-bold text-amber-950">
            Emergency Notice & Triage Safety
          </strong>
          <p>
            The online grievance reporting portal is <strong>NOT</strong> an emergency dispatch service. For life-threatening emergencies, cardiac distress, violent altercations, or immediate patient peril, please contact the dedicated 24x7 phone numbers below or alert on-duty nurses immediately.
          </p>
        </div>
      </div>

      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-hospital-600 uppercase tracking-wider mb-1">
          <PhoneCall className="w-4 h-4" />
          <span>Institutional Helpline Directory</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Emergency & Important Contacts
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Direct telephone access to hospital emergency wings and administration.
        </p>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {emergencyList.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`p-6 rounded-3xl border ${item.color} bg-white shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between`}
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-xs text-slate-500 mb-4">{item.description}</p>
              </div>

              <a
                href={`tel:${item.number.split('/')[0].trim()}`}
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-mono font-bold text-xs sm:text-sm py-3 rounded-xl transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>{item.number}</span>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
};
