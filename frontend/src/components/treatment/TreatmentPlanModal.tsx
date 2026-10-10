import React, { useState } from 'react';
import {
  X,
  Sprout,
  FlaskConical,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { Remedy } from '../../types';

interface TreatmentPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  diseaseName: string;
  diseaseId: string;
  scientificName?: string | null;
  confidenceScore: number;
  remedies: Remedy[];
}

export const TreatmentPlanModal: React.FC<TreatmentPlanModalProps> = ({
  isOpen,
  onClose,
  diseaseName,
  diseaseId,
  scientificName,
  confidenceScore,
  remedies,
}) => {
  const [activeTab, setActiveTab] = useState<'organic' | 'chemical' | 'preventive'>('organic');

  if (!isOpen) return null;

  const isHealthy = diseaseName.toLowerCase().includes('healthy');

  const safeRemedies = Array.isArray(remedies) ? remedies : [];

  // Group remedies
  const organicRemedies = safeRemedies.filter(
    (r) =>
      r.category.toLowerCase().includes('organic') ||
      r.category.toLowerCase().includes('biological')
  );
  const chemicalRemedies = safeRemedies.filter(
    (r) =>
      r.category.toLowerCase().includes('chemical') ||
      r.category.toLowerCase().includes('fungicide')
  );
  const preventiveRemedies = safeRemedies.filter(
    (r) =>
      r.category.toLowerCase().includes('cultural') ||
      r.category.toLowerCase().includes('preventive')
  );

  return (
    <div className="fixed inset-0 z-[110] overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 text-slate-900">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors touch-target"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-agri-400">
              Agronomic Treatment Advisory
            </span>
            <h3 className="text-xl sm:text-2xl font-normal tracking-tight">{diseaseName}</h3>
            {scientificName && (
              <p className="text-xs italic text-slate-300 font-mono">{scientificName}</p>
            )}
          </div>

          <div className="flex items-center space-x-3 mt-4 pt-3 border-t border-slate-800 text-xs">
            <span className="text-slate-300">Confidence:</span>
            <span className="font-mono font-bold text-agri-400">
              {(confidenceScore * 100).toFixed(1)}%
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">Catalogue Key:</span>
            <span className="font-mono text-slate-400">{diseaseId}</span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            onClick={() => setActiveTab('organic')}
            className={`py-3.5 px-3 flex items-center justify-center space-x-1.5 transition-colors border-b-2 ${
              activeTab === 'organic'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span className="truncate">Organic & Biological</span>
          </button>

          <button
            onClick={() => setActiveTab('chemical')}
            className={`py-3.5 px-3 flex items-center justify-center space-x-1.5 transition-colors border-b-2 ${
              activeTab === 'chemical'
                ? 'border-agri-600 text-agri-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FlaskConical className="w-4 h-4 text-agri-700" />
            <span className="truncate">Chemical Fungicide</span>
          </button>

          <button
            onClick={() => setActiveTab('preventive')}
            className={`py-3.5 px-3 flex items-center justify-center space-x-1.5 transition-colors border-b-2 ${
              activeTab === 'preventive'
                ? 'border-soil-700 text-soil-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4 text-soil-700" />
            <span className="truncate">Cultural Practice</span>
          </button>
        </div>

        {/* Modal Body / Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {isHealthy ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-emerald-900">Crop Canopy is Healthy</h4>
              <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
                No active fungal pustules, necrotic spots, or chlorotic halos detected. Continue standard agronomic irrigation, maintain weed-free crop borders, and schedule regular weekly monitoring.
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'organic' && (
                <div className="space-y-4">
                  {organicRemedies.length > 0 ? (
                    organicRemedies.map((remedy, idx) => (
                      <div
                        key={remedy.id || idx}
                        className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-emerald-950">
                            {remedy.title || remedy.treatment_name || 'Organic Bio-Control'}
                          </h4>
                          {remedy.dosage && (
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                              {remedy.dosage}
                            </span>
                          )}
                        </div>
                        {remedy.description && (
                          <p className="text-xs text-emerald-950/80 leading-relaxed">
                            {remedy.description}
                          </p>
                        )}
                        {remedy.application_instructions && (
                          <p className="text-xs text-emerald-900 leading-relaxed bg-white/60 p-2.5 rounded-xl border border-emerald-100">
                            <span className="font-semibold text-emerald-950">Application: </span>
                            {remedy.application_instructions}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                      <h4 className="text-sm font-bold text-slate-900">Bio-Control Recommendation</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Foliar spray with Trichoderma viride or Pseudomonas fluorescens at 5g/L water during early morning or overcast weather to suppress foliar mycelium expansion.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'chemical' && (
                <div className="space-y-4">
                  {chemicalRemedies.length > 0 ? (
                    chemicalRemedies.map((remedy, idx) => (
                      <div
                        key={remedy.id || idx}
                        className="p-4 rounded-2xl border border-agri-200 bg-agri-50/50 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-agri-950">
                            {remedy.title || remedy.treatment_name || 'Chemical Fungicide Treatment'}
                          </h4>
                          {remedy.dosage && (
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-agri-100 text-agri-800 font-semibold">
                              {remedy.dosage}
                            </span>
                          )}
                        </div>
                        {remedy.description && (
                          <p className="text-xs text-agri-950/80 leading-relaxed">
                            {remedy.description}
                          </p>
                        )}
                        {remedy.application_instructions && (
                          <p className="text-xs text-agri-900 leading-relaxed bg-white/60 p-2.5 rounded-xl border border-agri-100">
                            <span className="font-semibold text-agri-950">Application: </span>
                            {remedy.application_instructions}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                      <h4 className="text-sm font-bold text-slate-900">Targeted Fungicide Spray</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Apply protective contact fungicide such as Mancozeb 75% WP (2 g/L) or Chlorothalonil 75% WP (2 g/L) at the onset of initial symptoms. Repeat at 14-day intervals if wet humid conditions persist.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'preventive' && (
                <div className="space-y-4">
                  {preventiveRemedies.length > 0 ? (
                    preventiveRemedies.map((remedy, idx) => (
                      <div
                        key={remedy.id || idx}
                        className="p-4 rounded-2xl border border-soil-200 bg-soil-50/50 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-soil-950">
                            {remedy.title || remedy.treatment_name || 'Cultural & Preventive Practice'}
                          </h4>
                          {remedy.dosage && (
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-soil-100 text-soil-800 font-semibold">
                              {remedy.dosage}
                            </span>
                          )}
                        </div>
                        {remedy.description && (
                          <p className="text-xs text-soil-950/80 leading-relaxed">
                            {remedy.description}
                          </p>
                        )}
                        {remedy.application_instructions && (
                          <p className="text-xs text-soil-900 leading-relaxed bg-white/60 p-2.5 rounded-xl border border-soil-100">
                            <span className="font-semibold text-soil-950">Application: </span>
                            {remedy.application_instructions}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                      <h4 className="text-sm font-bold text-slate-900">Crop Sanitation & Spacing</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Maintain 30×10 cm optimum planting distance for aeration, destroy post-harvest crop stubbles, rotate with non-leguminous crops like sorghum or pearl millet for 2 seasons.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span className="font-mono text-[11px]">Always wear protective gear during spraying</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors touch-target"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
