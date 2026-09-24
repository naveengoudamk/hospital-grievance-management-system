import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Identity */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5 text-white">
              <ShieldCheck className="w-6 h-6 text-hospital-400" />
              <span className="font-bold text-base tracking-wide">City General Hospital</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Institutional Grievance & Accountability Redressal Mechanism. Designed to ensure transparent patient care, zero tolerance for misconduct, and prompt administrative resolution.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-xs text-slate-300 border border-slate-700">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cryptographic Tracking & Anonymity Protected</span>
            </div>
          </div>

          {/* Col 2: Public Navigation */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/public" className="hover:text-white transition-colors">Universal QR Portal Home</Link>
              </li>
              <li>
                <Link to="/public/report" className="hover:text-white transition-colors">Report an Issue (One QR)</Link>
              </li>
              <li>
                <Link to="/public/track" className="hover:text-white transition-colors">Track My Complaint</Link>
              </li>
              <li>
                <Link to="/public/how-it-works" className="hover:text-white transition-colors">Investigation Process & FAQ</Link>
              </li>
              <li>
                <Link to="/public/emergency" className="hover:text-white transition-colors">Emergency Hotlines</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Principles & Policy */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Grievance Charter</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              All submissions are received under strict confidentiality and treated as reported allegations until impartial fact-finding is concluded by the appointed committee.
            </p>
            <p className="text-xs text-slate-500">
              False or malicious submissions are subject to review in accordance with healthcare governance regulations.
            </p>
          </div>

          {/* Col 4: Hospital Contact */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Hospital Ombudsman Desk</h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-hospital-400 flex-shrink-0 mt-0.5" />
                <span>100 Healthcare Boulevard, Metro City, ST 90210</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-hospital-400 flex-shrink-0" />
                <span>+1 (555) 234-5678 (Ext. 400)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-hospital-400 flex-shrink-0" />
                <span>grievance@citygeneral.org</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} City General Hospital Grievance & Accountability System. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/public/how-it-works" className="hover:text-slate-400">Patient Privacy Policy</Link>
            <span>•</span>
            <Link to="/login" className="hover:text-slate-400">Authorized Personnel Gateway</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
