import React from 'react';
import { PlantAidLogo } from './PlantAidLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-transparent text-slate-600 text-sm py-8 border-t border-slate-300/40 relative z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <PlantAidLogo size="sm" showSubtitle={false} />
        <p className="text-slate-600 max-w-md text-xs leading-relaxed text-center sm:text-right font-normal">
          Real-time edge-ready crop diagnostic and treatment advisory system. Calibrated for groundnut pathology with two-layer localization and agronomic remedy planning.
        </p>
      </div>
    </footer>
  );
};
