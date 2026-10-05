import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Upload,
  ArrowRight,
  Camera,
  Compass,
  GraduationCap,
  Users,
  Award,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/utils';

const QUICK_DISEASES = [
  {
    slug: 'early_leaf_spot',
    name: 'Early Leaf Spot',
    category: 'Fungal',
    scientific: 'Cercospora arachidicola',
    image: '/images/diseases/early_leaf_spot.jpg',
  },
  {
    slug: 'late_leaf_spot',
    name: 'Late Leaf Spot',
    category: 'Fungal',
    scientific: 'Phaeoisariopsis personata',
    image: '/images/diseases/late_leaf_spot.jpg',
  },
  {
    slug: 'rust',
    name: 'Groundnut Rust',
    category: 'Fungal',
    scientific: 'Puccinia arachidis',
    image: '/images/diseases/rust.jpg',
  },
  {
    slug: 'early_rust',
    name: 'Early Rust',
    category: 'Fungal',
    scientific: 'Speckled Pustules',
    image: '/images/diseases/early_rust.jpg',
  },
  {
    slug: 'nutrition_deficiency',
    name: 'Nutritional Chlorosis',
    category: 'Abiotic',
    scientific: 'Iron & Zinc Chlorosis',
    image: '/images/diseases/nutrition_deficiency.jpg',
  },
  {
    slug: 'healthy_leaf',
    name: 'Healthy Baseline',
    category: 'Healthy',
    scientific: 'Arachis hypogaea',
    image: '/images/diseases/healthy_leaf.jpg',
  },
];

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const displayName = user?.user_name || 'Field Agronomist';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-[calc(100vh-4rem)] bg-transparent py-8 px-4 sm:px-6 lg:px-8 font-sans"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Cockpit Horizon Header Surface */}
        <Card
          glass
          className="relative overflow-hidden p-6 sm:p-8 backdrop-blur-xl border border-white/80 shadow-[0_10px_35px_-5px_rgba(20,83,45,0.08),0_1px_3px_rgba(0,0,0,0.03)] ring-1 ring-emerald-950/5"
        >
          {/* Subtle Ambient Botanical Glow Accents */}
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-200/40 to-agri-300/10 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute left-1/3 -bottom-20 h-48 w-48 rounded-full bg-emerald-100/30 blur-2xl"
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-emerald-50/80 border border-emerald-200/70 text-emerald-800 backdrop-blur-md shadow-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                  </span>
                  <span>Scanner Ready</span>
                </div>
              </div>

              {/* Title of Project */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800/80 mb-1">
                  Project Title
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-[2rem] font-extrabold tracking-tight text-slate-900 font-sans leading-tight">
                  Plant-Aid: Real-Time Plant Disease Identification &amp; Treatment Recommendation System
                </h1>
              </div>

              <div className="pt-0.5">
                <p className="text-sm font-semibold text-slate-700">
                  Welcome back, <span className="text-emerald-900 font-bold">{displayName}</span>!
                </p>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-xl mt-0.5">
                  Real-time edge-ready artificial intelligence crop diagnostic and treatment advisory platform calibrated for groundnut pathology with dual-layer localization.
                </p>
              </div>
            </div>

            {/* Tactical Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10 flex-shrink-0">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-emerald-700 to-agri-700 hover:from-emerald-800 hover:to-agri-800 text-white shadow-[0_4px_16px_rgba(21,128,61,0.28)] hover:shadow-[0_6px_22px_rgba(21,128,61,0.36)] transition-all hover:-translate-y-0.5 active:translate-y-0 font-bold"
              >
                <Link to="/scan" className="flex items-center justify-center space-x-2">
                  <Camera className="w-5 h-5" />
                  <span>Launch Live Scanner</span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-white/80 hover:bg-white text-slate-800 hover:text-emerald-900 border border-emerald-950/15 hover:border-emerald-600/40 backdrop-blur-md shadow-xs transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <Link to="/scan?mode=upload" className="flex items-center justify-center space-x-2">
                  <Upload className="w-4 h-4 text-emerald-700" />
                  <span>Upload Specimen</span>
                </Link>
              </Button>
            </div>
          </div>
        </Card>

        {/* Project Authors & Academic Guidance Surface */}
        <Card
          glass
          className="relative overflow-hidden p-6 sm:p-7 backdrop-blur-xl border border-white/80 shadow-[0_10px_35px_-5px_rgba(20,83,45,0.08),0_1px_3px_rgba(0,0,0,0.03)] ring-1 ring-emerald-950/5 space-y-5"
        >
          {/* Subtle Ambient Glow */}
          <div
            className="pointer-events-none absolute -right-12 -bottom-12 h-48 w-48 rounded-full bg-emerald-100/30 blur-2xl"
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between border-b border-emerald-950/10 pb-4 gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center border border-emerald-200/60 shadow-xs">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight uppercase font-sans">
                  Project Team &amp; Academic Supervision
                </h2>
                <p className="text-[11px] text-slate-500">
                  Engineering Contributors &amp; Course Faculty Mentorship
                </p>
              </div>
            </div>
            <Badge variant="outline" className="self-start sm:self-auto text-[11px] bg-white/70">
              Department of Information Technology
            </Badge>
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Team Members Column */}
            <div className="lg:col-span-8 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-agri-900/70 flex items-center space-x-1.5">
                <span>Team Members</span>
                <span className="text-[10px] text-slate-400 font-normal">(Students)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Member 1: Donthula Nithin Teja */}
                <div className="p-3.5 rounded-2xl bg-white/75 border border-emerald-950/10 shadow-xs hover:border-emerald-500/30 transition-all backdrop-blur-md flex flex-col justify-between space-y-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-agri-800 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 select-none">
                      NT
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate" title="Donthula Nithin Teja">
                        Donthula Nithin Teja
                      </div>
                      <div className="text-[10px] text-slate-500">Student Developer</div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Roll No</span>
                    <Badge variant="outline" className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50/70 border-emerald-300/80">
                      241IT028
                    </Badge>
                  </div>
                </div>

                {/* Member 2: Ghanta Bhavana Sri Sai */}
                <div className="p-3.5 rounded-2xl bg-white/75 border border-emerald-950/10 shadow-xs hover:border-emerald-500/30 transition-all backdrop-blur-md flex flex-col justify-between space-y-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-800 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 select-none">
                      BS
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate" title="Ghanta Bhavana Sri Sai">
                        Ghanta Bhavana Sri Sai
                      </div>
                      <div className="text-[10px] text-slate-500">Student Developer</div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Roll No</span>
                    <Badge variant="outline" className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50/70 border-emerald-300/80">
                      242IT029
                    </Badge>
                  </div>
                </div>

                {/* Member 3: Yash Roshan */}
                <div className="p-3.5 rounded-2xl bg-white/75 border border-emerald-950/10 shadow-xs hover:border-emerald-500/30 transition-all backdrop-blur-md flex flex-col justify-between space-y-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-600 to-teal-800 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 select-none">
                      YR
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate" title="Yash Roshan">
                        Yash Roshan
                      </div>
                      <div className="text-[10px] text-slate-500">Student Developer</div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Roll No</span>
                    <Badge variant="outline" className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50/70 border-emerald-300/80">
                      241IT083
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Instructor Column */}
            <div className="lg:col-span-4 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-agri-900/70 flex items-center space-x-1.5">
                <span>Course Instructor</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50/90 to-white/80 border border-emerald-200/80 shadow-xs hover:border-emerald-400/50 transition-all backdrop-blur-md flex flex-col justify-between space-y-3 h-[calc(100%-1.75rem)]">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold text-slate-900 truncate">
                      Prof. Jaidhar C. D.
                    </div>
                    <div className="text-[11px] font-medium text-emerald-800">
                      Course Faculty &amp; Project Mentor
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-100/80 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Supervision</span>
                  <Badge variant="optimal" className="text-[11px] font-semibold">
                    <Award className="w-3 h-3 text-emerald-700 mr-0.5" />
                    <span>Academic Guide</span>
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Disease Spotter Section */}
        <Card
          glass
          className="relative overflow-hidden p-6 sm:p-7 backdrop-blur-xl border border-white/80 shadow-[0_10px_35px_-5px_rgba(20,83,45,0.08),0_1px_3px_rgba(0,0,0,0.03)] ring-1 ring-emerald-950/5 space-y-5"
        >
          {/* Subtle ambient blur */}
          <div
            className="pointer-events-none absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-emerald-100/30 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative z-10 flex items-center justify-between border-b border-emerald-950/10 pb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-800 flex items-center justify-center border border-emerald-200/60 shadow-xs">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight uppercase font-sans">
                  Groundnut Pathology Quick Spotter
                </h2>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Common groundnut conditions and diseases (6 classes)
                </p>
              </div>
            </div>
            <Link
              to="/guide"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/60 transition-colors"
            >
              <span>Explore all classes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {QUICK_DISEASES.map((d) => (
              <Link
                key={d.slug}
                to="/guide"
                className="group relative flex flex-col justify-between p-2.5 rounded-2xl bg-white/75 hover:bg-white border border-emerald-950/10 hover:border-emerald-500/40 shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 backdrop-blur-md overflow-hidden"
              >
                {/* Specimen Thumbnail with category chip */}
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-100 border border-emerald-950/10 mb-2.5">
                  <img
                    src={d.image}
                    alt={d.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute top-1.5 left-1.5">
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-wide uppercase backdrop-blur-md shadow-xs border',
                        d.category === 'Healthy'
                          ? 'bg-emerald-950/80 text-emerald-200 border-emerald-400/30'
                          : d.category === 'Abiotic'
                          ? 'bg-amber-950/80 text-amber-200 border-amber-400/30'
                          : 'bg-slate-900/80 text-rose-200 border-rose-400/30'
                      )}
                    >
                      {d.category}
                    </span>
                  </div>
                </div>

                {/* Title & Micro details */}
                <div className="space-y-0.5 px-0.5">
                  <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-800 transition-colors truncate">
                    {d.name}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate italic text-[10px] text-slate-400">
                      {d.scientific}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        {/* Bottom Left Corner Copyright Claim */}
        <div className="pt-2 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 gap-2">
          <div className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white/70 backdrop-blur-md border border-emerald-950/10 shadow-xs text-slate-600 font-medium select-none">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>&copy; {new Date().getFullYear()} Plant-Aid. All rights reserved.</span>
          </div>

          <div className="text-[11px] text-slate-400 font-medium pl-1 sm:pl-0">
            Groundnut Foliar Diagnostic &amp; Treatment Advisory System
          </div>
        </div>
      </div>

      {/* Persistent Bottom-Left Corner Copyright Claim Tag */}
      <div className="fixed bottom-4 left-4 sm:left-6 z-40 pointer-events-none">
        <div className="glass-frost px-3.5 py-1.5 rounded-full border border-white/80 shadow-md text-[11px] text-slate-700 backdrop-blur-xl font-medium select-none pointer-events-auto flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span>&copy; {new Date().getFullYear()} Plant-Aid. All rights reserved.</span>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
