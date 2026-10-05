import * as React from 'react';
import { cn } from '../../lib/utils';

export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  elevation?: 'flat' | 'subtle' | 'elevated';
}

export const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ className, glass = true, elevation = 'subtle', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl transition-all duration-200',
          glass
            ? 'bg-white/70 backdrop-blur-md border border-white/80 shadow-[0_4px_20px_-2px_rgba(20,83,45,0.05),0_2px_6px_-1px_rgba(20,83,45,0.03)]'
            : 'bg-white border border-slate-200/80 shadow-xs',
          elevation === 'elevated' && 'shadow-[0_12px_32px_-4px_rgba(20,83,45,0.08)]',
          elevation === 'flat' && 'shadow-none border-transparent',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Surface.displayName = 'Surface';
