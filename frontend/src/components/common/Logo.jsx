import React from 'react';
import { Sprout } from 'lucide-react';

export default function Logo({ size = 'md', className = '' }) {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <div className={`flex items-center gap-2 font-bold tracking-tight text-slate-900 ${className}`}>
      <div className={`flex items-center justify-center rounded-xl bg-brand-700 text-white shadow-sm shadow-brand-700/20 ${
        isSm ? 'w-7 h-7' : isLg ? 'w-11 h-11 rounded-2xl' : 'w-9 h-9'
      }`}>
        <Sprout className={isSm ? 'w-4 h-4' : isLg ? 'w-6 h-6' : 'w-5 h-5'} />
      </div>
      <span className={isSm ? 'text-lg' : isLg ? 'text-2xl' : 'text-xl'}>
        Plant<span className="text-brand-700">-Aid</span>
      </span>
    </div>
  );
}
