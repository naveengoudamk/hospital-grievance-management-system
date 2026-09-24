import React, { useState, useEffect } from 'react';
import { QrCode, Download, RefreshCw, Printer, Copy, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { QrConfig } from '../../types';
import { UniversalQrCard } from '../../components/UniversalQrCard';
import { Modal } from '../../components/Modal';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const AdminQrCode: React.FC = () => {
  const [qrConfig, setQrConfig] = useState<QrConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // Regenerate Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [qrName, setQrName] = useState('Universal Hospital Grievance QR');
  const [publicUrl, setPublicUrl] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadQr = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getQrConfig();
      setQrConfig(data);
      setPublicUrl(data.publicUrl);
    } catch (err) {
      console.error('Failed to load QR configuration:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQr();
  }, []);

  const handleRegenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const updated = await adminApi.generateQr(qrName, publicUrl);
      setQrConfig(updated);
      setModalOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to regenerate QR code.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Generating high-definition QR vector..." />;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-hospital-600 uppercase tracking-wider mb-1">
            <QrCode className="w-4 h-4" />
            <span>Hospital-Wide Single Deployment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Universal Hospital Grievance QR Code
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ONE universal QR code printed across all hospital reception desks, waiting halls, and clinics.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-hospital-400" />
          <span>Regenerate QR Code</span>
        </button>
      </div>

      {/* Main QR Card */}
      <UniversalQrCard qrConfig={qrConfig} />

      {/* Hospital Deployment Instructions */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4 print:hidden">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-hospital-600" />
          <span>Physical Deployment & Signage Recommendations</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
            <strong className="block text-slate-900 font-bold">1. Reception & Admission Desks</strong>
            <p>Place high-visibility tabletop acrylic stands near registration counters so incoming patients can immediately scan and view rights.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
            <strong className="block text-slate-900 font-bold">2. Billing & Cashier Counters</strong>
            <p>Affix QR placards directly beside the payment collection windows for quick dispute reporting regarding extra charges or delays.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
            <strong className="block text-slate-900 font-bold">3. Pharmacy & Drug Dispensaries</strong>
            <p>Display near dispensing queue lines to facilitate genuine medicine availability or pricing feedback.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
            <strong className="block text-slate-900 font-bold">4. Emergency & Inpatient Wards</strong>
            <p>Post on ward notice boards and waiting bays allowing attendants to anonymously report issues 24x7.</p>
          </div>
        </div>
      </div>

      {/* REGENERATE MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Regenerate Universal QR Code"
        subtitle="Updates the target URL encoded inside the QR barcode"
      >
        <form onSubmit={handleRegenerate} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Configuration Name</label>
            <input
              type="text"
              required
              value={qrName}
              onChange={(e) => setQrName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Public Target URL *</label>
            <input
              type="url"
              required
              value={publicUrl}
              onChange={(e) => setPublicUrl(e.target.value)}
              placeholder="https://hospital.org/public"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 font-mono"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              The public URL that opens when visitors scan this ONE QR code.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
            >
              {actionLoading ? 'Encoding...' : 'Regenerate QR Code'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
