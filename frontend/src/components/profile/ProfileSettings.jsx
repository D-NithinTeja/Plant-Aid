import React from 'react';
import { 
  ArrowLeft, 
  User, 
  Globe, 
  Bell, 
  ShieldCheck, 
  HelpCircle, 
  Info, 
  LogOut, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function ProfileSettings({ user, onBack, onLogout }) {
  const name = user?.user_name || 'Nithin Teja';
  const email = user?.email_address || 'nithin@example.com';
  const initial = name.charAt(0).toUpperCase();

  const menuItems = [
    { id: 'edit', label: 'Edit Profile', icon: User },
    { id: 'language', label: 'Language', icon: Globe, value: 'English' },
    { id: 'notifications', label: 'Notification Preferences', icon: Bell },
    { id: 'security', label: 'Security & 2FA', icon: ShieldCheck, badge: 'Protected' },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
    { id: 'about', label: 'About Plant-Aid', icon: Info, value: 'v1.0' },
  ];

  return (
    <div className="max-w-xl mx-auto w-full px-4 py-4 md:py-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 rounded-2xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-slate-900">Profile & Settings</h2>
        <div className="w-9" />
      </div>

      {/* User Header Profile Card (Screen 8) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-slate-300 text-slate-700 font-bold text-2xl flex items-center justify-center shadow-inner mb-3">
          {initial}
        </div>
        <h3 className="text-lg font-bold text-slate-900">{name}</h3>
        <p className="text-xs text-slate-400 mt-0.5">{email}</p>
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-[11px] font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
          <span>2FA Protected Account</span>
        </div>
      </div>

      {/* Settings Menu List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden divide-y divide-slate-100">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => alert(`${item.label} settings`)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <Icon className="w-5 h-5 text-slate-400" />
                <span className="text-xs md:text-sm font-medium text-slate-800">{item.label}</span>
              </div>

              <div className="flex items-center gap-2">
                {item.value && (
                  <span className="text-xs text-slate-400 font-medium">{item.value}</span>
                )}
                {item.badge && (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                    {item.badge}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </button>
          );
        })}

        {/* Logout Row */}
        <button
          onClick={onLogout}
          className="w-full p-4 flex items-center gap-3.5 text-left hover:bg-rose-50/50 transition-colors text-rose-600"
        >
          <LogOut className="w-5 h-5 text-rose-600" />
          <span className="text-xs md:text-sm font-bold">Logout</span>
        </button>
      </div>
    </div>
  );
}
