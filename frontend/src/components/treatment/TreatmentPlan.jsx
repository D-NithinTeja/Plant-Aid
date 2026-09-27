import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  Leaf, 
  FlaskConical, 
  ShieldAlert, 
  SunMedium, 
  CheckCircle2, 
  Sprout,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import Badge from '../common/Badge';
import { remedyService } from '../../services/remedies';
import { toast } from 'sonner';

export default function TreatmentPlan({ diagnosis, onBack }) {
  const [openSections, setOpenSections] = useState({
    organic: true,
    chemical: true,
    cultural: false,
  });
  const [liveRemedies, setLiveRemedies] = useState(diagnosis?.remedies || []);

  useEffect(() => {
    if (diagnosis?.remedies && diagnosis.remedies.length > 0) {
      setLiveRemedies(diagnosis.remedies);
      return;
    }
    const diseaseId = diagnosis?.disease_id || 'early_leaf_spot';
    remedyService.getRemedies(diseaseId).then((data) => {
      if (data && data.length > 0) {
        setLiveRemedies(data);
      }
    }).catch(() => {});
  }, [diagnosis]);

  const toggleSection = (sec) => {
    setOpenSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const diseaseName = diagnosis?.disease_name || 'Groundnut Early Leaf Spot';
  const plantSpecies = diagnosis?.plant_species || 'Groundnut (Arachis hypogaea)';
  const severity = diagnosis?.severity || 'Severe';

  const remedies = liveRemedies.length > 0 ? liveRemedies : [
    {
      remedy_name: 'Chlorothalonil 720 SC',
      category: 'chemical',
      instructions: 'Dilute 2.0 mL per 1L of water. Spray thoroughly covering both adaxial and abaxial foliage surfaces.',
      safety_precautions: 'Wear protective mask and nitrile gloves. 14-day pre-harvest interval.',
    },
    {
      remedy_name: 'Copper Hydroxide Spray (Kocide 3000)',
      category: 'chemical',
      instructions: 'Apply 1.5 - 2.0 kg/ha at first onset of lesion halo spots.',
      safety_precautions: 'Do not spray during high temperatures (>35°C) to prevent phytotoxicity.',
    },
    {
      remedy_name: 'Bacillus Subtilis Bio-Fungicide',
      category: 'organic',
      instructions: 'Apply 3-5 g per Liter water as preventative foliar drench early in the morning.',
      safety_precautions: 'Certified safe for organic field crops. Zero post-harvest interval.',
    },
    {
      remedy_name: 'Neem Seed Kernel Extract (NSKE 5%)',
      category: 'organic',
      instructions: 'Soak 50g powdered neem kernels in 1L water overnight. Filter and spray with 1% soap emulsifier.',
      safety_precautions: 'Spray in late afternoon to avoid UV decomposition of azadirachtin.',
    },
  ];

  const organicRemedies = remedies.filter((r) => r.category === 'organic' || r.category?.includes('bio'));
  const chemicalRemedies = remedies.filter((r) => r.category === 'chemical' || r.category?.includes('fungicide'));

  return (
    <div className="max-w-4xl mx-auto w-full px-4 md:px-8 py-6 space-y-6 animate-elevate-in">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface btn-press flex items-center gap-2 text-xs font-semibold"
          aria-label="Back to analysis"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Telemetry</span>
        </button>
        <span className="text-xs font-mono text-outline">PROTOCOL ID: #PR-8842</span>
      </div>

      {/* Disease Summary Hero */}
      <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-on-surface">{diseaseName}</h1>
            <Badge status={severity} />
          </div>
          <p className="text-xs font-mono text-outline">{plantSpecies} // Action Protocol</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary-container text-on-secondary-container text-xs font-mono">
          <CheckCircle2 className="w-4 h-4 text-secondary" />
          <span>Agronomist Verified</span>
        </div>
      </div>

      {/* Immediate Cultural & Agronomic Steps */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-on-surface uppercase font-mono tracking-wider">
          Immediate Cultural Mitigation
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/25 shadow-sm space-y-1.5">
            <div className="w-7 h-7 rounded-lg bg-primary text-secondary-fixed flex items-center justify-center font-bold text-xs font-mono">
              1
            </div>
            <h3 className="text-xs font-bold text-on-surface">Prune Severely Lesioned Leaves</h3>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Sterilize shears and bag excised lower leaves to halt local aerial spore dispersal.
            </p>
          </div>

          <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/25 shadow-sm space-y-1.5">
            <div className="w-7 h-7 rounded-lg bg-primary text-secondary-fixed flex items-center justify-center font-bold text-xs font-mono">
              2
            </div>
            <h3 className="text-xs font-bold text-on-surface">Aerate Canopy Micro-Climate</h3>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Thin adjacent weed growth to reduce trapped moisture beneath the lower foliage.
            </p>
          </div>

          <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/25 shadow-sm space-y-1.5">
            <div className="w-7 h-7 rounded-lg bg-primary text-secondary-fixed flex items-center justify-center font-bold text-xs font-mono">
              3
            </div>
            <h3 className="text-xs font-bold text-on-surface">Soil-Level Drip Irrigation</h3>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Avoid overhead sprinklers. Wet leaves during night hours promote germination.
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Treatment Categories Accordion */}
      <div className="space-y-4">
        
        {/* Chemical Interventions */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('chemical')}
            className="w-full p-4 md:p-5 flex items-center justify-between text-left hover:bg-surface-container-low transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-on-surface">Chemical Fungicide Protocols</h3>
                <p className="text-xs text-outline">Targeted curative & protective chemical applications</p>
              </div>
            </div>
            {openSections.chemical ? <ChevronUp className="w-4 h-4 text-outline" /> : <ChevronDown className="w-4 h-4 text-outline" />}
          </button>

          {openSections.chemical && (
            <div className="px-5 pb-5 space-y-3 pt-2 border-t border-outline-variant/20">
              {chemicalRemedies.map((rem, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-on-surface">{rem.remedy_name}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container text-primary font-semibold">
                      Chemical
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{rem.instructions}</p>
                  {rem.safety_precautions && (
                    <p className="text-[11px] text-error flex items-center gap-1 font-mono pt-1">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{rem.safety_precautions}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Organic Bio-Fungicides */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('organic')}
            className="w-full p-4 md:p-5 flex items-center justify-between text-left hover:bg-surface-container-low transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-on-surface">Organic & Biological Remedies</h3>
                <p className="text-xs text-outline">Certified bio-fungicides and natural botanical extracts</p>
              </div>
            </div>
            {openSections.organic ? <ChevronUp className="w-4 h-4 text-outline" /> : <ChevronDown className="w-4 h-4 text-outline" />}
          </button>

          {openSections.organic && (
            <div className="px-5 pb-5 space-y-3 pt-2 border-t border-outline-variant/20">
              {organicRemedies.map((rem, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-on-surface">{rem.remedy_name}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-semibold">
                      Bio-Organic
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{rem.instructions}</p>
                  {rem.safety_precautions && (
                    <p className="text-[11px] text-outline flex items-center gap-1 font-mono pt-1">
                      <span>Safety: {rem.safety_precautions}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
