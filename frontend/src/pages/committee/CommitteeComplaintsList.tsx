import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  FileCheck,
  X,
} from 'lucide-react';
import { committeeApi } from '../../api/committeeApi';
import { ComplaintSummary, PagedResponse } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';

export const CommitteeComplaintsList: React.FC = () => {
  const [complaintsData, setComplaintsData] = useState<PagedResponse<ComplaintSummary> | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(0);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await committeeApi.getAssignedComplaints({
        status: status || undefined,
        priority: priority || undefined,
        search: search.trim() || undefined,
        page,
        size: 10,
      });
      setComplaintsData(data);
    } catch (err) {
      console.error('Failed to load assigned complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, status, priority]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadData();
  };

  const handleReset = () => {
    setSearch('');
    setStatus('');
    setPriority('');
    setPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          My Assigned Grievance Caseload
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Conduct investigation, verify clinical & administrative records, and submit findings.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference ID or complaint keywords..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button
            type="submit"
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl"
          >
            Search
          </button>
        </form>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(0);
          }}
          className="w-full sm:w-44 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700"
        >
          <option value="">All Statuses</option>
          <option value="ASSIGNED">ASSIGNED (Pending)</option>
          <option value="INVESTIGATION">IN PROGRESS</option>
          <option value="ACTION_TAKEN">ACTION TAKEN</option>
          <option value="RESOLVED">RESOLVED</option>
        </select>

        <select
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value);
            setPage(0);
          }}
          className="w-full sm:w-36 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700"
        >
          <option value="">All Priorities</option>
          <option value="CRITICAL">CRITICAL</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>

        {(search || status || priority) && (
          <button
            onClick={handleReset}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl border border-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Retrieving your assigned case files..." />
        ) : !complaintsData || complaintsData.content.length === 0 ? (
          <EmptyState
            title="No Assigned Cases"
            description="You do not have any active grievance cases matching these criteria."
            actionText="Reset Filters"
            onAction={handleReset}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Reference</th>
                    <th className="px-6 py-3.5">Category & Location</th>
                    <th className="px-6 py-3.5">Priority</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Complainant</th>
                    <th className="px-6 py-3.5">Submitted</th>
                    <th className="px-6 py-3.5 text-right">Inquiry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {complaintsData.content.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">
                        {c.complaintReference}
                      </td>
                      <td className="px-6 py-4">
                        <span className="block font-semibold text-slate-800">{c.categoryName}</span>
                        <span className="block text-[11px] text-slate-400">{c.locationName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-6 py-4">
                        {c.isAnonymous ? (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">
                            Anonymous
                          </span>
                        ) : (
                          <span className="font-semibold text-slate-800">{c.complainantName}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(c.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/committee/complaints/${c.id}`}
                          className="inline-flex items-center gap-1 font-bold text-teal-600 hover:text-teal-800 hover:underline"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>Open Dossier</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Showing {complaintsData.content.length} of {complaintsData.totalElements} assigned cases</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={complaintsData.first}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-semibold text-slate-800">
                  Page {complaintsData.page + 1} of {complaintsData.totalPages || 1}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={complaintsData.last}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
