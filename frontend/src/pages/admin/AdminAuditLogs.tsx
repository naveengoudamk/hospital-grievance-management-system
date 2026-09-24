import React, { useState, useEffect } from 'react';
import { History, Search, Filter, ChevronLeft, ChevronRight, X, ShieldAlert } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { AuditAction, AuditLog, PagedResponse } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const AdminAuditLogs: React.FC = () => {
  const [logsData, setLogsData] = useState<PagedResponse<AuditLog> | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [action, setAction] = useState<string>('');
  const [username, setUsername] = useState('');
  const [entityType, setEntityType] = useState('');
  const [page, setPage] = useState(0);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAuditLogs({
        action: action || undefined,
        username: username.trim() || undefined,
        entityType: entityType.trim() || undefined,
        page,
        size: 20,
      });
      setLogsData(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page, action]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadLogs();
  };

  const handleReset = () => {
    setAction('');
    setUsername('');
    setEntityType('');
    setPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          System Audit Trail & Compliance Log
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Immutable records of user authentications, case assignments, status changes, and administrative actions.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Filter by operator username or client IP..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-500"
            />
          </div>

          <select
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(0);
            }}
            className="w-full sm:w-56 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700"
          >
            <option value="">All Audit Actions</option>
            <option value="LOGIN_SUCCESS">LOGIN SUCCESS</option>
            <option value="LOGIN_FAILED">LOGIN FAILED</option>
            <option value="COMPLAINT_SUBMITTED">COMPLAINT SUBMITTED</option>
            <option value="COMPLAINT_ASSIGNED">COMPLAINT ASSIGNED</option>
            <option value="STATUS_CHANGED">STATUS CHANGED</option>
            <option value="PRIORITY_CHANGED">PRIORITY CHANGED</option>
            <option value="INVESTIGATION_UPDATED">INVESTIGATION UPDATED</option>
            <option value="INVESTIGATION_COMPLETED">INVESTIGATION COMPLETED</option>
            <option value="USER_CREATED">USER CREATED</option>
            <option value="USER_DISABLED">USER DISABLED</option>
            <option value="QR_GENERATED">QR GENERATED</option>
            <option value="DATA_EXPORTED">DATA EXPORTED</option>
          </select>

          <button
            type="submit"
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2 rounded-xl transition-colors"
          >
            Filter
          </button>

          {(action || username || entityType) && (
            <button
              type="button"
              onClick={handleReset}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl border border-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Querying immutable audit records..." />
        ) : !logsData || logsData.content.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">No audit logs matching search filters.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">Timestamp</th>
                    <th className="px-5 py-3.5">User / Operator</th>
                    <th className="px-5 py-3.5">Action</th>
                    <th className="px-5 py-3.5">Entity & ID</th>
                    <th className="px-5 py-3.5">Activity Details</th>
                    <th className="px-5 py-3.5 text-right">Client IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[11px]">
                  {logsData.content.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {log.username || 'ANONYMOUS'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold text-[10px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {log.entityType ? `${log.entityType} (${log.entityId || 'N/A'})` : 'N/A'}
                      </td>
                      <td className="px-5 py-3.5 font-sans text-xs text-slate-700 max-w-sm truncate">
                        {log.newValue || log.oldValue || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right text-slate-400">
                        {log.ipAddress || '127.0.0.1'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Showing {logsData.content.length} of {logsData.totalElements} audit entries</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={logsData.first}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-semibold text-slate-800">
                  Page {logsData.page + 1} of {logsData.totalPages || 1}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={logsData.last}
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
