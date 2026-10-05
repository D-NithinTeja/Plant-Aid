import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Scan,
  Upload,
  History,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Compass,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { HistoryLog, PaginatedHistoryResponse } from '../types';
import { Surface } from '../components/ui/Surface';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

const QUICK_DISEASES = [
  { slug: 'early_leaf_spot', name: 'Early Leaf Spot', image: '/images/diseases/early_leaf_spot.jpg' },
  { slug: 'late_leaf_spot', name: 'Late Leaf Spot', image: '/images/diseases/late_leaf_spot.jpg' },
  { slug: 'rust', name: 'Groundnut Rust', image: '/images/diseases/rust.jpg' },
  { slug: 'early_rust', name: 'Early Rust', image: '/images/diseases/early_rust.jpg' },
  { slug: 'nutrition_deficiency', name: 'Nutritional Chlorosis', image: '/images/diseases/nutrition_deficiency.jpg' },
  { slug: 'healthy_leaf', name: 'Healthy Baseline', image: '/images/diseases/healthy_leaf.jpg' },
];

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [historyItems, setHistoryItems] = useState<HistoryLog[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRecentHistory = async () => {
      try {
        const res = await api.get<PaginatedHistoryResponse>('/api/history?page=1&limit=4');
        setHistoryItems(res.data.items || []);
        setTotalCount(res.data.total ?? res.data.total_count ?? 0);
      } catch (err) {
        console.error('Failed to load recent history logs', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentHistory();
  }, []);

  const healthyCount = historyItems.filter((i) => i.disease_id.includes('healthy')).length;
  const infectedCount = historyItems.length - healthyCount;
  const displayName = user?.user_name || 'Field Agronomist';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-transparent py-8 px-4 sm:px-6 lg:px-8 font-sans"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Cockpit Horizon Header Surface */}
        <Surface className="p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center space-x-2">
                <Badge variant="optimal">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Field Station Online &bull; τ = 0.55 Calibrated</span>
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                Welcome back, {displayName}
              </h1>

              <p className="text-slate-600 text-sm leading-relaxed">
                Edge diagnostic console for Groundnut (<em>Arachis hypogaea</em>). Continuous HSV foliage isolation, lesion localization, and immediate bio-chemical remedy guidance.
              </p>
            </div>

            {/* Tactical Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button asChild size="lg" className="shadow-md">
                <Link to="/scan" className="flex items-center justify-center space-x-2">
                  <Camera className="w-5 h-5" />
                  <span>Launch Live Scanner</span>
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg">
                <Link to="/scan?mode=upload" className="flex items-center justify-center space-x-2">
                  <Upload className="w-4 h-4 text-agri-700" />
                  <span>Upload Specimen</span>
                </Link>
              </Button>
            </div>
          </div>
        </Surface>

        {/* Unified Telemetry Horizon Strip (Zero Disconnected Number Cards) */}
        <Surface className="p-6 overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-emerald-950/10">
            {/* Stat 1 */}
            <div className="p-4 sm:p-6 space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Field Logs</span>
                <Activity className="w-4 h-4 text-agri-700" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                {totalCount}
              </div>
              <p className="text-[11px] text-slate-500">Persisted farm records</p>
            </div>

            {/* Stat 2 */}
            <div className="p-4 sm:p-6 space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Healthy Canopy</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-700 font-mono tracking-tight">
                {healthyCount}
              </div>
              <p className="text-[11px] text-slate-500">Normal leaves recorded</p>
            </div>

            {/* Stat 3 */}
            <div className="p-4 sm:p-6 space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Active Pathologies</span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl font-extrabold text-amber-700 font-mono tracking-tight">
                {infectedCount}
              </div>
              <p className="text-[11px] text-slate-500">Fungal or chlorotic alerts</p>
            </div>

            {/* Stat 4 */}
            <div className="p-4 sm:p-6 space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Taxonomy Engine</span>
                <BookOpen className="w-4 h-4 text-agri-700" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                6 Classes
              </div>
              <p className="text-[11px] text-slate-500">Groundnut disease models</p>
            </div>
          </div>
        </Surface>

        {/* Quick Disease Spotter Carousel Strip */}
        <Surface className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-950/10 pb-3">
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-agri-700" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Groundnut Pathology Quick Spotter
              </h2>
            </div>
            <Link
              to="/guide"
              className="text-xs font-semibold text-agri-700 hover:text-agri-800 flex items-center space-x-1"
            >
              <span>Explore all classes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
            {QUICK_DISEASES.map((d) => (
              <Link
                key={d.slug}
                to={`/guide`}
                className="group p-2.5 rounded-xl bg-white/50 hover:bg-white/80 border border-white/60 transition-all text-center space-y-2 shadow-xs"
              >
                <div className="aspect-square w-full rounded-lg overflow-hidden bg-slate-100 border border-emerald-950/10">
                  <img
                    src={d.image}
                    alt={d.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="text-xs font-bold text-slate-800 truncate group-hover:text-agri-800">
                  {d.name}
                </div>
              </Link>
            ))}
          </div>
        </Surface>

        {/* Operations Hub: Scanner Station (Left) & Recent Diagnoses Stream (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Quick Actions Workflow Console (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Surface className="p-6 sm:p-8 space-y-6">
              <div className="space-y-1 border-b border-emerald-950/10 pb-4">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Field Station Operations
                </h2>
                <p className="text-xs text-slate-500">
                  Direct hardware access, diagnostic history, and disease management
                </p>
              </div>

              <div className="space-y-3">
                <Link
                  to="/scan"
                  className="group p-4 rounded-xl bg-white/60 hover:bg-white/90 border border-emerald-950/10 flex items-center justify-between transition-all shadow-xs"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-agri-100 text-agri-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900">Real-Time Foliage Scanner</div>
                      <div className="text-xs text-slate-500">1.5s stream with HSV lesion bounding box</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-agri-700 transition-colors flex-shrink-0" />
                </Link>

                <Link
                  to="/history"
                  className="group p-4 rounded-xl bg-white/60 hover:bg-white/90 border border-emerald-950/10 flex items-center justify-between transition-all shadow-xs"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <History className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900">Diagnosis History Logs</div>
                      <div className="text-xs text-slate-500">Review saved records and Grad-CAM heatmaps</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-colors flex-shrink-0" />
                </Link>

                <Link
                  to="/guide"
                  className="group p-4 rounded-xl bg-white/60 hover:bg-white/90 border border-emerald-950/10 flex items-center justify-between transition-all shadow-xs"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-soil-100 text-soil-900 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900">Disease Treatment Guide</div>
                      <div className="text-xs text-slate-500">Organic bio-fungicides & spray dosages</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-soil-700 transition-colors flex-shrink-0" />
                </Link>
              </div>
            </Surface>
          </div>

          {/* Right: Recent Field Diagnoses Feed (7 cols) */}
          <div className="lg:col-span-7">
            <Surface className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-emerald-950/10 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                    Recent Field Activity
                  </h2>
                  <p className="text-xs text-slate-500">
                    Confirmed diagnoses logged to your farm database
                  </p>
                </div>
                <Link
                  to="/history"
                  className="text-xs font-semibold text-agri-700 hover:text-agri-800 flex items-center space-x-1"
                >
                  <span>View all records</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loading ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Loading farm inspection records...
                </div>
              ) : historyItems.length === 0 ? (
                <div className="py-12 text-center space-y-3 bg-white/40 rounded-2xl border border-dashed border-emerald-950/10">
                  <div className="w-12 h-12 rounded-2xl bg-white/60 text-agri-700 flex items-center justify-center mx-auto border border-emerald-950/10">
                    <Scan className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-slate-800">No diagnoses recorded yet</div>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Point your camera at groundnut leaves to detect lesions and explicitly save verified diagnostic readings.
                  </p>
                  <div className="pt-2">
                    <Button asChild size="sm">
                      <Link to="/scan">
                        <Scan className="w-3.5 h-3.5" />
                        <span>Scan Foliage Now</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {historyItems.map((item) => {
                    const isHealthyLeaf = item.disease_id.includes('healthy');

                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl bg-white/60 border border-emerald-950/5 flex items-center justify-between gap-4 hover:bg-white/80 transition-all"
                      >
                        <div className="flex items-center space-x-3.5 min-w-0">
                          <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-emerald-950/10">
                            {item.media_url ? (
                              <img
                                src={item.media_url}
                                alt={item.disease_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Scan className="w-5 h-5 text-agri-700" />
                            )}
                          </div>

                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-sm font-bold text-slate-900 truncate">
                                {item.disease_name}
                              </h4>
                              <Badge variant={isHealthyLeaf ? 'optimal' : 'destructive'} className="text-[10px] py-0 px-2">
                                {isHealthyLeaf ? 'Healthy' : 'Pathology'}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono">
                              <span className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                <span>{new Date(item.diagnosis_timestamp).toLocaleDateString()}</span>
                              </span>
                              <span>&bull;</span>
                              <span className="text-agri-800 font-semibold">
                                {(item.confidence_score * 100).toFixed(1)}% conf
                              </span>
                            </div>
                          </div>
                        </div>

                        <Link
                          to={`/history`}
                          className="flex-shrink-0 text-xs font-semibold text-agri-800 hover:text-agri-950 px-3 py-1.5 rounded-lg bg-white/80 border border-emerald-950/10 hover:bg-white transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </Surface>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
