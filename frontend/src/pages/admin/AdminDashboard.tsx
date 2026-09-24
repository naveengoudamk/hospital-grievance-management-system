import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  Download,
  ArrowRight,
  TrendingUp,
  Building2,
  Tags,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { DashboardMetrics } from '../../types';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await adminApi.getDashboard();
        setMetrics(data);
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading || !metrics) {
    return <LoadingSpinner message="Calculating dashboard statistics and case distribution..." />;
  }

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Grievance Administration Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time grievance metrics aggregated from across all hospital units.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={adminApi.exportComplaintsCsvUrl()}
            download
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-hospital-600" />
            <span>Export CSV Report</span>
          </a>
        </div>
      </div>

      {/* 4 Primary Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Submissions"
          value={metrics.totalComplaints}
          subtitle="All recorded grievances"
          icon={Inbox}
          colorScheme="blue"
        />
        <StatCard
          title="New (Unreviewed)"
          value={metrics.newComplaints}
          subtitle="Awaiting preliminary review"
          icon={Clock}
          colorScheme="amber"
        />
        <StatCard
          title="Under Inquiry"
          value={metrics.underInvestigation + metrics.assigned}
          subtitle="Assigned / Fact-finding"
          icon={UserCheck}
          colorScheme="purple"
        />
        <StatCard
          title="Action Taken / Resolved"
          value={metrics.actionTaken + metrics.resolved + metrics.closed}
          subtitle="Inquiries concluded"
          icon={CheckCircle2}
          colorScheme="emerald"
        />
      </div>

      {/* Critical Cases Warning Alert (If Any) */}
      {metrics.criticalCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center flex-shrink-0">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold">
                {metrics.criticalCount} Critical Priority Grievance(s) Requiring Attention
              </h4>
              <p className="text-xs text-red-800 mt-0.5">
                Allegations marked CRITICAL severity (e.g. bribes, medical neglect, acute harassment).
              </p>
            </div>
          </div>
          <Link
            to="/admin/complaints?priority=CRITICAL"
            className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors flex-shrink-0"
          >
            <span>Inspect Critical Cases</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Distribution Analytics: Categories & Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Tags className="w-4 h-4 text-hospital-600" />
              <span>Complaints by Category</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Distribution</span>
          </div>

          <div className="space-y-3">
            {Object.entries(metrics.categoryDistribution).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No category data recorded yet.</p>
            ) : (
              Object.entries(metrics.categoryDistribution).map(([catName, count]) => {
                const pct = metrics.totalComplaints > 0 ? (count / metrics.totalComplaints) * 100 : 0;
                return (
                  <div key={catName} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span className="truncate pr-2">{catName}</span>
                      <span className="text-slate-500 font-mono">
                        {count} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-hospital-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Location Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-hospital-600" />
              <span>Complaints by Hospital Department</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Department Count</span>
          </div>

          <div className="space-y-3">
            {Object.entries(metrics.locationDistribution).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No location data recorded yet.</p>
            ) : (
              Object.entries(metrics.locationDistribution).map(([locName, count]) => {
                const pct = metrics.totalComplaints > 0 ? (count / metrics.totalComplaints) * 100 : 0;
                return (
                  <div key={locName} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span className="truncate pr-2">{locName}</span>
                      <span className="text-slate-500 font-mono">
                        {count} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Recent Complaints Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Grievance Submissions</h3>
            <p className="text-xs text-slate-500 mt-0.5">Latest 10 complaints logged in registry</p>
          </div>
          <Link
            to="/admin/complaints"
            className="text-xs font-bold text-hospital-600 hover:text-hospital-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Reference</th>
                <th className="px-6 py-3.5">Category & Location</th>
                <th className="px-6 py-3.5">Complainant</th>
                <th className="px-6 py-3.5">Priority</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Assigned Officer</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {metrics.recentComplaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    No complaints registered in system yet.
                  </td>
                </tr>
              ) : (
                metrics.recentComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {c.complaintReference}
                    </td>
                    <td className="px-6 py-4">
                      <span className="block font-semibold text-slate-800">{c.categoryName}</span>
                      <span className="block text-[11px] text-slate-400">{c.locationName}</span>
                    </td>
                    <td className="px-6 py-4">
                      {c.isAnonymous ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                          Anonymous
                        </span>
                      ) : (
                        <span className="font-medium text-slate-800">{c.complainantName}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-6 py-4">
                      {c.assignedMemberName ? (
                        <span className="font-semibold text-slate-800">{c.assignedMemberName}</span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/admin/complaints/${c.id}`}
                        className="inline-flex items-center gap-1 font-bold text-hospital-600 hover:text-hospital-800 hover:underline"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
