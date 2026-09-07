import React from 'react';
import { Home, Scan, History, User } from 'lucide-react';

export default function BottomNav({ currentTab, onSelectTab }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'scan', label: 'Scan', icon: Scan },
    { id: 'history', label: 'History', icon: History },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200/80 px-4 py-2 z-30 flex items-center justify-around shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
              isActive ? 'text-brand-700 font-semibold scale-105' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`p-1.5 rounded-full ${isActive ? 'bg-brand-100 text-brand-700' : ''}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[11px] leading-none">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
