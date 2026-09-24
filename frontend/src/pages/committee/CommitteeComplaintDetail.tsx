import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  FileCheck,
  CheckCircle2,
  Paperclip,
  Download,
  Upload,
  Clock,
  Building2,
  Tags,
  Calendar,
  AlertTriangle,
  User,
  Save,
  Check,
} from 'lucide-react';
import { committeeApi } from '../../api/committeeApi';
import { ComplaintDetail, InvestigationStatus } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const CommitteeComplaintDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Investigation Form State
  const [summary, setSummary] = useState('');
  const [findings, setFindings] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [invStatus, setInvStatus] = useState<InvestigationStatus>('IN_PROGRESS');

  // Attachment upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const comp = await committeeApi.getComplaintById(Number(id));
      setComplaint(comp);

      // Populate existing investigation if already recorded
      if (comp.investigations && comp.investigations.length > 0) {
        const latest = comp.investigations[comp.investigations.length - 1];
        setSummary(latest.investigationSummary || '');
        setFindings(latest.findings || '');
        setActionTaken(latest.actionTaken || '');
        setInvStatus(latest.investigationStatus || 'IN_PROGRESS');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Access denied or case file not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleSaveInvestigation = async (complete: boolean = false) => {
    if (!complaint) return;
    if (!summary.trim()) {
      alert('Please provide an Investigation Summary before saving.');
      return;
    }
    if (complete && (!findings.trim() || !actionTaken.trim())) {
      alert('To complete the investigation, please record verified Fact-Finding Findings and Corrective Action Taken.');
      return;
    }

    setSaving(true);
    try {
      await committeeApi.recordInvestigation(complaint.id, {
        investigationSummary: summary.trim(),
        findings: findings.trim() || undefined,
        actionTaken: actionTaken.trim() || undefined,
        status: complete ? 'COMPLETED' : invStatus,
        completeInvestigation: complete,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save investigation details.');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !uploadFile) return;

    setUploading(true);
    try {
      await committeeApi.uploadAttachment(complaint.id, uploadFile);
      setUploadFile(null);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload evidence file.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Opening case investigation dossier..." />;
  if (errorMsg || !complaint) {
    return (
      <div className="p-8 text-center text-slate-500">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900">Access Restricted</h3>
        <p className="text-xs text-slate-500 mt-1">{errorMsg}</p>
        <Link
          to="/committee/complaints"
          className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold text-teal-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assigned Cases</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/committee/complaints"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Assigned Cases</span>
        </Link>
      </div>

      {/* Case Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Grievance Investigation Dossier</span>
            <h1 className="text-2xl sm:text-3xl font-mono font-extrabold text-slate-900 mt-0.5">
              {complaint.complaintReference}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <PriorityBadge priority={complaint.priority} />
            <StatusBadge status={complaint.status} size="lg" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Category</span>
            <span className="font-semibold text-slate-800 block mt-0.5">{complaint.categoryName}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Hospital Department</span>
            <span className="font-semibold text-slate-800 block mt-0.5">{complaint.locationName}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Complainant</span>
            <span className="font-semibold text-slate-800 block mt-0.5">
              {complaint.isAnonymous ? 'Anonymous' : complaint.complainantName}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Incident Date</span>
            <span className="font-semibold text-slate-800 block mt-0.5">
              {complaint.incidentDate ? new Date(complaint.incidentDate).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Allegation & Evidence; Right = Official Investigation Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 cols): Reported Issue Statement */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-hospital-500"></span>
              <span>Reported Allegation</span>
            </div>
            
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
              {complaint.description}
            </p>

            {/* Evidence Files */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-hospital-500" />
                <span>Supporting Files ({complaint.attachments.length})</span>
              </h4>

              {complaint.attachments.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No attachments submitted with complaint.</p>
              ) : (
                <div className="space-y-2">
                  {complaint.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    >
                      <span className="font-semibold text-slate-800 truncate pr-2">{att.originalFileName}</span>
                      <a
                        href={att.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-hospital-600 hover:text-hospital-800 bg-white border border-slate-200 px-2.5 py-1 rounded shadow-2xs flex-shrink-0"
                      >
                        <Download className="w-3 h-3" />
                        <span>View</span>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upload Additional Investigation Evidence */}
            <form onSubmit={handleUploadEvidence} className="pt-4 border-t border-slate-100 space-y-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase">
                Add Inquiry Document / Photo
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                  className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                />
                <button
                  type="submit"
                  disabled={!uploadFile || uploading}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-50 transition-colors flex-shrink-0"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column (7 cols): Investigation Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                <span>Committee Fact-Finding Workspace</span>
              </div>

              {saveSuccess && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full animate-fade-in">
                  <Check className="w-3.5 h-3.5" />
                  <span>Inquiry Updated Successfully</span>
                </span>
              )}
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  1. Investigation Summary & Scope <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Outline the steps taken (e.g. interviewed nurse supervisor on duty, checked CCTV footage, reviewed cashier billing register)..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  2. Verified Findings & Assessment
                </label>
                <textarea
                  rows={3}
                  value={findings}
                  onChange={(e) => setFindings(e.target.value)}
                  placeholder="State confirmed factual findings, witness statements, or procedural gaps identified during inquiry..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  3. Corrective & Administrative Action Taken
                </label>
                <textarea
                  rows={3}
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  placeholder="Specific actions enforced (e.g. refund issued, staff reprimanded/re-trained, sanitation schedule updated, duty roster re-assigned)..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Investigation Status
                </label>
                <select
                  value={invStatus}
                  onChange={(e) => setInvStatus(e.target.value as InvestigationStatus)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800"
                >
                  <option value="IN_PROGRESS">IN PROGRESS (Under Ongoing Inquiry)</option>
                  <option value="COMPLETED">COMPLETED (Findings Finalized)</option>
                </select>
              </div>
            </div>

            {/* Inquiry Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => handleSaveInvestigation(false)}
                disabled={saving}
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Draft Investigation'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveInvestigation(true)}
                disabled={saving}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                <FileCheck className="w-4 h-4" />
                <span>Complete Inquiry & Record Action</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
