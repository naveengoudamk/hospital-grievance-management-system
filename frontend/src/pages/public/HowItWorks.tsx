import React from 'react';
import { Link } from 'react-router-dom';
import {
  QrCode,
  Shield,
  Search,
  CheckCircle2,
  FileText,
  UserCheck,
  Building,
  HelpCircle,
  AlertTriangle,
  Lock,
} from 'lucide-react';

export const HowItWorks: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-hospital-600 uppercase tracking-wider">
          <HelpCircle className="w-4 h-4" />
          <span>Patient & Public Grievance Charter</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          How the Grievance & Accountability System Works
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Designed to ensure complete transparency, eliminate bribery or misconduct, and protect complainant identity through ONE Universal QR Code.
        </p>
      </div>

      {/* 4 Stage Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-hospital-50 text-hospital-600 flex items-center justify-center font-bold text-lg">
            1
          </div>
          <h3 className="text-lg font-bold text-slate-900">Scan ONE Universal QR Code</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            The hospital deploys exactly one universal QR code across the premises. You don’t need separate codes for OPD, Pharmacy, Emergency, or Billing. After scanning, you simply choose the relevant area from the form dropdown.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg">
            2
          </div>
          <h3 className="text-lg font-bold text-slate-900">Anonymous or Identified Submission</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            You can report anonymously if you wish to protect your identity, or optionally provide your contact details so the grievance desk can follow up directly. You never need to create an account or password.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-lg">
            3
          </div>
          <h3 className="text-lg font-bold text-slate-900">Formal Inquiry by Appointed Committee</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Submissions are registered as allegations and assigned to hospital ombudsman committee members. Officers verify records, collect fact-finding findings, and initiate corrective administrative actions.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
            4
          </div>
          <h3 className="text-lg font-bold text-slate-900">Track Progress with Secret Token</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Upon submission, you receive a Reference ID and private tracking token. Only you can track your case milestones without exposing internal private deliberations or sensitive files.
          </p>
        </div>
      </div>

      {/* Safety / Allegation Doctrine */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-hospital-400 uppercase">
          <Shield className="w-4 h-4" />
          <span>Fair & Impartial Review Standards</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold">Presumption of Good Faith & Impartial Investigation</h3>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          The system strictly separates public allegations from verified administrative findings. Hospital personnel are not declared guilty without impartial fact-finding. Similarly, complainants are protected against retaliation.
        </p>
        <div className="pt-2">
          <Link
            to="/public/report"
            className="inline-flex items-center gap-2 bg-hospital-500 hover:bg-hospital-400 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Submit a Grievance Now</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
