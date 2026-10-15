import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Lock,
  Calendar,
  Building2,
  Tags,
  FileCheck,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Paperclip,
  Sparkles,
  Printer,
  Copy,
  Check,
  Star,
  ThumbsUp,
} from 'lucide-react';
import { publicApi } from '../../api/publicApi';
import { TrackComplaintResponse } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { TimelineProgress } from '../../components/TimelineProgress';

const DEMO_CASES = [
  { ref: 'HGS-2026-001042', token: 'CARE-TRACK-2026', title: 'Emergency Triage Delay', tag: 'Assigned', badge: 'bg-indigo-100 text-indigo-800' },
  { ref: 'HGS-2026-001088', token: 'BILL-AUDIT-9921', title: 'Billing Dispute Audit', tag: 'In Investigation', badge: 'bg-purple-100 text-purple-800' },
  { ref: 'HGS-2026-001105', token: 'CLEAN-WARD-4412', title: 'Ward 3B Sanitization', tag: 'Resolved', badge: 'bg-emerald-100 text-emerald-800' },
  { ref: 'HGS-2026-001150', token: 'SAFE-ICU-8833', title: 'ICU Security Breach', tag: 'Under Review', badge: 'bg-amber-100 text-amber-800' },
];

export const TrackComplaint: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [reference, setReference] = useState(searchParams.get('ref') || '');
  const [token, setToken] = useState(searchParams.get('token') || '');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [data, setData] = useState<TrackComplaintResponse | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // Resolution feedback state
  const [rating, setRating] = useState<number>(5);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const queryRecord = async (targetRef: string, targetToken: string) => {
    setErrorMsg(null);
    setData(null);
    setLoading(true);

    try {
      const res = await publicApi.trackComplaint(targetRef.trim(), targetToken.trim());
      setData(res);
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message ||
          'No grievance record found with the provided Reference Number and Tracking Token. Please verify your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!reference.trim() || !token.trim()) {
      setErrorMsg('Please enter both the Complaint Reference Number and your Tracking Token.');
      return;
    }
    await queryRecord(reference, token);
  };

  const handleDemoSelect = (demoRef: string, demoToken: string) => {
    setReference(demoRef);
    setToken(demoToken);
    queryRecord(demoRef, demoToken);
  };

  const copyToClipboard = (text: string, type: 'ref' | 'token') => {
    navigator.clipboard.writeText(text);
    if (type === 'ref') {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    } else {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  useEffect(() => {
    if (searchParams.get('ref') && searchParams.get('token')) {
      queryRecord(searchParams.get('ref')!, searchParams.get('token')!);
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-hospital-600 uppercase tracking-wider mb-1">
          <Search className="w-4 h-4" />
          <span>Public Grievance Tracker</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Track Your Complaint Status
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Enter your reference number and secure tracking token to view the latest administrative review and fact-finding milestones.
        </p>
      </div>

      {/* Tracker Input Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleTrack} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Complaint Reference Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value.toUpperCase())}
                placeholder="e.g. HGS-2026-001042"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 placeholder:font-sans focus:outline-hidden focus:ring-2 focus:ring-hospital-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Secret Tracking Token <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="e.g. CARE-TRACK-2026"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 placeholder:font-sans focus:outline-hidden focus:ring-2 focus:ring-hospital-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-sm transition-all hover:scale-[1.01] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Locating Hospital Record...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-hospital-400" />
                  <span>Check Status Timeline</span>
                </>
              )}
            </button>

            {data && (
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl border border-slate-200 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Slip</span>
              </button>
            )}
          </div>
        </form>

        {/* Demo Cases Fast Selector */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-hospital-500" />
            <span>Interactive Demo Cases (Click to Test Live Tracking):</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DEMO_CASES.map((demo) => (
              <button
                key={demo.ref}
                type="button"
                onClick={() => handleDemoSelect(demo.ref, demo.token)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-hospital-50/70 border border-slate-200/80 hover:border-hospital-200 text-left transition-all group"
              >
                <div>
                  <span className="block text-xs font-bold text-slate-900 group-hover:text-hospital-800">
                    {demo.title}
                  </span>
                  <span className="block text-[11px] font-mono text-slate-500">
                    {demo.ref}
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${demo.badge}`}>
                  {demo.tag}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Verification Notice:</strong>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* RESULT CONTAINER */}
      {data && (
        <div className="space-y-6 animate-fade-in print-area">
          {/* Summary Status Header Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Official Grievance Reference</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <h3 className="text-xl sm:text-2xl font-mono font-extrabold text-slate-900">
                    {data.complaintReference}
                  </h3>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(data.complaintReference, 'ref')}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Copy Reference"
                  >
                    {copiedRef ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={data.currentStatus} size="lg" />
              </div>
            </div>

            {/* Official Safe Status Message Box */}
            <div className="mt-6 p-4.5 rounded-2xl bg-hospital-50/80 border border-hospital-100 text-hospital-900 text-xs sm:text-sm leading-relaxed">
              <div className="flex items-center gap-2 font-bold mb-1 text-hospital-950">
                <ShieldCheck className="w-4 h-4 text-hospital-600" />
                <span>Current Stage Update:</span>
              </div>
              <p>{data.statusMessage}</p>
            </div>

            {/* Key Information Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Grievance Category</span>
                <span className="font-semibold text-slate-800 truncate block mt-0.5">{data.categoryName}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Hospital Area</span>
                <span className="font-semibold text-slate-800 truncate block mt-0.5">{data.locationName}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Registration Date</span>
                <span className="font-semibold text-slate-800 block mt-0.5">
                  {new Date(data.submittedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Evidence Files</span>
                <span className="font-semibold text-slate-800 block mt-0.5">
                  {data.attachmentCount > 0 ? `${data.attachmentCount} File(s) Attached` : 'No Attachments'}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Timeline Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
            <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-hospital-600" />
              <span>Grievance Redressal Milestone Timeline</span>
            </h3>

            <TimelineProgress steps={data.timeline} />
          </div>

          {/* Resolution Satisfaction Rating (if resolved) */}
          {data.currentStatus === 'RESOLVED' && (
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-3xl p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
                  <ThumbsUp className="w-5 h-5" />
                </div>
                <div className="space-y-3 flex-1">
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950">Resolution Redressal Satisfaction</h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      How satisfied are you with the hospital administration's resolution of this grievance?
                    </p>
                  </div>

                  {!feedbackSubmitted ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="p-1 text-amber-400 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`w-5 h-5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                            />
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setFeedbackSubmitted(true)}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors"
                      >
                        Submit Feedback
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-white/80 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Thank you! Your feedback has been recorded in the patient satisfaction ledger.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Confidentiality Notice */}
          <div className="p-4 rounded-2xl bg-slate-100/70 border border-slate-200 text-center text-xs text-slate-500">
            🔒 <strong>Confidentiality Assurance:</strong> For impartial justice and patient safety, internal investigator names, investigative notes, and private staff records are protected under Healthcare Ombudsman Policy.
          </div>
        </div>
      )}
    </div>
  );
};
