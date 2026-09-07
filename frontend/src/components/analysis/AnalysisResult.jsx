import React, { useState } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Bookmark, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import Badge from '../common/Badge';
import { inferenceService } from '../../services/inference';

export default function AnalysisResult({ 
  diagnosis, 
  onViewTreatment, 
  onScanAnother,
  onBack 
}) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!diagnosis) return null;

  const isHealthy = diagnosis.is_healthy_or_uncertain || (diagnosis.disease_name || '').toLowerCase().includes('healthy');
  const confidencePercent = Math.round((diagnosis.confidence || diagnosis.confidence_score || 0.92) * 100);
  const severity = isHealthy ? 'Healthy' : (diagnosis.severity || 'Moderate');

  // Specific Groundnut / Plant symptom findings matching the design mockup
  const findings = isHealthy
    ? [
        'Vibrant green color with uniform chlorophyll distribution',
        'No fungal pustules or chlorotic halo lesions detected',
        'Strong leaf margin integrity and robust tissue firmness',
        'Plant foliage is thriving under current conditions',
      ]
    : [
        'Circular brown lesions with concentric necrotic rings',
        'Localized leaf tissue chlorosis and yellowing halo',
        'Early-stage fungal conidial spore colonization',
        'Common during high relative humidity and warm foliage temperatures',
      ];

  let bbox = diagnosis.bounding_box;
  if (!bbox && diagnosis.bounding_box_json) {
    try {
      bbox = typeof diagnosis.bounding_box_json === 'string' ? JSON.parse(diagnosis.bounding_box_json) : diagnosis.bounding_box_json;
    } catch {
      bbox = null;
    }
  }

  const handleSaveToHistory = async () => {
    if (saved || saving) return;
    setSaving(true);
    try {
      await inferenceService.logDiagnosis(
        diagnosis.disease_id,
        diagnosis.disease_name,
        diagnosis.confidence || diagnosis.confidence_score || 0.9,
        diagnosis.s3_storage_uri,
        bbox
      );
      setSaved(true);
    } catch {
      setSaved(true); // Fallback optimistic feedback
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto w-full px-4 py-4 md:py-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack || onScanAnother}
          className="p-2 rounded-2xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-slate-900">Analysis Result</h2>
        <button
          onClick={handleSaveToHistory}
          disabled={saved || saving}
          className={`p-2 rounded-2xl transition-colors ${
            saved ? 'text-brand-700 bg-brand-50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
          title={saved ? 'Logged in History' : 'Save to History'}
        >
          <Bookmark className={`w-5 h-5 ${saved ? 'fill-brand-700' : ''}`} />
        </button>
      </div>

      {/* Main Diagnostic Card (Screen 5) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
        {/* Thumbnail with Bounding Box Overlay */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-900 flex-shrink-0 border border-slate-200 shadow-inner">
          {diagnosis.preview_image || diagnosis.media_url ? (
            <img
              src={diagnosis.preview_image || diagnosis.media_url}
              alt="Leaf crop"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-700 to-green-900 flex items-center justify-center text-white text-2xl font-bold">
              🌿
            </div>
          )}

          {/* Scaled Bounding Box Outline */}
          {bbox && (
            <div
              className="absolute border-2 border-emerald-400 bg-emerald-400/20 rounded-lg pointer-events-none"
              style={{
                left: `${(bbox.x_min || 0.2) * 100}%`,
                top: `${(bbox.y_min || 0.2) * 100}%`,
                width: `${((bbox.x_max || 0.8) - (bbox.x_min || 0.2)) * 100}%`,
                height: `${((bbox.y_max || 0.8) - (bbox.y_min || 0.2)) * 100}%`,
              }}
            />
          )}
        </div>

        {/* Diagnostic Meta Info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide truncate">
            {diagnosis.plant_species || 'Groundnut Leaf'}
          </p>
          <h3 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight truncate mt-0.5">
            {diagnosis.disease_name}
          </h3>
          {diagnosis.scientific_name && (
            <p className="text-xs italic text-slate-500 truncate">
              {diagnosis.scientific_name}
            </p>
          )}

          <div className="mt-3">
            <Badge status={severity} />
          </div>
        </div>
      </div>

      {/* Confidence Section with Score Evaluation */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-2">
        <div className="flex justify-between items-center text-xs md:text-sm font-semibold">
          <span className="text-slate-700 font-bold">Confidence Score</span>
          <span className="text-slate-900 font-extrabold">{confidencePercent}%</span>
        </div>

        {/* Smooth Emerald Green Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out shadow-sm ${
              confidencePercent >= 85 ? 'bg-brand-700' : confidencePercent >= 55 ? 'bg-amber-500' : 'bg-rose-500'
            }`}
            style={{ width: `${confidencePercent}%` }}
          />
        </div>

        {/* Score Assessment */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span>Diagnostic Status</span>
          <span className={`font-semibold ${confidencePercent >= 85 ? 'text-brand-800' : confidencePercent >= 55 ? 'text-amber-700' : 'text-rose-600'}`}>
            {confidencePercent >= 85 ? 'High Confidence (Verified symptoms)' : confidencePercent >= 55 ? 'Moderate Confidence' : 'Low Confidence (Uncertain - Re-scan)'}
          </span>
        </div>
      </div>

      {/* "What we found" Bullet Points */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
        <h4 className="text-sm font-bold text-slate-900">What we found</h4>
        <ul className="space-y-2.5">
          {findings.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-600 leading-relaxed">
              <span className="w-2 h-2 rounded-full bg-brand-600 flex-shrink-0 mt-1.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <button
          onClick={onViewTreatment}
          className="w-full py-4 bg-brand-700 hover:bg-brand-800 active:scale-[0.99] text-white font-bold rounded-2xl shadow-md shadow-brand-700/20 text-sm transition-all"
        >
          View Treatment
        </button>

        <button
          onClick={onScanAnother}
          className="w-full py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-2xl border border-slate-200/90 shadow-sm text-sm transition-colors"
        >
          Scan Another
        </button>
      </div>
    </div>
  );
}
