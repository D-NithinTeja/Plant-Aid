import React from 'react';
import { ShieldCheck } from 'lucide-react';
import Logo from '../common/Logo';

export default function Header({ user, onOpenProfile }) {
  return (
    <header className="flex md:hidden items-center justify-between px-4 py-3 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/30 sticky top-0 z-20 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <Logo size="sm" />
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
          <span>v4.2</span>
        </div>
        {user ? (
          <button
            onClick={onOpenProfile}
            className="w-8 h-8 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center text-xs shadow-sm btn-press"
            aria-label="User Profile"
          >
            {(user.user_name || 'U').charAt(0).toUpperCase()}
          </button>
        ) : (
          <button
            onClick={onOpenProfile}
            className="text-xs font-semibold text-primary bg-primary-fixed px-3 py-1.5 rounded-full btn-press"
          >
            Log In
          </button>
        )}
      </div>
    </header>
  );
}
