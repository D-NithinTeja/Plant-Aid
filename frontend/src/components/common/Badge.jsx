import React from 'react';

export default function Badge({ status = 'Moderate', className = '' }) {
  const normalized = (status || '').toLowerCase();

  let colors = 'bg-amber-100 text-amber-800 border-amber-200';

  if (normalized.includes('healthy')) {
    colors = 'bg-emerald-100 text-emerald-800 border-emerald-200';
  } else if (normalized.includes('mild') || normalized.includes('early')) {
    colors = 'bg-lime-100 text-lime-800 border-lime-200';
  } else if (normalized.includes('severe') || normalized.includes('critical')) {
    colors = 'bg-rose-100 text-rose-800 border-rose-200';
  } else if (normalized.includes('moderate')) {
    colors = 'bg-amber-100 text-amber-800 border-amber-200';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors} ${className}`}>
      {status}
    </span>
  );
}
