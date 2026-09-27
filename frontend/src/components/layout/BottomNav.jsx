import React from 'react';
import { LayoutDashboard, Camera, History, User } from 'lucide-react';

export default function BottomNav({ currentTab, onSelectTab }) {
  const tabs = [
    { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scan', label: 'Scan', icon: Camera },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-xl border-t border-outline-variant/30 px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] z-30 flex items-center justify-around shadow-[0_-2px_12px_rgba(0,0,0,0.03)] select-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl btn-press ${
              isActive ? 'text-primary font-bold' : 'text-outline hover:text-on-surface'
            }`}
          >
            <div className={`p-1.5 rounded-lg ${isActive ? 'bg-secondary-container text-on-secondary-container shadow-sm' : ''}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono leading-none">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
