import React, { useState } from 'react';
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
  ChevronDown,
  Clock,
  Scale,
  ShieldCheck,
  FileCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const HowItWorks: React.FC = () => {
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');

  const faqs: FaqItem[] = [
    {
      id: 'faq-1',
      question: 'Is my identity truly protected if I submit anonymously?',
      answer:
        'Yes, absolutely. When you select anonymous reporting, the system generates a cryptographically random tracking hash. No IP address, device footprint, or complainant credentials are ever associated with the grievance record. Even the hospital superintendent and IT database administrators cannot trace an anonymous submission back to you.',
      category: 'Privacy & Anonymity',
    },
    {
      id: 'faq-2',
      question: 'Why does the hospital use ONE Universal QR Code instead of separate codes?',
      answer:
        'A single universal QR code prevents fragmentation and tampering. You can scan the same QR card located in any clinic, billing counter, ward, or pharmacy. Once opened, you simply select the target department from the interactive dropdown list. This guarantees standardized oversight across the entire medical campus.',
      category: 'System Architecture',
    },
    {
      id: 'faq-3',
      question: 'What is the private tracking token and what if I lose it?',
      answer:
        'Upon submitting your grievance, the portal generates a unique Reference ID (e.g. GRV-2026-...) and a private Tracking Token. Because anonymous grievances do not require an account or password, your secret token is the only key to view live committee progress. Please copy or download your tracking credentials immediately upon confirmation.',
      category: 'Tracking & Security',
    },
    {
      id: 'faq-4',
      question: 'What types of evidence can I attach to support my grievance?',
      answer:
        'You can attach billing receipts, prescription slips, photographic evidence of facility conditions, official forms, or audio/video recordings (up to 10MB per file in JPG, PNG, PDF, or MP4 format). All uploaded evidence is stored in an encrypted hospital vault accessible exclusively to the designated inquiry committee.',
      category: 'Evidence & Verification',
    },
    {
      id: 'faq-5',
      question: 'What happens if a complaint involves corruption, extortion, or staff misconduct?',
      answer:
        'All allegations of extortion, bribery, physical abuse, or professional negligence trigger automatic high-priority escalation. An independent three-member hospital ombudsman committee is convened to review hospital audit logs, duty rosters, and CCTV records before issuing binding corrective findings.',
      category: 'Inquiry & Accountability',
    },
  ];

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  const slaSteps = [
    {
      step: '01',
      title: 'Submission & Intake',
      timeframe: 'Instant (0 hr)',
      desc: 'System registers allegation, issues unique Reference ID and private tracking token.',
      icon: FileCheck,
    },
    {
      step: '02',
      title: 'Triage & Committee Assignment',
      timeframe: 'Under 24 Hours',
      desc: 'Ombudsman desk reviews nature of allegation and assigns an impartial inquiry officer.',
      icon: UserCheck,
    },
    {
      step: '03',
      title: 'Fact-Finding & Evidence Review',
      timeframe: '24 to 48 Hours',
      desc: 'Committee cross-examines clinical duty logs, security records, and witness statements.',
      icon: Scale,
    },
    {
      step: '04',
      title: 'Administrative Redressal & Closure',
      timeframe: 'Target: 72 Hours',
      desc: 'Corrective institutional action is recorded and summary resolution milestone is updated.',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-hospital-600 uppercase tracking-wider bg-hospital-50 border border-hospital-200/60 px-3.5 py-1.5 rounded-full">
          <HelpCircle className="w-4 h-4" />
          <span>Patient & Public Grievance Charter</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          How the Grievance & Accountability System Works
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Designed to ensure complete institutional transparency, eliminate illicit fees or misconduct, and protect complainant identity through ONE Universal QR Code.
        </p>
      </div>

      {/* 4 Stage Architecture */}
      <div className="space-y-6">
        <div className="text-center sm:text-left">
          <span className="text-xs font-bold text-hospital-600 uppercase tracking-wider block mb-1">
            System Workflow
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Four Pillars of Impartial Redressal
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-hospital-50 text-hospital-600 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900">Scan ONE Universal QR Code</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              The hospital deploys exactly one universal QR code across the premises. You don’t need separate codes for OPD, Pharmacy, Emergency, or Billing. After scanning, you simply choose the relevant area from the form dropdown.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900">Anonymous or Identified Submission</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              You can report anonymously if you wish to protect your identity, or optionally provide your contact details so the grievance desk can follow up directly. You never need to create an account or password.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900">Formal Inquiry by Appointed Committee</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Submissions are registered as allegations and assigned to hospital ombudsman committee members. Officers verify records, collect fact-finding findings, and initiate corrective administrative actions.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
              4
            </div>
            <h3 className="text-lg font-bold text-slate-900">Track Progress with Secret Token</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Upon submission, you receive a Reference ID and private tracking token. Only you can track your case milestones without exposing internal private deliberations or sensitive files.
            </p>
          </div>
        </div>
      </div>

      {/* SLA & Turnaround Roadmap */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-hospital-600 uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>Service Level Commitment</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Standard Redressal Timelines & SLAs
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Every submission is tracked through strict time-bound stages to guarantee prompt administrative accountability.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {slaSteps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-hospital-600 font-mono">
                      PHASE {item.step}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-hospital-50 text-hospital-600 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{item.timeframe}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive FAQ Section */}
      <div className="space-y-6">
        <div>
          <span className="text-xs font-bold text-hospital-600 uppercase tracking-wider block mb-1">
            Frequently Asked Questions
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Frequently Asked Questions & Patient Rights
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Common questions regarding anonymous disclosures, investigation committees, and tracking tokens.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-hospital-600 tracking-wider">
                      {faq.category}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">{faq.question}</h3>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500 transition-transform ${
                      isOpen ? 'rotate-180 bg-hospital-50 text-hospital-600' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Safety / Allegation Doctrine Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-hospital-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 space-y-6 shadow-lg">
        <div className="flex items-center gap-2 text-xs font-bold text-hospital-400 uppercase">
          <Shield className="w-4 h-4" />
          <span>Fair & Impartial Review Standards</span>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-bold">
            Presumption of Good Faith & Impartial Investigation
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
            The system strictly separates public allegations from verified administrative findings. Hospital personnel are not declared guilty without impartial fact-finding. Complainants are fiercely protected against reprisal under institutional whistleblower protocols.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Link
            to="/public/report"
            className="inline-flex items-center gap-2 bg-hospital-500 hover:bg-hospital-400 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-colors shadow-sm"
          >
            <FileText className="w-4 h-4" />
            <span>Submit a Grievance Now</span>
          </Link>
          <Link
            to="/public/track"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-colors border border-white/20"
          >
            <Search className="w-4 h-4" />
            <span>Track Existing Grievance</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
