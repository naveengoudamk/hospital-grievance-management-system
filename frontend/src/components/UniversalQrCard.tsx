import React, { useState } from 'react';
import { QrCode, Download, Copy, Check, ExternalLink, Printer } from 'lucide-react';
import { QrConfig } from '../types';

interface UniversalQrCardProps {
  qrConfig?: QrConfig | null;
  hospitalName?: string;
  showPrintOption?: boolean;
}

export const UniversalQrCard: React.FC<UniversalQrCardProps> = ({
  qrConfig,
  hospitalName = 'City General Hospital & Research Center',
  showPrintOption = true,
}) => {
  const [copied, setCopied] = useState(false);

  const publicUrl = qrConfig?.publicUrl || window.location.origin + '/public';
  const qrImage = qrConfig?.qrCodeBase64;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden print:border-none print:shadow-none">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-hospital-800 via-hospital-700 to-hospital-600 px-6 py-4 text-white text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold tracking-wide uppercase mb-1">
          <QrCode className="w-3.5 h-3.5" />
          <span>ONE Universal Hospital QR Code</span>
        </div>
        <h3 className="text-lg sm:text-xl font-bold">{hospitalName}</h3>
        <p className="text-xs text-hospital-100 mt-0.5">Scan to report service grievances or track existing complaints</p>
      </div>

      {/* QR Visual */}
      <div className="p-6 sm:p-8 flex flex-col items-center text-center">
        <div className="p-4 bg-slate-50 border-2 border-dashed border-hospital-200 rounded-2xl mb-4 relative group">
          {qrImage ? (
            <img
              src={qrImage}
              alt="Universal Hospital Grievance QR Code"
              className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-lg"
            />
          ) : (
            <div className="w-56 h-56 sm:w-64 sm:h-64 flex flex-col items-center justify-center text-slate-400">
              <QrCode className="w-16 h-16 animate-pulse text-hospital-400 mb-2" />
              <span className="text-xs">Loading QR Code...</span>
            </div>
          )}
        </div>

        <div className="max-w-md w-full bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center justify-between gap-2 mb-6">
          <div className="text-left truncate">
            <span className="block text-[10px] uppercase font-bold text-slate-400">Public Scan Target URL</span>
            <span className="text-xs text-slate-800 font-mono font-medium truncate block">{publicUrl}</span>
          </div>
          <button
            onClick={handleCopy}
            type="button"
            className="flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs flex-shrink-0 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 print:hidden">
          <a
            href="/api/admin/qr/download"
            download="hospital-universal-qr.png"
            className="inline-flex items-center gap-2 bg-hospital-600 hover:bg-hospital-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </a>

          {showPrintOption && (
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Poster Card</span>
            </button>
          )}

          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Public Page</span>
          </a>
        </div>

        {/* Print Instructions footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-slate-400 text-xs text-center max-w-sm">
          💡 <strong className="text-slate-600">Print Notice:</strong> Display this universal QR card across hospital reception, OPD clinics, pharmacy, billing counters, and emergency bays.
        </div>
      </div>
    </div>
  );
};
