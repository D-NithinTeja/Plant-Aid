import React from 'react';
import { Bell } from 'lucide-react';
import Logo from '../common/Logo';

export default function Header({ user, onOpenProfile, onOpenNotifications }) {
  return (
    <header className="flex md:hidden items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-20">
      <Logo size="sm" />
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenNotifications}
          className="p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="w-2 h-2 bg-brand-600 rounded-full absolute top-1.5 right-1.5 ring-2 ring-white"></span>
        </button>
        {user ? (
          <button
            onClick={onOpenProfile}
            className="w-8 h-8 rounded-full bg-brand-700 text-white font-bold flex items-center justify-center text-xs shadow-sm ring-2 ring-brand-100"
          >
            {(user.user_name || 'U').charAt(0).toUpperCase()}
          </button>
        ) : (
          <button
            onClick={onOpenProfile}
            className="text-xs font-semibold text-brand-700 bg-brand-50 px-3 py-1.5 rounded-full"
          >
            Log In
          </button>
        )}
      </div>
    </header>
  );
}
