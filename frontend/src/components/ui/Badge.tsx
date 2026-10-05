import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-0.5 text-xs font-semibold transition-colors select-none border',
  {
    variants: {
      variant: {
        default:
          'border-agri-300 bg-agri-100/70 text-agri-900',
        secondary:
          'border-slate-200 bg-slate-100/80 text-slate-700',
        destructive:
          'border-rose-300 bg-rose-100/70 text-rose-800',
        outline:
          'border-emerald-900/20 text-slate-800 bg-white/60 backdrop-blur-xs',
        warning:
          'border-amber-300 bg-amber-100/70 text-amber-900',
        optimal:
          'border-emerald-300 bg-emerald-100/70 text-emerald-900',
        info:
          'border-sky-300 bg-sky-100/70 text-sky-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
