import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Logo from '../common/Logo';
import { authService } from '../../services/auth';

export default function OTPEntryModal({ isOpen, sessionId, identifier, onClose, onSuccess }) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(300); // 5 minutes (300 seconds)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!isOpen) return;
    setDigits(['', '', '', '', '', '']);
    setTimer(300);
    setError('');
    // Auto-focus first input
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  if (!isOpen) return null;

  const formatTimer = () => {
    const mins = Math.floor(timer / 60);
    const secs = timer % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const newDigits = pasted.split('');
      setDigits(newDigits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const otpCode = digits.join('');
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.verify2FA(sessionId, otpCode);
      onSuccess();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid or expired OTP code. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute left-6 top-6 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 shadow-sm">
            <ShieldCheck className="w-7 h-7" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Two-Factor Authentication</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            We sent a 6-digit security code to <strong className="text-slate-800">{identifier}</strong>. Enter it below to confirm your identity.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 6 Digit Input Boxes */}
          <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-12 h-14 text-center text-xl font-bold bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600 transition-all text-slate-900 shadow-sm"
              />
            ))}
          </div>

          {/* Countdown timer */}
          <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
            <span>Code expires in:</span>
            <span className="font-mono font-bold text-brand-800 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-100">
              {formatTimer()}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading || digits.some((d) => !d)}
            className="w-full py-3.5 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white font-semibold rounded-2xl shadow-md shadow-brand-700/20 transition-all text-sm"
          >
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Didn't receive code?{' '}
          <button
            type="button"
            onClick={() => alert('OTP resent to console/provider!')}
            className="font-bold text-brand-700 hover:text-brand-800 inline-flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Resend</span>
          </button>
        </div>
      </div>
    </div>
  );
}
