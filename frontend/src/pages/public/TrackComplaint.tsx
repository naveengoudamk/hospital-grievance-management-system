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
} from 'lucide-react';
import { publicApi } from '../../api/publicApi';
import { TrackComplaintResponse } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { TimelineProgress } from '../../components/TimelineProgress';

export const TrackComplaint: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [reference, setReference] = useState(searchParams.get('ref') || '');
  const [token, setToken] = useState(searchParams.get('token') || '');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [data, setData] = useState<TrackComplaintResponse | null>(null);

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setData(null);

    if (!reference.trim() || !token.trim()) {
      setErrorMsg('Please enter both the Complaint Reference Number and your Tracking Token.');
      return;
    }

    setLoading(true);
    try {
      const res = await publicApi.trackComplaint(reference.trim(), token.trim());
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

  useEffect(() => {
    if (searchParams.get('ref') && searchParams.get('token')) {
      handleTrack();
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
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
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
                placeholder="e.g. HGS-2026-100234"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-hospital-500 focus:bg-white transition-all"
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
                placeholder="16-character token provided at submission"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-hospital-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-sm transition-colors disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Locating Record...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-hospital-400" />
                  <span>Check Status Timeline</span>
                </>
              )}
            </button>
          </div>
        </form>
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
        <div className="space-y-6 animate-fade-in">
          {/* Summary Status Header Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Complaint Reference</span>
                <h3 className="text-xl sm:text-2xl font-mono font-extrabold text-slate-900 mt-0.5">
                  {data.complaintReference}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={data.currentStatus} size="lg" />
              </div>
            </div>

            {/* Official Safe Status Message Box */}
            <div className="mt-6 p-4 rounded-2xl bg-hospital-50/80 border border-hospital-100 text-hospital-900 text-xs sm:text-sm leading-relaxed">
              <div className="flex items-center gap-2 font-bold mb-1 text-hospital-950">
                <ShieldCheck className="w-4 h-4 text-hospital-600" />
                <span>Current Stage Update:</span>
              </div>
              <p>{data.statusMessage}</p>
            </div>

            {/* Key Information Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Category</span>
                <span className="font-semibold text-slate-800 truncate block mt-0.5">{data.categoryName}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Hospital Area</span>
                <span className="font-semibold text-slate-800 truncate block mt-0.5">{data.locationName}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Submitted At</span>
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
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-hospital-600" />
              <span>Grievance Redressal Milestone Timeline</span>
            </h3>

            <TimelineProgress steps={data.timeline} />
          </div>

          {/* Confidentiality Notice */}
          <div className="p-4 rounded-2xl bg-slate-100/70 border border-slate-200 text-center text-xs text-slate-500">
            🔒 <strong>Confidentiality Assurance:</strong> For impartial justice and patient safety, internal investigator names, investigative notes, and private staff records are protected.
          </div>
        </div>
      )}
    </div>
  );
};
