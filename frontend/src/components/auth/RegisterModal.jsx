import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Logo from '../common/Logo';
import { authService } from '../../services/auth';

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin, onChallenge2FA, onRegisterSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.register({
        user_name: name,
        email_address: email,
        phone_number: phone || undefined,
        password: password,
      });

      // User flow requires OTP verification right after signing up
      const loginData = await authService.login(email, password);
      if (loginData.requires_2fa) {
        onChallenge2FA(loginData.session_id, email);
      } else {
        onRegisterSuccess();
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed. Please check your details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Create Your Account</h2>
          <p className="text-sm text-slate-500 mt-1">Start protecting your crops with Plant-Aid</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <User className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Phone className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number (optional for SMS 2FA)"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create Password"
                className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-semibold rounded-2xl shadow-md text-sm mt-2 transition-all"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-bold text-brand-700 hover:text-brand-800"
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}
