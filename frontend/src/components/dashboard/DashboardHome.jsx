import React, { useState, useEffect } from 'react';
import {
  Camera,
  UploadCloud,
  ChevronRight,
  ArrowRight,
  Stethoscope,
  Activity,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import Badge from '../common/Badge';
import { historyService } from '../../services/history';

export default function DashboardHome({
  user,
  onOpenScanCamera,
  onOpenScanUpload,
  onViewAllHistory,
  onSelectDiagnosis,
  onOpenTreatment
}) {
  const [recentDiagnoses, setRecentDiagnoses] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'severe'
  const [loading, setLoading] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = user?.user_name?.split(' ')[0] || 'Bhavana';

  useEffect(() => {
    async function loadRecent() {
      try {
        const data = await historyService.getHistory({ page: 1, limit: 5 });
        if (data.items && data.items.length > 0) {
          setRecentDiagnoses(data.items);
        } else {
          setRecentDiagnoses([
            {
              id: 'diag-8842',
              disease_name: 'Groundnut Early Leaf Spot',
              plant_species: 'Groundnut Leaf',
              confidence_score: 0.984,
              diagnosis_timestamp: new Date().toISOString(),
              severity: 'Severe',
              sector: 'Sector 4',
              media_url: 'https://images.unsplash.com/photo-1596726359556-9a2c3f9a76d8?auto=format&fit=crop&w=400&q=80',
            },
            {
              id: 'diag-8839',
              disease_name: 'Healthy Foliage',
              plant_species: 'Groundnut Leaf',
              confidence_score: 0.991,
              diagnosis_timestamp: new Date(Date.now() - 86400000).toISOString(),
              severity: 'Healthy',
              sector: 'Sector 2',
              media_url: null,
            },
            {
              id: 'diag-8831',
              disease_name: 'Early Rust (Puccinia)',
              plant_species: 'Groundnut Leaf',
              confidence_score: 0.887,
              diagnosis_timestamp: new Date(Date.now() - 172800000).toISOString(),
              severity: 'Moderate',
              sector: 'Sector 4',
              media_url: null,
            },
          ]);
        }
      } catch {
        setRecentDiagnoses([
          {
            id: 'diag-8842',
            disease_name: 'Groundnut Early Leaf Spot',
            plant_species: 'Groundnut Leaf',
            confidence_score: 0.984,
            diagnosis_timestamp: new Date().toISOString(),
            severity: 'Severe',
            sector: 'Sector 4',
          },
          {
            id: 'diag-8839',
            disease_name: 'Healthy Foliage',
            plant_species: 'Groundnut Leaf',
            confidence_score: 0.991,
            diagnosis_timestamp: new Date(Date.now() - 86400000).toISOString(),
            severity: 'Healthy',
            sector: 'Sector 2',
          },
          {
            id: 'diag-8831',
            disease_name: 'Early Rust (Puccinia)',
            plant_species: 'Groundnut Leaf',
            confidence_score: 0.887,
            diagnosis_timestamp: new Date(Date.now() - 172800000).toISOString(),
            severity: 'Moderate',
            sector: 'Sector 4',
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadRecent();
  }, []);

  const formatDate = (isoStr) => {
    if (!isoStr) return 'Today, 14:32';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Today, 14:32';
    }
  };

  const filteredDiagnoses = recentDiagnoses.filter((item) => {
    if (filter === 'severe') {
      return (item.severity || '').toLowerCase().includes('severe') || (item.severity || '').toLowerCase().includes('critical');
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto w-full px-4 md:px-8 py-6 md:py-8 space-y-8 animate-elevate-in">

      {/* 1. Welcome Header & Sector Telemetry (Craft Floor: honest status, no kicker labels) */}
      <section className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 z-10 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-mono text-[11px] font-medium tracking-wide">
              SECTOR 4 - NORTH RIDGE
            </span>
            <span className="text-outline font-mono text-[11px]">
              // FARM ID: PA-8849
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-bold text-on-surface tracking-tight">
            {getGreeting()}, {displayName}.
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant leading-relaxed">
            All 4 primary groundnut sectors report nominal canopy humidity. AgriNet vision models are active with enhanced early rust & spot detection.
          </p>
        </div>

        {/* Telemetry Digits */}
        <div className="flex items-center gap-3 z-10 w-full md:w-auto justify-between md:justify-start">
          <div className="px-4 py-2.5 bg-surface-container-low rounded-xl border border-outline-variant/20 flex flex-col items-end">
            <span className="text-[10px] font-mono text-outline tracking-wider uppercase">ACTIVE SCANS</span>
            <span className="text-lg md:text-xl font-bold text-primary font-mono tabular-nums">142 Today</span>
          </div>
          <div className="px-4 py-2.5 bg-surface-container-low rounded-xl border border-outline-variant/20 flex flex-col items-end">
            <span className="text-[10px] font-mono text-outline tracking-wider uppercase">RISK INDEX</span>
            <span className="text-xs font-semibold text-secondary px-2 py-0.5 bg-secondary-container rounded mt-0.5">
              LOW RISK
            </span>
          </div>
        </div>
      </section>

      {/* 2. Primary Action Hub & Quick Treatment Protocols */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Dominant Hero Scanner Card */}
        <div className="lg:col-span-8 bg-primary-container text-on-primary-container rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-md relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-secondary/40 text-secondary-fixed font-mono text-xs font-medium backdrop-blur-md">
                AI POWERED VISION v4.2
              </span>
              <span className="text-on-primary-container/80 font-mono text-xs tabular-nums">
                1.2s avg inference
              </span>
            </div>

            <h2 className="text-xl md:text-3xl font-bold text-on-primary tracking-tight">
              Diagnose a Plant Instantly
            </h2>
            <p className="text-sm md:text-base text-on-primary-container/90 max-w-lg leading-relaxed">
              Upload high-resolution foliage captures or activate your field camera to instantly identify pathogens, spore colonization, and localized rust vectors.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            {/* Live Camera Button */}
            <button
              onClick={onOpenScanCamera}
              className="flex flex-col items-center justify-center p-6 rounded-xl bg-surface/10 hover:bg-surface/20 border border-surface/20 text-on-primary btn-press backdrop-blur-md text-center group"
            >
              <Camera className="w-8 h-8 mb-2 group-hover:scale-105 transition-transform" />
              <span className="font-semibold text-base">Live Camera Capture</span>
              <span className="text-xs text-on-primary-container/80 mt-1">Open mobile sensor or webcam</span>
            </button>

            {/* Upload Button */}
            <button
              onClick={onOpenScanUpload}
              className="flex flex-col items-center justify-center p-6 rounded-xl bg-surface text-on-surface hover:bg-surface-container-lowest btn-press shadow-sm text-center group"
            >
              <UploadCloud className="w-8 h-8 text-primary mb-2 group-hover:scale-105 transition-transform" />
              <span className="font-semibold text-base text-primary">Upload Field Image</span>
              <span className="text-xs text-outline mt-1">Drag & drop or browse photos</span>
            </button>
          </div>
        </div>

        {/* Treatment Database Quick Overview */}
        <div className="lg:col-span-4 bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-on-surface flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-primary" />
                <span>Treatment Protocols</span>
              </h2>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Targeted organic and chemical interventions verified against Cercospora and Puccinia spore profiles.
            </p>

            <div className="space-y-2 pt-1">
              {[
                { name: 'Chlorothalonil 720 SC', target: 'Early Leaf Spot' },
                { name: 'Copper Hydroxide Spray', target: 'General Fungicide' },
                { name: 'Bacillus Subtilis Bio-Fungicide', target: 'Organic Vector' }
              ].map((proto, idx) => (
                <div
                  key={idx}
                  onClick={() => onOpenTreatment && onOpenTreatment(proto)}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/20 cursor-pointer btn-press transition-colors"
                >
                  <div>
                    <p className="text-xs font-semibold text-on-surface">{proto.name}</p>
                    <p className="text-[10px] text-outline">{proto.target}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-outline" />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onOpenTreatment && onOpenTreatment(null)}
            className="w-full mt-6 py-2.5 px-4 rounded-xl bg-surface-container text-on-surface text-xs font-semibold hover:bg-surface-container-high btn-press flex items-center justify-center gap-2"
          >
            <span>Browse Full Index (124 Protocols)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* 3. Recent Diagnoses Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-on-surface">Recent Diagnoses</h2>
            <p className="text-xs text-on-surface-variant">Real-time scan logs across all connected agricultural sectors.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium btn-press transition-colors ${filter === 'all'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
            >
              All Scans
            </button>
            <button
              onClick={() => setFilter('severe')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium btn-press transition-colors ${filter === 'severe'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
            >
              Severe Only
            </button>
            <button
              onClick={onViewAllHistory}
              className="text-xs font-medium text-secondary hover:underline flex items-center gap-1 ml-2"
            >
              View Archive <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Diagnosis Cards */}
        <div className="space-y-2.5">
          {filteredDiagnoses.map((item, idx) => {
            const isHealthy = (item.disease_name || '').toLowerCase().includes('healthy');
            const statusLabel = isHealthy ? 'Healthy' : item.severity || 'Moderate';
            const conf = Math.round((item.confidence_score || item.confidence || 0.94) * 100);

            return (
              <div
                key={item.id || idx}
                onClick={() => onSelectDiagnosis(item)}
                className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-secondary/50 cursor-pointer btn-press transition-all group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Visual Leaf Thumbnail */}
                  <div className="w-12 h-12 rounded-xl bg-surface-container border border-outline-variant/20 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {item.media_url ? (
                      <img src={item.media_url} alt={item.disease_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        🌿
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                        {item.disease_name}
                      </h3>
                      <Badge status={statusLabel} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-outline mt-0.5 font-mono">
                      <span>{item.sector || 'Sector 4'}</span>
                      <span>•</span>
                      <span>{formatDate(item.diagnosis_timestamp)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end md:self-center">
                  <div className="text-right">
                    <span className="text-[10px] text-outline font-mono uppercase block">Confidence</span>
                    <span className="text-xs font-bold text-primary font-mono tabular-nums">{conf}% Match</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-surface-container text-outline group-hover:text-primary group-hover:bg-primary-fixed transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
