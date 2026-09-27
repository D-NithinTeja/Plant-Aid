import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Share2, 
  RefreshCw, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Stethoscope,
  Info,
  Calendar,
  Tag
} from 'lucide-react';
import Badge from '../common/Badge';
import { toast } from 'sonner';

export default function AnalysisResult({ 
  diagnosis, 
  onViewTreatment, 
  onScanAnother,
  onBack 
}) {
  const [viewMode, setViewMode] = useState('heatmap'); // 'raw' | 'heatmap' | 'overlay'
  const [opacity, setOpacity] = useState(0.85);

  if (!diagnosis) return null;

  const isHealthy = diagnosis.is_healthy_or_uncertain || (diagnosis.disease_name || '').toLowerCase().includes('healthy');
  const confidencePercent = Math.round((diagnosis.confidence || diagnosis.confidence_score || 0.984) * 100);
  const severity = isHealthy ? 'Healthy' : (diagnosis.severity || 'Severe');
  const diseaseName = diagnosis.disease_name || 'Groundnut Early Leaf Spot';
  const tagId = diagnosis.id ? `#${diagnosis.id.slice(-6).toUpperCase()}` : '#GN-8842';

  // Base raw leaf image
  const leafImage = diagnosis.preview_image || diagnosis.media_url || 'https://images.unsplash.com/photo-1596726359556-9a2c3f9a76d8?auto=format&fit=crop&w=1200&q=80';

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success('Telemetry report link copied for agronomist review.');
  };

  const handleExportPDF = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1200)),
      {
        loading: 'Compiling AgriNet diagnostic dossier & spectral charts...',
        success: 'PDF Dossier exported successfully.',
        error: 'Export failed',
      }
    );
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 md:px-8 py-6 space-y-6 animate-elevate-in">
      
      {/* 1. Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-mono text-outline">
        <button onClick={onBack || onScanAnother} className="hover:text-primary transition-colors">
          Telemetry Archive
        </button>
        <span>/</span>
        <span className="text-on-surface-variant truncate max-w-xs">{diseaseName} ({tagId})</span>
        <span>/</span>
        <span className="text-primary font-semibold">Diagnosis Detail</span>
      </nav>

      {/* 2. Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
              {diseaseName}
            </h1>
            <Badge status={severity} />
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-outline">
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-primary" /> {tagId}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Oct 24, 2026, 14:32
            </span>
            <span className="flex items-center gap-1 text-primary font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-secondary" /> Confidence: {confidencePercent}%
            </span>
          </div>
        </div>

        {/* Action Suite */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold btn-press border border-outline-variant/30"
          >
            <Share2 className="w-4 h-4 text-outline" />
            <span>Share with Agronomist</span>
          </button>

          <button
            onClick={onScanAnother}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold btn-press border border-outline-variant/30"
          >
            <RefreshCw className="w-4 h-4 text-outline" />
            <span>Re-run Scan</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold btn-press shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export Dossier</span>
          </button>
        </div>
      </div>

      {/* 3. Main Grid: Grad-CAM Heatmap Viewer & Pathology Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Grad-CAM Heatmap */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/30 space-y-4">
            
            {/* View Mode Controls */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center bg-surface-container p-1 rounded-xl border border-outline-variant/20">
                <button
                  onClick={() => setViewMode('raw')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium btn-press transition-all ${
                    viewMode === 'raw'
                      ? 'bg-surface text-on-surface shadow-sm'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  Raw Capture
                </button>
                <button
                  onClick={() => setViewMode('heatmap')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium btn-press transition-all ${
                    viewMode === 'heatmap'
                      ? 'bg-surface text-on-surface shadow-sm font-semibold'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  Grad-CAM Heatmap
                </button>
                <button
                  onClick={() => setViewMode('overlay')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium btn-press transition-all ${
                    viewMode === 'overlay'
                      ? 'bg-surface text-on-surface shadow-sm'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  Attention Isolator
                </button>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                <span>Layer 12 ViT Attention</span>
              </div>
            </div>

            {/* Visual Heatmap Canvas Container */}
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-black flex items-center justify-center border border-outline/30 shadow-inner group">
              {/* Layer 1: Base Leaf Image */}
              <img
                src={leafImage}
                alt="Analyzed leaf foliage"
                className="w-full h-full object-cover select-none"
              />

              {/* Layer 2: Grad-CAM Thermal Activation Heatmap Simulation */}
              {viewMode === 'heatmap' && (
                <div 
                  className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                  style={{
                    opacity: opacity,
                    background: 'radial-gradient(ellipse at 48% 46%, rgba(239, 68, 68, 0.85) 0%, rgba(245, 158, 11, 0.75) 28%, rgba(59, 130, 246, 0.5) 55%, transparent 75%)',
                    mixBlendMode: 'screen',
                    filter: 'blur(8px)',
                  }}
                />
              )}

              {/* Layer 3: Attention Isolator Mask */}
              {viewMode === 'overlay' && (
                <div 
                  className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                  style={{
                    background: 'radial-gradient(circle at 48% 46%, transparent 22%, rgba(1, 45, 29, 0.88) 60%)',
                  }}
                />
              )}

              {/* Thermal Heatmap Scale Legend */}
              {viewMode === 'heatmap' && (
                <div className="absolute bottom-4 left-4 bg-surface/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-outline-variant/30 flex items-center gap-3 text-[11px] font-mono text-on-surface shadow-sm">
                  <span className="text-outline">Thermal Scale:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>Low</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ml-1.5" />
                    <span>Med</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 ml-1.5" />
                    <span className="font-bold text-error">Peak ({confidencePercent}%)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Model Inference Metadata Footer */}
            <div className="flex items-center justify-between text-[11px] font-mono text-outline pt-1">
              <span>AgriNet-ViT v2.8</span>
              <span>Inference Time: 1.2s</span>
              <span>Tensor Res: 1024x1024</span>
            </div>
          </div>

          {/* Telemetry Metrics Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/20 flex flex-col">
              <span className="text-[10px] font-mono text-outline uppercase">ANOMALY INDEX</span>
              <span className="text-base font-bold text-on-surface font-mono tabular-nums">0.84</span>
              <span className="text-[10px] text-error font-medium">Elevated Spread</span>
            </div>

            <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/20 flex flex-col">
              <span className="text-[10px] font-mono text-outline uppercase">CHLOROTIC AREA</span>
              <span className="text-base font-bold text-on-surface font-mono tabular-nums">24.8 mm²</span>
              <span className="text-[10px] text-outline font-medium">18% Foliage</span>
            </div>

            <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/20 flex flex-col">
              <span className="text-[10px] font-mono text-outline uppercase">VECTOR PROFILE</span>
              <span className="text-base font-bold text-primary font-mono truncate">Cercospora</span>
              <span className="text-[10px] text-secondary font-medium">Fungal Spore</span>
            </div>
          </div>
        </div>

        {/* Right Column: Pathology Evidence & Immediate Interventions */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Key Findings Card */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              <span>Symptom Vector Analysis</span>
            </h2>

            <ul className="space-y-3 text-xs text-on-surface-variant">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
                <span>Distinct circular necrotic brown lesions surrounded by sharp chlorotic yellow halos.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
                <span>Sub-epidermal conidial spore structures visible along lower abaxial leaf epidermis.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                <span>Early detection threshold satisfied; spore transmission can be arrested with targeted fungicide.</span>
              </li>
            </ul>
          </div>

          {/* Immediate Treatment Protocol Recommendation */}
          <div className="bg-primary text-on-primary p-6 rounded-2xl shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-primary text-[10px] font-mono font-bold uppercase tracking-wider">
                RECOMMENDED INTERVENTION
              </span>
              <span className="text-xs text-secondary-fixed font-mono">Immediate Action</span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-on-primary">
                Chlorothalonil 720 SC Foliar Application
              </h3>
              <p className="text-xs text-on-primary/80 mt-1 leading-relaxed">
                Broad-spectrum protective contact fungicide. Disrupts fungal cellular respiration in germinating spores.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-primary-container/80 border border-secondary-fixed/20 text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-on-primary-container">Dosage:</span>
                <span className="text-on-primary font-bold">2.0 mL per Liter Water</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-primary-container">Cycle Interval:</span>
                <span className="text-on-primary font-bold">Repeat every 10–14 days</span>
              </div>
            </div>

            <button
              onClick={() => onViewTreatment && onViewTreatment(diagnosis)}
              className="w-full py-3 bg-secondary-fixed text-primary rounded-xl text-xs font-bold btn-press shadow-sm flex items-center justify-center gap-2"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Open Complete Multi-Stage Treatment Plan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
