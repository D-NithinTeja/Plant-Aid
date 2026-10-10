import React, { useState } from 'react';
import {
  X,
  Sprout,
  FlaskConical,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { Remedy } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

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
    <div
      className="fixed inset-0 z-[110] overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden border border-white/80 text-slate-900 ring-1 ring-emerald-950/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — Botanical Sage & Frosted Glass matching rest of Plant-Aid */}
        <div className="p-6 sm:p-7 bg-gradient-to-br from-[#edf4ed] via-[#f3f8f3] to-emerald-50/60 border-b border-emerald-950/10 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 hover:bg-white border border-emerald-950/10 text-slate-600 hover:text-slate-900 transition-colors shadow-xs touch-target cursor-pointer"
            aria-label="Close modal"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="space-y-1.5 pr-10">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={isHealthy ? 'optimal' : 'default'}>
                <span>Agronomic Treatment Plan</span>
              </Badge>
              <span className="text-xs font-mono font-semibold text-agri-800 bg-white/80 px-2.5 py-0.5 rounded-full border border-emerald-950/10">
                {(confidenceScore * 100).toFixed(1)}% Match
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-normal text-slate-900 tracking-tight pt-1">
              {diseaseName}
            </h3>
            {scientificName && (
              <p className="text-xs italic text-slate-600 font-mono">{scientificName}</p>
            )}
          </div>

          {/* Pill Tab Selector matching ScanPage & Tabs component */}
          {!isHealthy && (
            <div className="grid grid-cols-3 gap-1.5 mt-5 p-1 rounded-2xl bg-emerald-950/5 border border-emerald-950/5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('organic')}
                className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'organic'
                    ? 'bg-white text-agri-950 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sprout className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">Organic &amp; Bio</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('chemical')}
                className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'chemical'
                    ? 'bg-white text-agri-950 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FlaskConical className="w-4 h-4 text-agri-700 shrink-0" />
                <span className="truncate">Chemical Shield</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('preventive')}
                className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'preventive'
                    ? 'bg-white text-agri-950 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shield className="w-4 h-4 text-agri-700 shrink-0" />
                <span className="truncate">Cultural Care</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Body / Tab Content */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-4 flex-1 bg-white/80 custom-scrollbar">
          {isHealthy ? (
            <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-emerald-950">Crop Canopy is Healthy</h4>
              <p className="text-xs text-emerald-900/80 max-w-md mx-auto leading-relaxed">
                No active fungal pustules, necrotic spots, or chlorotic halos detected. Continue standard agronomic irrigation, maintain weed-free crop borders, and schedule regular weekly monitoring.
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'organic' && (
                <div className="space-y-3.5">
                  {organicRemedies.length > 0 ? (
                    organicRemedies.map((remedy, idx) => (
                      <div
                        key={remedy.id || idx}
                        className="p-4 sm:p-5 rounded-2xl border border-emerald-950/10 bg-[#f7faf7] space-y-2.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="text-sm font-bold text-slate-900">
                            {remedy.title || remedy.treatment_name || 'Organic Bio-Control'}
                          </h4>
                          {remedy.dosage && (
                            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-lg bg-emerald-100/80 text-agri-800 font-semibold border border-emerald-200/60">
                              {remedy.dosage}
                            </span>
                          )}
                        </div>
                        {remedy.description && (
                          <p className="text-xs text-slate-700 leading-relaxed">
                            {remedy.description}
                          </p>
                        )}
                        {remedy.application_instructions && (
                          <div className="text-xs text-agri-950 leading-relaxed bg-white p-3 rounded-xl border border-emerald-950/10">
                            <span className="font-bold text-agri-800">Application: </span>
                            {remedy.application_instructions}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 sm:p-5 rounded-2xl border border-emerald-950/10 bg-[#f7faf7] space-y-2">
                      <h4 className="text-sm font-bold text-slate-900">Bio-Control Recommendation</h4>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        Foliar spray with Trichoderma viride or Pseudomonas fluorescens at 5g/L water during early morning or overcast weather to suppress foliar mycelium expansion.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'chemical' && (
                <div className="space-y-3.5">
                  {chemicalRemedies.length > 0 ? (
                    chemicalRemedies.map((remedy, idx) => (
                      <div
                        key={remedy.id || idx}
                        className="p-4 sm:p-5 rounded-2xl border border-emerald-950/10 bg-[#f7faf7] space-y-2.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="text-sm font-bold text-slate-900">
                            {remedy.title || remedy.treatment_name || 'Chemical Fungicide Treatment'}
                          </h4>
                          {remedy.dosage && (
                            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-lg bg-emerald-100/80 text-agri-800 font-semibold border border-emerald-200/60">
                              {remedy.dosage}
                            </span>
                          )}
                        </div>
                        {remedy.description && (
                          <p className="text-xs text-slate-700 leading-relaxed">
                            {remedy.description}
                          </p>
                        )}
                        {remedy.application_instructions && (
                          <div className="text-xs text-agri-950 leading-relaxed bg-white p-3 rounded-xl border border-emerald-950/10">
                            <span className="font-bold text-agri-800">Application: </span>
                            {remedy.application_instructions}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 sm:p-5 rounded-2xl border border-emerald-950/10 bg-[#f7faf7] space-y-2">
                      <h4 className="text-sm font-bold text-slate-900">Targeted Fungicide Spray</h4>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        Apply protective contact fungicide such as Mancozeb 75% WP (2 g/L) or Chlorothalonil 75% WP (2 g/L) at the onset of initial symptoms. Repeat at 14-day intervals if wet humid conditions persist.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'preventive' && (
                <div className="space-y-3.5">
                  {preventiveRemedies.length > 0 ? (
                    preventiveRemedies.map((remedy, idx) => (
                      <div
                        key={remedy.id || idx}
                        className="p-4 sm:p-5 rounded-2xl border border-emerald-950/10 bg-[#f7faf7] space-y-2.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="text-sm font-bold text-slate-900">
                            {remedy.title || remedy.treatment_name || 'Cultural & Preventive Practice'}
                          </h4>
                          {remedy.dosage && (
                            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-lg bg-emerald-100/80 text-agri-800 font-semibold border border-emerald-200/60">
                              {remedy.dosage}
                            </span>
                          )}
                        </div>
                        {remedy.description && (
                          <p className="text-xs text-slate-700 leading-relaxed">
                            {remedy.description}
                          </p>
                        )}
                        {remedy.application_instructions && (
                          <div className="text-xs text-agri-950 leading-relaxed bg-white p-3 rounded-xl border border-emerald-950/10">
                            <span className="font-bold text-agri-800">Application: </span>
                            {remedy.application_instructions}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 sm:p-5 rounded-2xl border border-emerald-950/10 bg-[#f7faf7] space-y-2">
                      <h4 className="text-sm font-bold text-slate-900">Crop Sanitation &amp; Spacing</h4>
                      <p className="text-xs text-slate-700 leading-relaxed">
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
        <div className="px-6 py-4 bg-[#edf4ed]/70 border-t border-emerald-950/10 flex items-center justify-between gap-4 text-xs text-slate-600">
          <span className="text-xs text-slate-600 font-medium">
            Always wear protective gear during field spraying
          </span>
          <Button size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
