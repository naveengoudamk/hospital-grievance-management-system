import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  UserCheck,
  Shield,
  Clock,
  Tags,
  Building2,
  Calendar,
  Paperclip,
  Download,
  AlertCircle,
  CheckCircle2,
  History,
  FileCheck,
  MessageSquare,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { ComplaintDetail, ComplaintStatus, Priority, User as UserType } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Modal } from '../../components/Modal';

export const AdminComplaintDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [committeeMembers, setCommitteeMembers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | ''>('');
  const [assignRemarks, setAssignRemarks] = useState('');

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus>('UNDER_REVIEW');
  const [statusRemarks, setStatusRemarks] = useState('');

  const [priorityModalOpen, setPriorityModalOpen] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<Priority>('MEDIUM');
  const [priorityRemarks, setPriorityRemarks] = useState('');

  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [comp, members] = await Promise.all([
        adminApi.getComplaintById(Number(id)),
        adminApi.getCommitteeMembers(),
      ]);
      setComplaint(comp);
      setCommitteeMembers(members);
      setSelectedStatus(comp.status);
      setSelectedPriority(comp.priority);
      if (members.length > 0) setSelectedMemberId(members[0].id);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !selectedMemberId) return;
    setActionLoading(true);
    try {
      const updated = await adminApi.assignComplaint(complaint.id, Number(selectedMemberId), assignRemarks);
      setComplaint(updated);
      setAssignModalOpen(false);
      setAssignRemarks('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to assign complaint.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;
    setActionLoading(true);
    try {
      const updated = await adminApi.updateStatus(complaint.id, selectedStatus, statusRemarks);
      setComplaint(updated);
      setStatusModalOpen(false);
      setStatusRemarks('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePriority = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;
    setActionLoading(true);
    try {
      const updated = await adminApi.updatePriority(complaint.id, selectedPriority, priorityRemarks);
      setComplaint(updated);
      setPriorityModalOpen(false);
      setPriorityRemarks('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update priority.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Retrieving complaint case file..." />;
  if (errorMsg || !complaint) {
    return (
      <div className="p-8 text-center text-slate-500">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900">Case Record Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">{errorMsg}</p>
        <Link
          to="/admin/complaints"
          className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold text-hospital-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Complaints</span>
        </Link>
      </div>
    );
  }

  const activeAssignment = complaint.assignments.find((a) => a.active);
  const latestInvestigation = complaint.investigations.length > 0 ? complaint.investigations[complaint.investigations.length - 1] : null;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/admin/complaints"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Complaints List</span>
        </Link>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setAssignModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-colors"
          >
            <UserCheck className="w-4 h-4" />
            <span>{activeAssignment ? 'Reassign Committee' : 'Assign Committee'}</span>
          </button>

          <button
            onClick={() => setPriorityModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-colors"
          >
            <AlertCircle className="w-4 h-4 text-hospital-600" />
            <span>Change Priority</span>
          </button>

          <button
            onClick={() => setStatusModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-colors"
          >
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span>Update Status</span>
          </button>
        </div>
      </div>

      {/* Case Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Institutional Registry Case</span>
              <span className="text-slate-300">•</span>
              <span className="text-[10px] font-semibold text-hospital-600">{complaint.hospitalName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-mono font-extrabold text-slate-900">
              {complaint.complaintReference}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <PriorityBadge priority={complaint.priority} />
            <StatusBadge status={complaint.status} size="lg" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Category</span>
            <span className="font-semibold text-slate-800 block mt-0.5">{complaint.categoryName}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Hospital Area</span>
            <span className="font-semibold text-slate-800 block mt-0.5">{complaint.locationName}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Incident Date</span>
            <span className="font-semibold text-slate-800 block mt-0.5">
              {complaint.incidentDate ? new Date(complaint.incidentDate).toLocaleString() : 'Not Specified'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Submitted At</span>
            <span className="font-semibold text-slate-800 block mt-0.5">
              {new Date(complaint.submittedAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Public Reported Information; Right = Internal Inquiry & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Public Grievance Content & Complainant Info */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Grievance Statement */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-hospital-500"></span>
              <span>Complainant Reported Allegation</span>
            </div>
            <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70">
              {complaint.description}
            </p>

            {/* Evidence Attachments */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-hospital-500" />
                <span>Uploaded Evidence Files ({complaint.attachments.length})</span>
              </h4>

              {complaint.attachments.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No supporting documents or images attached.</p>
              ) : (
                <div className="space-y-2">
                  {complaint.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    >
                      <div className="truncate pr-2">
                        <span className="font-semibold text-slate-800 block truncate">{att.originalFileName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {(att.fileSize / 1024 / 1024).toFixed(2)} MB • {att.fileType}
                        </span>
                      </div>
                      <a
                        href={att.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-hospital-600 hover:text-hospital-800 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs flex-shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>View / Download</span>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Complainant Profile (Identified vs Anonymous) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Complainant Information</h3>
              {complaint.isAnonymous ? (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                  100% Anonymous Filing
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase">
                  Identified Citizen
                </span>
              )}
            </div>

            {complaint.isAnonymous ? (
              <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                The complainant opted for strict anonymity. No personal identity, contact numbers, or email were collected.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Full Name</span>
                  <span className="font-semibold text-slate-800">{complaint.complainantName}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Phone</span>
                  <span className="font-semibold text-slate-800">{complaint.complainantPhone || 'N/A'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Email</span>
                  <span className="font-semibold text-slate-800">{complaint.complainantEmail || 'N/A'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Preferred Contact</span>
                  <span className="font-semibold text-slate-800">{complaint.preferredContactMethod || 'PHONE'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Audit Logs for this Complaint */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <History className="w-4 h-4 text-hospital-600" />
              <span>Immutable Audit Trail</span>
            </h3>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 text-xs">
              {complaint.auditLogs.length === 0 ? (
                <p className="text-slate-400 text-xs">No audit records logged for this case.</p>
              ) : (
                complaint.auditLogs.map((log) => (
                  <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-800 block">{log.action.replace(/_/g, ' ')}</span>
                      <span className="text-[11px] text-slate-500">{log.newValue || log.oldValue || 'Action logged'}</span>
                    </div>
                    <div className="text-right text-[10px] text-slate-400 flex-shrink-0">
                      <span className="font-semibold text-slate-600 block">{log.username || 'System'}</span>
                      <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column (5 cols): Internal Review, Assignment & Committee Findings */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Committee Assignment Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-purple-600" />
                <span>Assigned Committee Member</span>
              </h3>
            </div>

            {activeAssignment ? (
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-purple-950">{activeAssignment.committeeMemberName}</span>
                  <span className="text-[10px] font-bold bg-purple-200/80 text-purple-900 px-2 py-0.5 rounded uppercase">
                    Active
                  </span>
                </div>
                <p className="text-purple-800">{activeAssignment.committeeMemberEmail}</p>
                {activeAssignment.remarks && (
                  <p className="text-[11px] text-purple-900 italic pt-1 border-t border-purple-200/60">
                    Assignment Instructions: "{activeAssignment.remarks}"
                  </p>
                )}
                <span className="block text-[10px] text-purple-600">
                  Assigned by {activeAssignment.assignedByName} on {new Date(activeAssignment.assignedAt).toLocaleString()}
                </span>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 space-y-2">
                <p>No committee member currently assigned to lead this inquiry.</p>
                <button
                  onClick={() => setAssignModalOpen(true)}
                  className="inline-flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-xs transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Assign Officer</span>
                </button>
              </div>
            )}
          </div>

          {/* Committee Investigation Findings Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-teal-600" />
              <span>Inquiry Findings & Action Taken</span>
            </h3>

            {latestInvestigation ? (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Investigation Summary</span>
                  <p className="text-slate-800 mt-1 leading-relaxed">{latestInvestigation.investigationSummary}</p>
                </div>

                {latestInvestigation.findings && (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Verified Findings</span>
                    <p className="text-slate-800 mt-1 leading-relaxed">{latestInvestigation.findings}</p>
                  </div>
                )}

                {latestInvestigation.actionTaken && (
                  <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">Corrective Action Initiated</span>
                    <p className="text-emerald-950 mt-1 leading-relaxed font-medium">{latestInvestigation.actionTaken}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>Investigator: {latestInvestigation.investigatorName}</span>
                  <span>Status: <strong>{latestInvestigation.investigationStatus}</strong></span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl border border-slate-100">
                Inquiry findings have not been filed by the assigned officer yet.
              </p>
            )}
          </div>

          {/* Status Change History Timeline */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-hospital-600" />
              <span>Internal Status Progression</span>
            </h3>

            <div className="space-y-3 relative pl-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 text-xs">
              {complaint.statusHistories.map((h, i) => (
                <div key={h.id || i} className="relative pl-3">
                  <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-hospital-600 border border-white"></div>
                  <div className="flex items-center justify-between">
                    <StatusBadge status={h.newStatus} />
                    <span className="text-[10px] text-slate-400">{new Date(h.changedAt).toLocaleTimeString()}</span>
                  </div>
                  {h.remarks && <p className="text-[11px] text-slate-600 mt-1">{h.remarks}</p>}
                  <span className="block text-[10px] text-slate-400 mt-0.5">By {h.changedBy || 'Admin'}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ASSIGN MODAL */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Complaint to Committee Member"
        subtitle={`Case: ${complaint.complaintReference}`}
      >
        <form onSubmit={handleAssign} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1.5">Select Committee Officer</label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(Number(e.target.value))}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
            >
              {committeeMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName} ({m.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1.5">Inquiry Remarks & Directives (Optional)</label>
            <textarea
              rows={3}
              value={assignRemarks}
              onChange={(e) => setAssignRemarks(e.target.value)}
              placeholder="e.g. Please verify pharmacy dispensing log for batch #2041 and submit findings within 48h."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAssignModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
            >
              {actionLoading ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* STATUS UPDATE MODAL */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Case Status"
        subtitle={`Current Status: ${complaint.status}`}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1.5">New Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ComplaintStatus)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
            >
              <option value="UNDER_REVIEW">UNDER REVIEW</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="INVESTIGATION">INVESTIGATION</option>
              <option value="ACTION_TAKEN">ACTION TAKEN</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="REJECTED">REJECTED (Inadmissible)</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1.5">Status Transition Remarks</label>
            <textarea
              rows={3}
              value={statusRemarks}
              onChange={(e) => setStatusRemarks(e.target.value)}
              placeholder="Reason or summary of administrative decision..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStatusModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
            >
              {actionLoading ? 'Updating...' : 'Save Status Change'}
            </button>
          </div>
        </form>
      </Modal>

      {/* PRIORITY MODAL */}
      <Modal
        isOpen={priorityModalOpen}
        onClose={() => setPriorityModalOpen(false)}
        title="Change Complaint Priority"
        subtitle={`Current Priority: ${complaint.priority}`}
      >
        <form onSubmit={handleUpdatePriority} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1.5">Select Priority</label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as Priority)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1.5">Priority Justification / Remarks</label>
            <textarea
              rows={3}
              value={priorityRemarks}
              onChange={(e) => setPriorityRemarks(e.target.value)}
              placeholder="e.g. Escalated due to patient safety hazard..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setPriorityModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 rounded-xl bg-hospital-600 hover:bg-hospital-700 text-white font-bold"
            >
              {actionLoading ? 'Updating...' : 'Save Priority'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
