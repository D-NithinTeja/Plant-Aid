import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export interface ExpandableCardProps {
  id?: string;
  imageSrc?: string;
  title?: string;
  subtitle?: string;
  content?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
  onOpen?: () => void;
  onClose?: () => void;
}

export default function ExpandableProfileCard({
  id,
  imageSrc = 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=1000',
  title = 'Jane Doe',
  subtitle = 'Senior UX Designer',
  content,
  badge,
  className = '',
  onOpen,
  onClose,
}: ExpandableCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const uniqueKey = id || title.replace(/\s+/g, '-').toLowerCase();
  const layoutId = `expandable-profile-card-${uniqueKey}`;

  const handleOpen = () => {
    setIsOpen(true);
    onOpen?.();
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  // Close on Escape key & lock background body scroll
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <motion.div
        layoutId={layoutId}
        onClick={handleOpen}
        className={`cursor-pointer relative h-72 w-full overflow-hidden rounded-2xl border border-white/60 bg-white/70 backdrop-blur-md group shadow-[0_4px_20px_rgba(20,83,45,0.06)] hover:shadow-[0_12px_32px_rgba(20,83,45,0.12)] transition-shadow duration-300 ${className}`}
        whileHover="hover"
      >
        <motion.img
          layoutId={`image-${layoutId}`}
          src={imageSrc}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover"
          variants={{
            hover: { scale: 1.06 },
          }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-black/10 opacity-80 group-hover:opacity-95 transition-opacity" />

        {badge && (
          <div className="absolute top-3.5 left-3.5 z-10">
            {badge}
          </div>
        )}

        <div className="absolute bottom-0 left-0 p-5 sm:p-6 w-full translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <motion.p
            layoutId={`subtitle-${layoutId}`}
            className="text-emerald-300 text-xs font-semibold tracking-wider uppercase mb-1 drop-shadow-xs"
          >
            {subtitle}
          </motion.p>
          <motion.h3
            layoutId={`title-${layoutId}`}
            className="text-lg sm:text-xl font-extrabold tracking-tight text-white drop-shadow-sm"
          >
            {title}
          </motion.h3>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-8 overflow-hidden">
            {/* Backdrop: covers navbar, full screen blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal dialog card */}
            <motion.div
              layoutId={layoutId}
              role="dialog"
              aria-modal="true"
              className="relative w-full max-w-4xl h-[88vh] md:h-[82vh] max-h-[820px] bg-white/95 backdrop-blur-2xl rounded-3xl overflow-hidden border border-white/80 z-10 flex flex-col md:flex-row shadow-2xl min-h-0"
            >
              {/* Floating Close Button: Pinned to top-right with high z-index */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-40 flex h-9 w-9 items-center justify-center bg-slate-900/70 hover:bg-slate-900 rounded-full border border-white/20 text-white transition-colors backdrop-blur-md touch-target cursor-pointer shadow-lg"
                title="Close"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Left Column: Specimen Image */}
              <div className="relative h-48 sm:h-56 md:h-full w-full md:w-1/2 shrink-0 overflow-hidden bg-slate-950">
                <motion.img
                  layoutId={`image-${layoutId}`}
                  src={imageSrc}
                  alt={title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent md:hidden" />
              </div>

              {/* Right Column: Scrollable Content with guaranteed scrollbar */}
              <div className="p-6 sm:p-8 w-full md:w-1/2 flex flex-col h-full min-h-0 overflow-y-auto overscroll-contain custom-scrollbar">
                {/* Header with right clearance for close button */}
                <div className="pr-12 mb-3 shrink-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <motion.p
                      layoutId={`subtitle-${layoutId}`}
                      className="text-agri-700 text-xs font-bold tracking-wider uppercase"
                    >
                      {subtitle}
                    </motion.p>
                    {badge}
                  </div>

                  <motion.h3
                    layoutId={`title-${layoutId}`}
                    className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 pb-3 border-b border-emerald-950/10"
                  >
                    {title}
                  </motion.h3>
                </div>

                {/* Scrollable Body Content */}
                <motion.div
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                  className="text-slate-700 text-sm leading-relaxed space-y-4 pb-4 grow-0 shrink-0"
                >
                  {content || (
                    <div className="flex flex-col gap-6">
                      <p>
                        A passionate UX/UI designer with over 8 years of experience creating
                        intuitive digital products. I specialize in bridging the gap between
                        complex systems and user-friendly interfaces.
                      </p>
                      <div>
                        <h4 className="text-slate-900 font-bold tracking-tight mb-1 text-sm">
                          Background
                        </h4>
                        <p className="text-slate-600 text-xs leading-relaxed">
                          Previously led design teams at top fintech startups, focusing on
                          accessibility, seamless transactions, and inclusive design.
                        </p>
                      </div>
                      <div>
                        <h4 className="text-slate-900 font-bold tracking-tight mb-1 text-sm">
                          Current Focus
                        </h4>
                        <p className="text-slate-600 text-xs leading-relaxed">
                          Currently exploring the intersection of AI and user experience, building
                          tools that empower creators and simplify daily workflows.
                        </p>
                      </div>
                      <button
                        onClick={handleClose}
                        className="mt-2 px-5 py-2.5 bg-agri-700 text-white font-bold rounded-xl hover:bg-agri-800 transition-colors self-start shadow-xs text-xs cursor-pointer"
                      >
                        Connect with Jane
                      </button>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
