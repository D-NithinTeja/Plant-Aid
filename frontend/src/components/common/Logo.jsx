import React from 'react';
import logoImg from '../../assets/Logo.png';

export default function Logo({ size = 'md', className = '' }) {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <div className={`flex items-center gap-2.5 font-bold tracking-tight text-on-surface select-none ${className}`}>
      <img
        src={logoImg}
        alt="Plant-Aid Logo"
        className={`object-contain rounded-xl ${
          isSm ? 'w-7 h-7' : isLg ? 'w-11 h-11' : 'w-9 h-9'
        }`}
      />
      <span className={`font-semibold tracking-tight ${isSm ? 'text-lg' : isLg ? 'text-2xl' : 'text-xl'} text-primary`}>
        Plant<span className="text-secondary font-normal">-Aid</span>
      </span>
    </div>
  );
}
