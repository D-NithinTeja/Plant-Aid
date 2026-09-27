import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, X, ArrowRight, ShieldCheck } from 'lucide-react';
import Logo from '../common/Logo';
import { authService } from '../../services/auth';
import { toast } from 'sonner';

export default function LoginModal({ isOpen, onClose, onSwitchToRegister, onChallenge2FA, onLoginSuccess }) {
  const [identifier, setIdentifier] = useState('demo@plant-aid.org');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.login(identifier, password);
      if (data.session_id || data.requires_2fa) {
        if (data.otp_code_dev) {
          toast.info(`Dev 2FA Code: ${data.otp_code_dev}`, { duration: 10000 });
        }
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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-elevate-in">
      <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-8 shadow-2xl border border-outline-variant/30 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-outline hover:text-on-surface rounded-xl hover:bg-surface-container transition-colors btn-press"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Emblem */}
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>

        <div className="text-center mb-6 space-y-1">
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">Access Agronomy Console</h2>
          <p className="text-xs text-on-surface-variant">Sign in to sync field telemetry and sensor history.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-error-container text-on-error-container text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-outline uppercase tracking-wider block">
              Work Email / Phone
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                placeholder="name@farm.com or phone"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-base md:text-sm text-on-surface placeholder:text-outline outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono text-outline uppercase tracking-wider block">
              Account Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-base md:text-sm text-on-surface placeholder:text-outline outline-none focus:border-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-primary text-on-primary rounded-xl font-semibold text-sm btn-press shadow-sm flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-outline-variant/20 flex items-center justify-between text-xs text-outline">
          <span>Protected telemetry session</span>
          <button
            onClick={onSwitchToRegister}
            className="text-primary font-semibold hover:underline"
          >
            Create Farm Account
          </button>
        </div>
      </div>
    </div>
  );
}
