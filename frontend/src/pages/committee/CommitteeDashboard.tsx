import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  FileCheck,
} from 'lucide-react';
import { committeeApi } from '../../api/committeeApi';
import { ComplaintSummary } from '../../types';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const CommitteeDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await committeeApi.getDashboard();
        setMetrics(data);
      } catch (err) {
        console.error('Failed to load committee dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading || !metrics) {
    return <LoadingSpinner message="Loading your assigned inquiry caseload..." />;
  }

  const recentCases: ComplaintSummary[] = metrics.recentAssigned || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">
          <Shield className="w-4 h-4" />
          <span>Grievance Inquiry Workspace</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Committee Investigator Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Review assigned patient and visitor complaints, record verified findings, and log corrective actions.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Assigned Cases"
          value={metrics.totalAssigned || 0}
          subtitle="Total cases on your desk"
          icon={ClipboardList}
          colorScheme="indigo"
        />
        <StatCard
          title="Active Inquiries"
          value={metrics.inProgress || 0}
          subtitle="Fact-finding in progress"
          icon={Clock}
          colorScheme="amber"
        />
        <StatCard
          title="Inquiries Concluded"
          value={metrics.completed || 0}
          subtitle="Action taken & findings filed"
          icon={CheckCircle2}
          colorScheme="emerald"
        />
        <StatCard
          title="Critical Priority Cases"
          value={metrics.criticalAssigned || 0}
          subtitle="High urgency allegations"
          icon={AlertTriangle}
          colorScheme="rose"
        />
      </div>

      {/* Active Caseload Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Assigned Caseload Requiring Inquiry</h3>
            <p className="text-xs text-slate-500 mt-0.5">Complaints assigned to you by the Grievance Administrator</p>
          </div>
          <Link
            to="/committee/complaints"
            className="text-xs font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1"
          >
            <span>View All Assigned</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Reference</th>
                <th className="px-6 py-3.5">Category & Location</th>
                <th className="px-6 py-3.5">Priority</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Complainant</th>
                <th className="px-6 py-3.5">Submitted Date</th>
                <th className="px-6 py-3.5 text-right">Inquiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentCases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    No cases currently assigned to you. All clear!
                  </td>
                </tr>
              ) : (
                recentCases.map((c) => (
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
                        <span>Conduct Inquiry</span>
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
