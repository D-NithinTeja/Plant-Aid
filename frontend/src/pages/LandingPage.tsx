import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Scan,
  BookOpen,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  History,
  Leaf,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 bg-transparent relative overflow-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-5xl mx-auto space-y-10 relative z-10"
      >
        {/* Main Glassmorphic Hero Container */}
        <motion.div variants={itemVariants} className="relative">
          {/* Ambient 3D Glow Blobs behind the hero */}
          <div className="absolute -top-16 -left-16 w-80 h-80 bg-gradient-to-br from-emerald-400/30 to-teal-300/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-gradient-to-br from-amber-400/25 to-emerald-300/20 rounded-full blur-3xl pointer-events-none" />

          <div className="glass-frost p-8 sm:p-14 lg:p-16 text-center space-y-8 relative overflow-hidden rounded-[32px]">
            {/* Headline & Description */}
            <div className="space-y-4 max-w-3xl mx-auto">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-slate-900 leading-[1.12]">
                Groundnut Plant Disease Diagnosis & Treatment Advisory
              </h1>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Diagnose crop pathogens in real-time with high-accuracy computer vision.
                Receive tailored biological, chemical, and cultural remedies calibrated
                for field health.
              </p>
            </div>

            {/* Action CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={isAuthenticated ? '/scan' : '/auth?mode=register'}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-8 py-4 rounded-2xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-base shadow-md shadow-agri-900/15 transition-all hover:scale-[1.02] active:scale-[0.98] touch-target"
              >
                <Scan className="w-5 h-5 text-white" />
                <span>{isAuthenticated ? 'Launch Field Scanner' : 'Start Instant Scan'}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              <Link
                to="/guide"
                className="glass-frost-pill w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-4 rounded-2xl text-slate-800 hover:text-slate-950 font-semibold text-base transition-all hover:scale-[1.02] active:scale-[0.98] touch-target"
              >
                <BookOpen className="w-5 h-5 text-agri-700" />
                <span>Browse Disease Guide</span>
              </Link>
            </div>

            {/* Trust Indicators / Quick Metrics */}
            <div className="pt-6 border-t border-white/60 grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left max-w-3xl mx-auto">
              <div className="glass-frost-subtle flex items-center space-x-3 p-3.5 rounded-2xl">
                <div className="w-9 h-9 rounded-xl glass-frost-pill text-emerald-700 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Real-Time Scan</div>
                  <div className="text-[11px] text-slate-600">Live camera frame inference</div>
                </div>
              </div>

              <div className="glass-frost-subtle flex items-center space-x-3 p-3.5 rounded-2xl">
                <div className="w-9 h-9 rounded-xl glass-frost-pill text-emerald-700 flex items-center justify-center shrink-0">
                  <Leaf className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Groundnut Classes</div>
                  <div className="text-[11px] text-slate-600">Early/late spot, rust, chlorosis</div>
                </div>
              </div>

              <div className="glass-frost-subtle flex items-center space-x-3 p-3.5 rounded-2xl">
                <div className="w-9 h-9 rounded-xl glass-frost-pill text-emerald-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Multi-Tier Remedies</div>
                  <div className="text-[11px] text-slate-600">Organic, chemical, cultural</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature Highlights Matrix with Reference Frosted Glass Aesthetic */}
        <motion.div variants={itemVariants} className="relative">
          {/* Ambient colorful blurred orbs shining through the 3 cards (matching reference image) */}
          <div className="absolute -top-12 left-8 w-72 h-72 bg-gradient-to-br from-emerald-400/30 to-teal-300/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -top-8 left-1/3 w-72 h-72 bg-gradient-to-br from-amber-400/30 to-orange-300/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -top-12 right-8 w-72 h-72 bg-gradient-to-br from-cyan-400/30 to-indigo-400/25 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
            {/* Card 1: Instant Camera Scanner */}
            <Link
              to={isAuthenticated ? '/scan' : '/auth?mode=register'}
              className="glass-frost rounded-[28px] p-7 flex flex-col space-y-4 hover:shadow-[0_25px_50px_-12px_rgba(20,83,45,0.12),inset_0_1px_1px_rgba(255,255,255,1)] hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl glass-frost-pill flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform bg-gradient-to-br from-emerald-100/80 to-white/60">
                  <Scan className="w-6 h-6 text-emerald-700" />
                </div>
                <div className="w-9 h-9 rounded-xl glass-frost-pill flex items-center justify-center text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight group-hover:text-emerald-950 transition-colors">
                  Instant Camera Scanner
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Point your camera directly at groundnut leaves to detect infections with bounding box localization and confidence ratings.
                </p>
              </div>
            </Link>

            {/* Card 2: Targeted Remedies */}
            <Link
              to="/guide"
              className="glass-frost rounded-[28px] p-7 flex flex-col space-y-4 hover:shadow-[0_25px_50px_-12px_rgba(20,83,45,0.12),inset_0_1px_1px_rgba(255,255,255,1)] hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl glass-frost-pill flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform bg-gradient-to-br from-amber-100/80 to-white/60">
                  <BookOpen className="w-6 h-6 text-amber-700" />
                </div>
                <div className="w-9 h-9 rounded-xl glass-frost-pill flex items-center justify-center text-slate-400 group-hover:text-amber-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight group-hover:text-amber-950 transition-colors">
                  Targeted Remedies
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Actionable recommendations categorized by organic biocontrol, chemical fungicides, and preventive field cultural practices.
                </p>
              </div>
            </Link>

            {/* Card 3: Diagnosis History */}
            <Link
              to={isAuthenticated ? '/history' : '/auth?mode=register'}
              className="glass-frost rounded-[28px] p-7 flex flex-col space-y-4 hover:shadow-[0_25px_50px_-12px_rgba(20,83,45,0.12),inset_0_1px_1px_rgba(255,255,255,1)] hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl glass-frost-pill flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform bg-gradient-to-br from-cyan-100/80 to-white/60">
                  <History className="w-6 h-6 text-teal-700" />
                </div>
                <div className="w-9 h-9 rounded-xl glass-frost-pill flex items-center justify-center text-slate-400 group-hover:text-teal-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight group-hover:text-teal-950 transition-colors">
                  Diagnosis History
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Keep a structured log of confirmed field inspections with photographic evidence and timeline tracking across your crops.
                </p>
              </div>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LandingPage;
