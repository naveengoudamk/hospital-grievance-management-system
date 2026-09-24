import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Shield, Lock, User, Key, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(
    searchParams.get('expired') ? 'Your session has expired. Please sign in again.' : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await login(username.trim(), password);
      if (res.role === 'ROLE_ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/committee/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-hospital-950 text-white flex flex-col justify-between p-4 sm:p-6">
      {/* Top Bar */}
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
        <Link
          to="/public"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Public QR Portal</span>
        </Link>
        <span className="text-[10px] uppercase font-bold tracking-widest text-hospital-400 bg-hospital-950/60 border border-hospital-800 px-3 py-1 rounded-full">
          Authorized Staff Only
        </span>
      </div>

      {/* Main Login Box */}
      <div className="w-full max-w-md mx-auto my-8">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50">
          
          {/* Brand Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-hospital-600 to-hospital-400 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-hospital-500/30">
              <Shield className="w-7 h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">Staff Gateway</h2>
            <p className="text-xs text-slate-400 mt-1">
              Grievance Administration & Inquiry Committee
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin or committee username"
                  required
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-hospital-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-hospital-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-hospital-500 to-hospital-600 hover:from-hospital-600 hover:to-hospital-700 text-white font-bold text-sm py-3 rounded-xl shadow-lg shadow-hospital-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Sign In to System</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials Quick Fill Buttons */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-left space-y-2.5">
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Demo Credentials (Development Mode)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('admin', 'Admin@12345')}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs text-left border border-slate-700 transition-colors"
              >
                <strong className="block text-hospital-400 font-bold">Admin Role</strong>
                <span className="text-[11px] text-slate-400 font-mono">admin / Admin@12345</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('committee1', 'Committee@123')}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs text-left border border-slate-700 transition-colors"
              >
                <strong className="block text-teal-400 font-bold">Committee Role</strong>
                <span className="text-[11px] text-slate-400 font-mono">committee1 / Committee@123</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-500">
        Hospital Grievance & Accountability Management System • JWT + BCrypt Protected
      </div>
    </div>
  );
};
