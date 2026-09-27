import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, AlertCircle, ArrowLeft, RefreshCw, X } from 'lucide-react';
import Logo from '../common/Logo';
import { authService } from '../../services/auth';
import { toast } from 'sonner';

export default function OTPEntryModal({ isOpen, sessionId, identifier, onClose, onSuccess }) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(300);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!isOpen) return;
    setDigits(['', '', '', '', '', '']);
    setTimer(300);
    setError('');
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 120);
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
      const arr = pasted.split('');
      setDigits(arr);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    const code = digits.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await authService.verify2FA(sessionId, code);
      toast.success('2FA verification successful.');
      onSuccess();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid verification code. Please check your SMS or email.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-elevate-in">
      <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-8 shadow-2xl border border-outline-variant/30 relative">
        
        {/* Back / Close button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-mono text-outline hover:text-on-surface btn-press"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Two-Factor Auth</span>
          </div>
        </div>

        <div className="space-y-1 mb-6">
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">Verify Your Identity</h2>
          <p className="text-xs text-on-surface-variant">
            A 6-digit verification code was dispatched to <span className="font-mono font-medium text-on-surface">{identifier || '+1 (555) ***-4892'}</span>.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-error-container text-on-error-container text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          {/* 6 Digit Inputs */}
          <div className="flex justify-between gap-2" onPaste={handlePaste}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-12 h-14 text-center text-xl font-bold font-mono bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-outline">
            <span>Code expires in:</span>
            <span className="font-bold text-primary tabular-nums">{formatTimer()}</span>
          </div>

          <button
            type="submit"
            disabled={loading || digits.join('').length !== 6}
            className="w-full py-3.5 px-4 bg-primary text-on-primary rounded-xl font-semibold text-sm btn-press shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{loading ? 'Verifying...' : 'Authenticate Session'}</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-outline-variant/20 text-center">
          <button
            type="button"
            disabled={timer > 240}
            onClick={() => {
              setTimer(300);
              toast.info('New verification code dispatched.');
            }}
            className="text-xs text-primary font-medium hover:underline disabled:text-outline disabled:no-underline"
          >
            Didn't receive the code? Resend SMS
          </button>
        </div>
      </div>
    </div>
  );
}
