import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Upload,
  X,
  CheckCircle2,
  Copy,
  Check,
  Printer,
  ShieldCheck,
  AlertTriangle,
  Lock,
  User,
  Phone,
  Mail,
  Calendar,
  Building2,
  Tags,
  Search,
} from 'lucide-react';
import { publicApi } from '../../api/publicApi';
import { Category, LocationItem, PublicComplaintResponse } from '../../types';

export const ReportComplaint: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loadingMaster, setLoadingMaster] = useState(true);

  // Form fields
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [locationId, setLocationId] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [complainantName, setComplainantName] = useState('');
  const [complainantPhone, setComplainantPhone] = useState('');
  const [complainantEmail, setComplainantEmail] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState('PHONE');
  const [incidentDate, setIncidentDate] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [files, setFiles] = useState<File[]>([]);
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);

  // State
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<PublicComplaintResponse | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [cats, locs] = await Promise.all([
          publicApi.getCategories(),
          publicApi.getLocations(),
        ]);
        setCategories(cats);
        setLocations(locs);
        if (cats.length > 0) setCategoryId(cats[0].id);
      } catch (err) {
        console.error('Failed to load master data:', err);
      } finally {
        setLoadingMaster(false);
      }
    };
    loadMasterData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      const validFiles: File[] = [];
      const allowedExts = ['jpg', 'jpeg', 'png', 'pdf'];

      for (const file of selected) {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!ext || !allowedExts.includes(ext)) {
          alert(`File ${file.name} is not allowed. Only JPG, PNG, and PDF files are accepted.`);
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} exceeds the 10MB size limit.`);
          continue;
        }
        validFiles.push(file);
      }

      setFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!categoryId) {
      setErrorMsg('Please select a complaint category.');
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setErrorMsg('Please provide a detailed description of the issue (minimum 10 characters).');
      return;
    }
    if (!isAnonymous) {
      if (!complainantName.trim()) {
        setErrorMsg('Please enter your name, or toggle the complaint as Anonymous.');
        return;
      }
      if (!complainantPhone.trim()) {
        setErrorMsg('Please provide your phone number so the grievance desk can follow up.');
        return;
      }
    }
    if (!agreedToPolicy) {
      setErrorMsg('Please review and accept the grievance policy terms before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        categoryId: Number(categoryId),
        locationId: locationId ? Number(locationId) : undefined,
        description: description.trim(),
        isAnonymous,
        complainantName: isAnonymous ? undefined : complainantName.trim(),
        complainantPhone: isAnonymous ? undefined : complainantPhone.trim(),
        complainantEmail: isAnonymous || !complainantEmail.trim() ? undefined : complainantEmail.trim(),
        preferredContactMethod: isAnonymous ? undefined : preferredContactMethod,
        incidentDate: incidentDate ? `${incidentDate}:00` : undefined,
      };

      const response = await publicApi.submitComplaint(payload, files);
      setSuccessData(response);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit complaint. Please try again.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = (text: string, type: 'ref' | 'token') => {
    navigator.clipboard.writeText(text);
    if (type === 'ref') {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    } else {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const handlePrintTicket = () => {
    window.print();
  };

  // SUCCESS SCREEN
  if (successData) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-10 text-center print:border-none print:shadow-none">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Complaint Submitted Successfully
          </h2>
          <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
            Your grievance has been logged securely in the hospital registry and queued for administrative review.
          </p>

          {/* Secure Credentials Card */}
          <div className="mt-8 bg-slate-900 text-white rounded-2xl p-6 sm:p-8 text-left space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-hospital-400">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Official Reference & Secret Tracking Token</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Reference ID */}
              <div className="bg-slate-800/90 rounded-xl p-4 border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Complaint Reference</span>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <span className="text-lg font-mono font-bold text-white">{successData.complaintReference}</span>
                  <button
                    onClick={() => handleCopy(successData.complaintReference, 'ref')}
                    className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
                    title="Copy Reference"
                  >
                    {copiedRef ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Tracking Token */}
              <div className="bg-slate-800/90 rounded-xl p-4 border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Private Tracking Token</span>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <span className="text-lg font-mono font-bold text-emerald-400 tracking-wider">{successData.trackingToken}</span>
                  <button
                    onClick={() => handleCopy(successData.trackingToken, 'token')}
                    className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
                    title="Copy Tracking Token"
                  >
                    {copiedToken ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200">
              ⚠️ <strong>IMPORTANT:</strong> Save or copy both the <strong>Complaint Reference</strong> and <strong>Tracking Token</strong> now. For privacy, tracking tokens are cryptographically hashed and cannot be retrieved by staff if lost.
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 print:hidden">
            <button
              onClick={handlePrintTicket}
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Submission Slip</span>
            </button>

            <Link
              to={`/public/track?ref=${encodeURIComponent(successData.complaintReference)}&token=${encodeURIComponent(successData.trackingToken)}`}
              className="inline-flex items-center gap-2 bg-hospital-600 hover:bg-hospital-700 text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-sm transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Track Complaint Status</span>
            </Link>

            <button
              onClick={() => {
                setSuccessData(null);
                setDescription('');
                setFiles([]);
              }}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 px-4 py-3"
            >
              <span>Submit Another Grievance</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SUBMISSION FORM
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-hospital-600 uppercase tracking-wider mb-1">
          <FileText className="w-4 h-4" />
          <span>Institutional Reporting Form</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Report an Issue or Grievance
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Scanned via Universal Hospital QR Code. Please provide factual details regarding the incident.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Submission Error:</strong>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Row 1: Category & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Tags className="w-3.5 h-3.5 text-hospital-500" />
              <span>Complaint Category <span className="text-rose-500">*</span></span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-500 focus:bg-white transition-all"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} {cat.severityDefault ? `(${cat.severityDefault})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Location Area */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-hospital-500" />
              <span>Hospital Area / Department</span>
            </label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value ? Number(e.target.value) : '')}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-500 focus:bg-white transition-all"
            >
              <option value="">-- General / Not Location-Specific --</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} {loc.floorNumber ? `(${loc.floorNumber})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Incident Date & Time */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-hospital-500" />
            <span>Date & Time of Incident</span>
          </label>
          <input
            type="datetime-local"
            value={incidentDate}
            onChange={(e) => setIncidentDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-500 focus:bg-white transition-all"
          />
          <span className="text-[11px] text-slate-500 mt-1 block">
            Defaults to current time. Adjust if the incident happened earlier today or on a previous date.
          </span>
        </div>

        {/* Row 3: Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-hospital-500" />
            <span>Description of Reported Issue <span className="text-rose-500">*</span></span>
          </label>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Please describe specifically what occurred, including relevant staff titles, counter numbers, bill numbers, or medicine names..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-500 focus:bg-white transition-all"
          />
          <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
            <span>Minimum 10 characters. Maximum 4000 characters.</span>
            <span>{description.length} / 4000</span>
          </div>
        </div>

        {/* Anonymous Toggle */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="space-y-0.5 pr-4">
            <span className="block text-xs font-bold text-slate-900 uppercase">Submit Anonymously?</span>
            <span className="block text-xs text-slate-500">
              When enabled, your name, phone, and contact details are completely omitted from the grievance file.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
              isAnonymous ? 'bg-hospital-600 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
          </button>
        </div>

        {/* Identified Contact Details (When Not Anonymous) */}
        {!isAnonymous && (
          <div className="p-5 rounded-2xl bg-hospital-50/60 border border-hospital-100 space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 text-xs font-bold text-hospital-900 uppercase">
              <User className="w-4 h-4 text-hospital-600" />
              <span>Complainant Contact Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={complainantName}
                  onChange={(e) => setComplainantName(e.target.value)}
                  placeholder="e.g. John Miller / Patient Attendant"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Mobile / Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={complainantPhone}
                  onChange={(e) => setComplainantPhone(e.target.value)}
                  placeholder="e.g. +1 555-019-2834"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={complainantEmail}
                  onChange={(e) => setComplainantEmail(e.target.value)}
                  placeholder="e.g. name@example.com"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Preferred Contact Method
                </label>
                <select
                  value={preferredContactMethod}
                  onChange={(e) => setPreferredContactMethod(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-500"
                >
                  <option value="PHONE">Phone Call</option>
                  <option value="SMS">SMS Message</option>
                  <option value="EMAIL">Email</option>
                  <option value="WHATSAPP">WhatsApp</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Evidence Upload */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-hospital-500" />
            <span>Supporting Evidence / Documents (Optional)</span>
          </label>

          <div className="border-2 border-dashed border-slate-300 hover:border-hospital-400 rounded-2xl p-6 text-center bg-slate-50/60 transition-colors">
            <input
              type="file"
              id="evidence-files"
              multiple
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="evidence-files" className="cursor-pointer flex flex-col items-center justify-center">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-xs font-semibold text-hospital-600 hover:underline">
                Click to browse files or drag & drop
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                Approved formats: JPG, PNG, PDF (Max 10MB per file)
              </span>
            </label>
          </div>

          {/* Uploaded Files List */}
          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 bg-slate-100 rounded-xl text-xs text-slate-700"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <FileText className="w-4 h-4 text-hospital-600 flex-shrink-0" />
                    <span className="truncate font-medium">{f.name}</span>
                    <span className="text-slate-400">({(f.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Terms & Declarations */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToPolicy}
              onChange={(e) => setAgreedToPolicy(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-hospital-600 focus:ring-hospital-500"
            />
            <span>
              I declare that this reported issue is submitted in good faith to assist hospital accountability. I understand that submitted information is recorded as an allegation until evaluated by the grievance inquiry committee.
            </span>
          </label>
        </div>

        {/* Submit Action */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-hospital-600 to-hospital-700 hover:from-hospital-700 hover:to-hospital-800 text-white font-bold text-sm py-3.5 rounded-2xl shadow-lg shadow-hospital-600/25 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Securing & Submitting Grievance...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>Submit Grievance</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
