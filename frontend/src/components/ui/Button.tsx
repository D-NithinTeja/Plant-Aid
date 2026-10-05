import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, type HTMLMotionProps } from 'motion/react';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-agri-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-target select-none',
  {
    variants: {
      variant: {
        default:
          'bg-agri-700 text-white shadow-sm hover:bg-agri-800 active:bg-agri-900',
        destructive:
          'bg-rose-600 text-white shadow-sm hover:bg-rose-700 active:bg-rose-800',
        outline:
          'border border-emerald-900/15 bg-white/70 backdrop-blur-sm text-slate-800 hover:bg-white hover:text-agri-900 hover:border-agri-600/40 shadow-xs',
        secondary:
          'bg-agri-100/80 text-agri-900 hover:bg-agri-200/80 active:bg-agri-300',
        ghost:
          'text-slate-700 hover:bg-agri-100/50 hover:text-agri-900',
        link: 'text-agri-700 underline-offset-4 hover:underline',
        glass:
          'bg-white/80 backdrop-blur-md border border-white/60 text-slate-800 shadow-sm hover:bg-white hover:border-agri-300',
      },
      size: {
        default: 'h-11 px-5 py-2.5',
        sm: 'h-9 rounded-lg px-3.5 text-xs',
        lg: 'h-12 rounded-xl px-7 text-base font-bold',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        />
      );
    }

    return (
      <motion.button
        whileTap={{ scale: 0.98 }}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...(props as unknown as HTMLMotionProps<'button'>)}
      />
    );
  }
);
Button.displayName = 'Button';
