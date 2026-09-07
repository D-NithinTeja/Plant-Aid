import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  Leaf, 
  FlaskConical, 
  ShieldAlert, 
  SunMedium, 
  XCircle,
  CheckCircle,
  Sprout
} from 'lucide-react';
import Badge from '../common/Badge';

export default function TreatmentPlan({ diagnosis, onBack }) {
  const [openSections, setOpenSections] = useState({
    organic: true,
    chemical: false,
    preventive: false,
    environmental: false,
    avoid: false,
  });

  const toggleSection = (sec) => {
    setOpenSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const diseaseName = diagnosis?.disease_name || 'Groundnut Early Leaf Spot';
  const plantSpecies = diagnosis?.plant_species || 'Groundnut Leaf';
  const severity = diagnosis?.severity || 'Moderate';

  // Seeded remedies fallback if diagnosis.remedies is empty
  const remedies = diagnosis?.remedies || [];
  const organicRemedies = remedies.filter((r) => r.category === 'organic' || r.category?.includes('bio'));
  const chemicalRemedies = remedies.filter((r) => r.category === 'chemical' || r.category?.includes('fungicide'));
  const culturalRemedies = remedies.filter((r) => r.category === 'cultural' || r.category?.includes('prevent'));

  return (
    <div className="max-w-xl mx-auto w-full px-4 py-4 md:py-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 rounded-2xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-slate-900">Treatment Plan</h2>
        <div className="w-9" />
      </div>

      {/* Disease Summary Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 flex-shrink-0">
          <Sprout className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-slate-900 truncate">{diseaseName}</h3>
          <p className="text-xs text-slate-400 truncate">{plantSpecies}</p>
          <div className="mt-2">
            <Badge status={severity} />
          </div>
        </div>
      </div>

      {/* Recommended Actions (Numbered Steps matching Screen 6) */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-slate-900">Recommended Actions</h4>

        <div className="space-y-2.5">
          {/* Action 1 */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-start gap-3.5">
            <div className="w-6 h-6 rounded-full bg-brand-700 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              1
            </div>
            <div>
              <h5 className="text-xs md:text-sm font-bold text-slate-900">Remove affected leaves</h5>
              <p className="text-xs text-slate-500 mt-0.5">
                Cut and safely dispose of infected lower leaves to arrest aerial spore dispersion.
              </p>
            </div>
          </div>

          {/* Action 2 */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-start gap-3.5">
            <div className="w-6 h-6 rounded-full bg-brand-700 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              2
            </div>
            <div>
              <h5 className="text-xs md:text-sm font-bold text-slate-900">Improve air circulation</h5>
              <p className="text-xs text-slate-500 mt-0.5">
                Ensure proper spacing between crops (15cm) to reduce dense canopy micro-humidity.
              </p>
            </div>
          </div>

          {/* Action 3 */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-start gap-3.5">
            <div className="w-6 h-6 rounded-full bg-brand-700 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              3
            </div>
            <div>
              <h5 className="text-xs md:text-sm font-bold text-slate-900">Avoid overhead watering</h5>
              <p className="text-xs text-slate-500 mt-0.5">
                Irrigate strictly at soil level early in the morning to keep foliage dry during nights.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Category Cards */}
      <div className="space-y-3 pt-1">
        {/* Organic Treatment */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('organic')}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Leaf className="w-4 h-4" />
              </div>
              <span className="text-xs md:text-sm font-bold text-slate-900">Organic Treatment</span>
            </div>
            {openSections.organic ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {openSections.organic && (
            <div className="px-4 pb-4 pt-1 border-t border-slate-100 text-xs text-slate-600 space-y-2">
              <p className="font-semibold text-slate-800">Neem Oil Spray (3ml/L) & Trichoderma viride</p>
              <p>Spray cold-pressed neem seed oil emulsion (0.5%) every 7–10 days on early spotting. Inoculate root zone with Trichoderma bio-agent.</p>
              {organicRemedies.map((r, i) => (
                <div key={i} className="mt-2 p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                  <p className="font-bold text-emerald-900">{r.remedy_title}</p>
                  <p className="text-emerald-800 text-[11px] mt-0.5">{r.instructions}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chemical Treatment */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('chemical')}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <FlaskConical className="w-4 h-4" />
              </div>
              <span className="text-xs md:text-sm font-bold text-slate-900">Chemical Treatment (if needed)</span>
            </div>
            {openSections.chemical ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {openSections.chemical && (
            <div className="px-4 pb-4 pt-1 border-t border-slate-100 text-xs text-slate-600 space-y-2">
              <p className="font-semibold text-slate-800">Mancozeb 75% WP or Chlorothalonil 75% WP</p>
              <p>Apply 2g/liter of water at first symptom onset. Repeat at 12–14 day intervals if humid conditions persist. Observe 14-day pre-harvest interval.</p>
              {chemicalRemedies.map((r, i) => (
                <div key={i} className="mt-2 p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                  <p className="font-bold text-blue-900">{r.remedy_title}</p>
                  <p className="text-blue-800 text-[11px] mt-0.5">{r.instructions}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preventive Measures */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('preventive')}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span className="text-xs md:text-sm font-bold text-slate-900">Preventive Measures</span>
            </div>
            {openSections.preventive ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {openSections.preventive && (
            <div className="px-4 pb-4 pt-1 border-t border-slate-100 text-xs text-slate-600 space-y-2">
              <p>Practice 2-year crop rotation with non-host cereals (maize, sorghum). Always use certified pathogen-free seeds treated with Thiram (2g/kg).</p>
            </div>
          )}
        </div>

        {/* Environmental Recommendations */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('environmental')}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <SunMedium className="w-4 h-4" />
              </div>
              <span className="text-xs md:text-sm font-bold text-slate-900">Environmental Recommendations</span>
            </div>
            {openSections.environmental ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {openSections.environmental && (
            <div className="px-4 pb-4 pt-1 border-t border-slate-100 text-xs text-slate-600 space-y-2">
              <p>Maintain well-drained sandy loam soil. Prevent standing water puddles in field ridges after rainfall.</p>
            </div>
          )}
        </div>

        {/* Things to Avoid */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('avoid')}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                <XCircle className="w-4 h-4" />
              </div>
              <span className="text-xs md:text-sm font-bold text-slate-900">Things to Avoid</span>
            </div>
            {openSections.avoid ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {openSections.avoid && (
            <div className="px-4 pb-4 pt-1 border-t border-slate-100 text-xs text-slate-600 space-y-2">
              <p>• Avoid working in crop rows when foliage is wet (transfers conidia).</p>
              <p>• Avoid excessive nitrogen fertilizers that create weak, succulent tissue.</p>
              <p>• Do not leave infected crop stubble in the field after harvest.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
