import React from 'react';
import { Sprout } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-transparent text-slate-600 text-sm py-8 border-t border-slate-300/40 relative z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-base">
          <div className="w-7 h-7 rounded-lg bg-agri-700 flex items-center justify-center text-white">
            <Sprout className="w-4 h-4" />
          </div>
          <span>Plant-Aid Platform</span>
        </div>
        <p className="text-slate-600 max-w-md text-xs leading-relaxed text-center sm:text-right font-normal">
          Real-time edge-ready crop diagnostic and treatment advisory system. Calibrated for groundnut pathology with two-layer localization and agronomic remedy planning.
        </p>
      </div>
    </footer>
  );
};
