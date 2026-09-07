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

        {/* OR Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <span className="relative bg-white px-4 text-xs font-semibold text-slate-400 uppercase">
            OR
          </span>
        </div>

        {/* Social Buttons */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => alert('Social authentication demo')}
            className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-3 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            onClick={() => alert('Social authentication demo')}
            className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-3 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4 fill-slate-900" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.64-.78 1.08-1.86.96-2.94-1 .04-2.14.65-2.78 1.41-.58.68-1.1 1.77-.96 2.83 1.12.09 2.14-.52 2.78-1.3"/>
            </svg>
            <span>Continue with Apple</span>
          </button>
        </div>

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
