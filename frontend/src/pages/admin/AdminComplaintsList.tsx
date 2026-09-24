import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Inbox,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Calendar,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { publicApi } from '../../api/publicApi';
import { Category, ComplaintSummary, ComplaintStatus, LocationItem, PagedResponse, Priority } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';

export const AdminComplaintsList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [complaintsData, setComplaintsData] = useState<PagedResponse<ComplaintSummary> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState<string>(searchParams.get('status') || '');
  const [priority, setPriority] = useState<string>(searchParams.get('priority') || '');
  const [categoryId, setCategoryId] = useState<string>(searchParams.get('categoryId') || '');
  const [locationId, setLocationId] = useState<string>(searchParams.get('locationId') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 0);
  const [pageSize, setPageSize] = useState(10);

  const loadData = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        size: pageSize,
      };
      if (status) params.status = status;
      if (priority) params.priority = priority;
      if (categoryId) params.categoryId = Number(categoryId);
      if (locationId) params.locationId = Number(locationId);
      if (search.trim()) params.search = search.trim();

      const [res, cats, locs] = await Promise.all([
        adminApi.getComplaints(params),
        categories.length === 0 ? publicApi.getCategories() : Promise.resolve(categories),
        locations.length === 0 ? publicApi.getLocations() : Promise.resolve(locations),
      ]);

      setComplaintsData(res);
      if (categories.length === 0) setCategories(cats);
      if (locations.length === 0) setLocations(locs);
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, pageSize, status, priority, categoryId, locationId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadData();
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setPriority('');
    setCategoryId('');
    setLocationId('');
    setPage(0);
  };

  const exportUrl = adminApi.exportComplaintsCsvUrl({
    status: status || undefined,
    priority: priority || undefined,
    categoryId: categoryId || undefined,
    locationId: locationId || undefined,
    search: search.trim() || undefined,
  });

  return (
    <div className="space-y-6">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Grievance Case Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Search, filter, assign, and manage institutional complaints across all hospital units.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={exportUrl}
            download
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-hospital-400" />
            <span>Export Filtered CSV</span>
          </a>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Reference ID, Complainant Name, or keyword..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-500 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto bg-hospital-600 hover:bg-hospital-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors flex-shrink-0"
          >
            Search
          </button>
          {(status || priority || categoryId || locationId || search) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1 text-slate-500 hover:text-slate-800 text-xs px-3 py-2 rounded-xl border border-slate-200 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </form>

        {/* Filter Dropdowns Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(0);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="SUBMITTED">SUBMITTED (New)</option>
              <option value="UNDER_REVIEW">UNDER REVIEW</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="INVESTIGATION">INVESTIGATION</option>
              <option value="ACTION_TAKEN">ACTION TAKEN</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setPage(0);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700"
            >
              <option value="">All Priorities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setPage(0);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Location</label>
            <select
              value={locationId}
              onChange={(e) => {
                setLocationId(e.target.value);
                setPage(0);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700"
            >
              <option value="">All Locations</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Filtering grievance registry records..." />
        ) : !complaintsData || complaintsData.content.length === 0 ? (
          <EmptyState
            title="No Grievance Records Found"
            description="No complaint matches the specified filters. Try adjusting search terms or clearing selected criteria."
            actionText="Clear All Filters"
            onAction={handleResetFilters}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">Reference</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Hospital Area</th>
                    <th className="px-5 py-3.5">Priority</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Complainant</th>
                    <th className="px-5 py-3.5">Assigned Officer</th>
                    <th className="px-5 py-3.5">Submitted</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {complaintsData.content.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-slate-900">
                        {c.complaintReference}
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-800 max-w-[160px] truncate">
                        {c.categoryName}
                      </td>
                      <td className="px-5 py-4 text-slate-600 max-w-[140px] truncate">
                        {c.locationName}
                      </td>
                      <td className="px-5 py-4">
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-5 py-4">
                        {c.isAnonymous ? (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">
                            Anonymous
                          </span>
                        ) : (
                          <span className="font-semibold text-slate-800">{c.complainantName}</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {c.assignedMemberName ? (
                          <span className="font-medium text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            {c.assignedMemberName}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                        {new Date(c.submittedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/admin/complaints/${c.id}`}
                          className="inline-flex items-center gap-1 font-bold text-hospital-600 hover:text-hospital-800 hover:underline"
                        >
                          <span>Manage</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <span>
                Showing <strong>{complaintsData.page * complaintsData.size + 1}</strong> to{' '}
                <strong>
                  {Math.min((complaintsData.page + 1) * complaintsData.size, complaintsData.totalElements)}
                </strong>{' '}
                of <strong>{complaintsData.totalElements}</strong> complaints
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={complaintsData.first}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 font-semibold text-slate-800">
                  Page {complaintsData.page + 1} of {complaintsData.totalPages || 1}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={complaintsData.last}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
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
