import React from 'react';
import {
  LayoutDashboard,
  Camera,
  History,
  Stethoscope,
  Settings,
  LogOut
} from 'lucide-react';
import Logo from '../common/Logo';

export default function Sidebar({ currentTab, onSelectTab, user, onLogout }) {
  const navItems = [
    { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scan', label: 'Scan & Diagnose', icon: Camera },
    { id: 'history', label: 'Diagnosis History', icon: History },
    { id: 'treatment', label: 'Treatment Database', icon: Stethoscope },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-surface-container-low border-r border-outline-variant/30 h-screen sticky top-0 px-4 py-6 z-20 shadow-[1px_0_12px_rgba(0,0,0,0.02)]">
      {/* Brand Logo */}
      <div
        className="px-3 mb-8 cursor-pointer select-none"
        onClick={() => onSelectTab('home')}
      >
        <Logo size="md" />
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1.5" aria-label="Main Navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium btn-press ${isActive
                  ? 'bg-primary text-on-primary font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
            >
              <div className="flex items-center gap-3.5">
                <Icon className={`w-5 h-5 ${isActive ? 'text-secondary-fixed' : 'text-outline'}`} />
                <span>{item.label}</span>
              </div>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-secondary-fixed" />
              )}
            </button>
          );
        })}
      </nav>

      {/* AI Systems Telemetry Status Indicator (Honest calm indicator) */}
      <div className="mx-2 mb-4 p-3 rounded-xl bg-surface-container border border-outline-variant/20 flex items-center gap-2.5">
        <div className="w-2 h-2 rounded-full bg-secondary" />
        <div className="flex flex-col">
          <span className="text-[11px] font-medium text-on-surface font-mono">AgriNet v4.2</span>
          <span className="text-[10px] text-outline">Telemetry Nominal</span>
        </div>
      </div>

      {/* User Footer Card */}
      {user ? (
        <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/25 shadow-sm flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer min-w-0"
            onClick={() => onSelectTab('settings')}
          >
            <div className="w-9 h-9 rounded-lg bg-primary text-on-primary font-bold flex items-center justify-center text-xs flex-shrink-0">
              {(user.user_name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-on-surface truncate">
                {user.user_name || 'Bhavana'}
              </p>
              <p className="text-[11px] text-outline truncate font-mono">
                {user.email_address || user.email || 'Farm ID #8849'}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-surface-container btn-press"
            title="Log Out"
            aria-label="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/25 text-center">
          <p className="text-xs text-outline mb-2">Guest Mode</p>
          <button
            onClick={() => onSelectTab('login')}
            className="w-full py-2 bg-primary text-on-primary font-medium text-xs rounded-lg btn-press shadow-sm"
          >
            Sign In
          </button>
        </div>
      )}
    </aside>
  );
}
