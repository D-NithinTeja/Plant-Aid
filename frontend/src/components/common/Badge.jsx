import React from 'react';

export default function Badge({ status = 'Moderate', className = '' }) {
  const normalized = (status || '').toLowerCase();

  let colors = 'bg-surface-container text-on-surface-variant border-outline-variant/30';

  if (normalized.includes('healthy')) {
    colors = 'bg-secondary-container text-on-secondary-container border-secondary/20';
  } else if (normalized.includes('mild') || normalized.includes('early')) {
    colors = 'bg-primary-fixed text-primary border-primary/20';
  } else if (normalized.includes('severe') || normalized.includes('critical')) {
    colors = 'bg-error-container text-on-error-container border-error/20';
  } else if (normalized.includes('moderate')) {
    colors = 'bg-[#ffddb9] text-[#5e411e] border-[#c69f74]/30';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors} ${className}`}>
      {status}
    </span>
  );
}
