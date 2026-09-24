import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Shield,
  PhoneCall,
  QrCode,
  CheckCircle2,
  Lock,
  UserCheck,
  AlertOctagon,
  ArrowRight,
  EyeOff,
  Building2,
} from 'lucide-react';
import { publicApi } from '../../api/publicApi';
import { QrConfig } from '../../types';

export const PublicHome: React.FC = () => {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [qrConfig, setQrConfig] = useState<QrConfig | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await publicApi.getPublicConfig();
        setConfig(data);
      } catch (err) {
        console.error('Failed to load public config:', err);
      }
    };
    fetchConfig();
  }, []);

  return (
    <div className="space-y-12 sm:space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-hospital-50 via-white to-slate-50 pt-10 sm:pt-16 pb-12 sm:pb-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* Left Column: Heading & Action Cards */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-hospital-100 text-hospital-800 text-xs font-bold uppercase tracking-wider border border-hospital-200 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-hospital-600 animate-ping"></span>
                <span>Universal QR Code Healthcare Oversight</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Hospital Grievance & Accountability Portal
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Your voice helps eliminate service deficiencies, counter harassment or unofficial billing, and improve patient safety. Report any issue across any hospital department with <strong>ONE Universal QR Code</strong>.
              </p>

              {/* 4 Core Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 max-w-xl mx-auto lg:mx-0">
                <Link
                  to="/public/report"
                  className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-hospital-600 to-hospital-700 hover:from-hospital-700 hover:to-hospital-800 text-white shadow-lg shadow-hospital-600/25 transition-all hover:scale-[1.02] group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="block font-bold text-sm">Report an Issue</span>
                      <span className="block text-[11px] text-hospital-100">Submit grievance or allegation</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/public/track"
                  className="flex items-center justify-between p-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 shadow-sm hover:border-hospital-300 transition-all hover:scale-[1.02] group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-hospital-50 flex items-center justify-center text-hospital-600">
                      <Search className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="block font-bold text-sm">Track My Complaint</span>
                      <span className="block text-[11px] text-slate-500">Live inquiry timeline</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-hospital-600 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/public/how-it-works"
                  className="flex items-center justify-between p-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 shadow-sm hover:border-hospital-300 transition-all hover:scale-[1.02] group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-purple-50 flex items-center justify-center text-purple-600">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="block font-bold text-sm">How It Works</span>
                      <span className="block text-[11px] text-slate-500">Inquiry & safety policies</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/public/emergency"
                  className="flex items-center justify-between p-4 rounded-2xl bg-white hover:bg-amber-50/50 text-slate-900 border border-amber-200/80 shadow-sm hover:border-amber-400 transition-all hover:scale-[1.02] group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100/70 flex items-center justify-center text-amber-700">
                      <PhoneCall className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="block font-bold text-sm text-amber-950">Emergency Help</span>
                      <span className="block text-[11px] text-amber-700">24x7 Urgent helpline</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Guarantees Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-3 text-xs text-slate-600">
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>No Account / Registration Required</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <EyeOff className="w-4 h-4 text-hospital-500 flex-shrink-0" />
                  <span>100% Anonymous Option</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Lock className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  <span>Cryptographic Token Security</span>
                </div>
              </div>
            </div>

            {/* Right Column: ONE Universal QR Code Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xl shadow-slate-200/60 text-center relative">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-slate-900 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-hospital-400" />
                  <span>ONE Universal Hospital QR Code</span>
                </div>

                <div className="mt-2 mb-4">
                  <span className="text-[11px] font-semibold text-hospital-600 uppercase tracking-wider block">Official Hospital QR</span>
                  <h3 className="text-base font-bold text-slate-900">{config.hospitalName || 'City General Hospital'}</h3>
                </div>

                {/* QR code box */}
                <div className="p-4 bg-slate-50 border-2 border-dashed border-hospital-200 rounded-2xl inline-block mb-4">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                      window.location.origin + '/public'
                    )}`}
                    alt="Universal Grievance QR Code"
                    className="w-48 h-48 mx-auto rounded-lg"
                  />
                </div>

                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Scan this exact QR anywhere on hospital premises (Reception, OPD, Pharmacy, Billing, Emergency, or Wards) to access this portal.
                </p>

                <Link
                  to="/public/report"
                  className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 rounded-xl shadow-sm transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Start Submission Now</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Why ONE Universal QR Architecture? */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            One Single Universal QR Code for the Entire Hospital
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            No messy department-specific QR codes. One QR code is printed across all floors, counters, and waiting bays. You select your location effortlessly from the dropdown.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-hospital-300 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-hospital-50 flex items-center justify-center text-hospital-600 mb-4">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">1. Scan & Access Instantly</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No app download or user account required. Scanning the universal QR code instantly opens the clean mobile portal.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-hospital-300 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-4">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">2. Choose Location & Category</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Select whether the grievance relates to OPD, Billing, Pharmacy, Doctor consultation, Nursing, Cleanliness, or Security.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-hospital-300 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">3. Track with Secure Token</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Receive a Reference ID and private tracking token. Follow each stage of administrative fact-finding and action taken in complete safety.
            </p>
          </div>
        </div>
      </section>

      {/* Safety & Impartial Inquiry Standard Notice */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl text-white p-8 sm:p-10 border border-slate-800">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-hospital-400 uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                <span>Hospital Ombudsman Fact-Finding Policy</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">Impartial Review & Verified Accountability</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                All submissions are registered as allegations and promptly evaluated by appointed grievance committee officers. We ensure non-retaliation, strict confidentiality, and formal recording of corrective actions taken.
              </p>
            </div>
            <Link
              to="/public/report"
              className="bg-hospital-500 hover:bg-hospital-400 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-md transition-colors flex-shrink-0"
            >
              Report an Issue Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
