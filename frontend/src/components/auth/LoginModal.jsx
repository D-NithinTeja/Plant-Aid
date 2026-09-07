import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Logo from '../common/Logo';
import { authService } from '../../services/auth';

export default function LoginModal({ isOpen, onClose, onSwitchToRegister, onChallenge2FA, onLoginSuccess }) {
  const [identifier, setIdentifier] = useState('demo@plant-aid.org');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.login(identifier, password);
      if (data.requires_2fa) {
        onChallenge2FA(data.session_id, identifier);
      } else {
        onLoginSuccess();
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid email or password. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Logo Centered */}
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-sm text-slate-500 mt-1">Log in to continue to Plant-Aid</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Address */}
          <div>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Email address"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-12 pr-12 py-3.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
              />
              <span>Remember me</span>
            </label>
            <button type="button" className="text-brand-700 hover:text-brand-800 font-semibold">
              Forgot password?
            </button>
          </div>

          {/* Submit Log in button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-semibold rounded-2xl shadow-md shadow-brand-700/20 transition-all hover:scale-[1.01] active:scale-[0.99] text-sm mt-2"
          >
            {loading ? 'Signing in...' : 'Log in'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-bold text-brand-700 hover:text-brand-800"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}
