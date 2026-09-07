import React from 'react';
import { 
  Home, 
  Scan, 
  History, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import Logo from '../common/Logo';

export default function Sidebar({ currentTab, onSelectTab, user, onLogout }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'scan', label: 'Scan Plant', icon: Scan },
    { id: 'history', label: 'History', icon: History },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: '2' },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/80 h-screen sticky top-0 px-4 py-6 z-20 shadow-[1px_0_10px_rgba(0,0,0,0.02)]">
      {/* Brand Logo */}
      <div className="px-3 mb-8 cursor-pointer" onClick={() => onSelectTab('home')}>
        <Logo size="md" />
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-brand-50 text-brand-800 font-semibold shadow-sm shadow-brand-100/50'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Icon className={`w-5 h-5 ${isActive ? 'text-brand-700' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-brand-100 text-brand-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Footer Card */}
      {user ? (
        <div className="pt-4 border-t border-slate-100 mt-auto">
          <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 transition-colors">
            <div 
              className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
              onClick={() => onSelectTab('profile')}
            >
              <div className="w-10 h-10 rounded-full bg-brand-700 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                {(user.user_name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <div className="text-sm font-semibold text-slate-800 truncate">{user.user_name || 'Farmer'}</div>
                <div className="text-xs text-slate-400 truncate">{user.email_address || 'Online'}</div>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="pt-4 border-t border-slate-100 mt-auto">
          <button
            onClick={() => onSelectTab('login')}
            className="w-full py-2.5 px-4 bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold rounded-2xl shadow-sm transition-colors"
          >
            Log In
          </button>
        </div>
      )}
    </aside>
  );
}
