import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Sprout,
  FlaskConical,
  Shield,
  Scan,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
} from 'lucide-react';

interface DiseaseGuideEntry {
  slug: string;
  name: string;
  scientificName: string;
  category: 'Fungal Pathogen' | 'Abiotic Stress' | 'Healthy Baseline';
  symptoms: string[];
  organicRemedies: { name: string; dosage: string; instruction: string }[];
  chemicalRemedies: { name: string; dosage: string; instruction: string }[];
  culturalRemedies: { name: string; instruction: string }[];
}

export const DiseaseGuidePage: React.FC = () => {
  const [expandedSlug, setExpandedSlug] = useState<string>('early_leaf_spot');

  const catalogue: DiseaseGuideEntry[] = [
    {
      slug: 'early_leaf_spot',
      name: 'Early Leaf Spot',
      scientificName: 'Cercospora arachidicola',
      category: 'Fungal Pathogen',
      symptoms: [
        'Sub-circular brown to dark brown necrotic lesions appearing 3–4 weeks after planting',
        'Distinctive bright yellow chlorotic halo consistently surrounding each lesion',
        'Premature defoliation starting from lower canopy and moving upward',
      ],
      organicRemedies: [
        {
          name: 'Trichoderma viride Bio-Fungicide',
          dosage: '5 g / Litre of water',
          instruction: 'Apply as early morning foliar spray at initial lesion detection to colonize leaf surface.',
        },
        {
          name: 'Neem Seed Kernel Extract (NSKE 5%)',
          dosage: '50 ml / Litre',
          instruction: 'Natural antifeedant and anti-sporulant spray; repeat every 10–12 days.',
        },
      ],
      chemicalRemedies: [
        {
          name: 'Mancozeb 75% WP',
          dosage: '2 g / Litre (1 kg/ha)',
          instruction: 'Broad-spectrum contact protective spray; repeat after 14 days under humid conditions.',
        },
        {
          name: 'Chlorothalonil 75% WP',
          dosage: '2 g / Litre',
          instruction: 'Preventive multi-site protective fungicide to halt spore germination.',
        },
      ],
      culturalRemedies: [
        {
          name: 'Crop Rotation',
          instruction: 'Rotate with non-legume crops (sorghum, maize, pearl millet) for at least 2 seasons.',
        },
        {
          name: 'Crop Residue Destruction',
          instruction: 'Deep plough or compost infected crop residues to break fungal overwintering cycle.',
        },
      ],
    },
    {
      slug: 'late_leaf_spot',
      name: 'Late Leaf Spot',
      scientificName: 'Phaeoisariopsis personata',
      category: 'Fungal Pathogen',
      symptoms: [
        'Dark brown to black nearly circular spots appearing 50–60 days after sowing',
        'Absence of prominent yellow chlorotic halos on lower leaf surfaces',
        'Lesions bear carbon-black mass of fungal spores visible on undersides',
      ],
      organicRemedies: [
        {
          name: 'Pseudomonas fluorescens Formulation',
          dosage: '10 g / Litre',
          instruction: 'Bacterial antagonist providing competitive exclusion against fungal sporulation.',
        },
      ],
      chemicalRemedies: [
        {
          name: 'Tebuconazole 25.9% EC',
          dosage: '1.25 ml / Litre',
          instruction: 'Systemic triazole fungicide with curative and eradicative action.',
        },
        {
          name: 'Carbendazim 12% + Mancozeb 63% WP',
          dosage: '1.5 g / Litre',
          instruction: 'Dual action systemic and contact formulation for stubborn late outbreaks.',
        },
      ],
      culturalRemedies: [
        {
          name: 'Canopy Aeration & Spacing',
          instruction: 'Maintain 30×10 cm spacing to reduce microclimate relative humidity within canopy.',
        },
      ],
    },
    {
      slug: 'rust',
      name: 'Groundnut Rust',
      scientificName: 'Puccinia arachidis Speg.',
      category: 'Fungal Pathogen',
      symptoms: [
        'Dense orange-brown to reddish pustules (uredinia) on lower leaf surface',
        'Rupture of leaf epidermis exposing powdery brown spores',
        'Leaves dry up and curl, resembling a scorched appearance during severe epidemics',
      ],
      organicRemedies: [
        {
          name: 'Garlic-Chili Emulsion Extract',
          dosage: '20 ml / Litre',
          instruction: 'Sulfur-rich botanical foliar repellent that hinders fungal germination.',
        },
      ],
      chemicalRemedies: [
        {
          name: 'Hexaconazole 5% EC',
          dosage: '2 ml / Litre',
          instruction: 'Systemic ergosterol biosynthesis inhibitor for rapid knockdown of pustules.',
        },
        {
          name: 'Wettable Sulfur 80% WP',
          dosage: '3 g / Litre',
          instruction: 'Inexpensive contact protective sulfur spray; avoid during extreme high heat (>38°C).',
        },
      ],
      culturalRemedies: [
        {
          name: 'Intercropping with Cereals',
          instruction: 'Intercrop with pearl millet or pigeon pea (3:1 ratio) to act as physical spore barriers.',
        },
      ],
    },
    {
      slug: 'early_rust',
      name: 'Early Rust Pustules',
      scientificName: 'Puccinia arachidis',
      category: 'Fungal Pathogen',
      symptoms: [
        'Early speckled micro-pustules appearing sparsely on lower foliage',
        'Light chlorotic pinpricks on upper leaf surface corresponding to pustules beneath',
      ],
      organicRemedies: [
        {
          name: 'Trichoderma Foliar Suspension',
          dosage: '5 g / Litre',
          instruction: 'Preventive microbial colonization before widespread spore dispersal occurs.',
        },
      ],
      chemicalRemedies: [
        {
          name: 'Mancozeb 75% WP',
          dosage: '2 g / Litre',
          instruction: 'Protective contact barrier to prevent urediniospore spread across neighboring rows.',
        },
      ],
      culturalRemedies: [
        {
          name: 'Early Monitoring Sweep',
          instruction: 'Inspect lower leaves twice weekly during monsoon or post-monsoon conditions.',
        },
      ],
    },
    {
      slug: 'nutrition_deficiency',
      name: 'Nutritional Chlorosis',
      scientificName: 'Abiotic Stress Factor',
      category: 'Abiotic Stress',
      symptoms: [
        'Interveinal leaf yellowing while veins initially remain pale green',
        'Stunted internodes, reduced leaf size, and fragile tissue',
        'Common in calcareous, high-pH or waterlogged soils with poor iron/zinc uptake',
      ],
      organicRemedies: [
        {
          name: 'Enriched Farm Yard Manure (FYM)',
          dosage: '10–12 tonnes / ha',
          instruction: 'Apply during field preparation to improve micronutrient chelation and soil organic matter.',
        },
      ],
      chemicalRemedies: [
        {
          name: 'Ferrous Sulfate (FeSO4) + Citric Acid',
          dosage: '5 g FeSO4 + 1 g Citric Acid / Litre',
          instruction: 'Foliar spray twice at 10-day intervals to correct lime-induced iron chlorosis.',
        },
        {
          name: 'Chelated Zinc EDTA (12%)',
          dosage: '1 g / Litre',
          instruction: 'Corrects zinc deficiency in zinc-depleted red sandy loam soils.',
        },
      ],
      culturalRemedies: [
        {
          name: 'Drainage Management',
          instruction: 'Ensure drainage channels prevent water stagnation which halts root nutrient uptake.',
        },
      ],
    },
    {
      slug: 'healthy_leaf',
      name: 'Healthy Foliage Baseline',
      scientificName: 'Arachis hypogaea',
      category: 'Healthy Baseline',
      symptoms: [
        'Vibrant dark green chlorophyll distribution without spots, pustules, or halos',
        'Intact leaf margins and robust turgidity',
      ],
      organicRemedies: [
        {
          name: 'Routine Liquid Bio-Fertilizer (Rhizobium)',
          dosage: 'Seed treatment or soil drench',
          instruction: 'Promotes symbiotic root nodulation for natural nitrogen fixation.',
        },
      ],
      chemicalRemedies: [],
      culturalRemedies: [
        {
          name: 'Scheduled Scouting',
          instruction: 'Maintain weekly walking audits through field diagonals to detect early micro-clusters.',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center space-x-2 text-agri-700 text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>Groundnut Pathology Catalogue</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Disease & Remedy Directory
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Canonical symptom profiles, bio-fungicides, chemical dosages, and cultural management strategies for groundnut crops.
            </p>
          </div>

          <Link
            to="/scan"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs shadow-sm transition-all hover:scale-[1.02] touch-target self-start sm:self-auto"
          >
            <Scan className="w-4 h-4" />
            <span>Scan Groundnut Now</span>
          </Link>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {catalogue.map((entry) => {
            const isExpanded = expandedSlug === entry.slug;
            const isHealthy = entry.category === 'Healthy Baseline';

            return (
              <div
                key={entry.slug}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all"
              >
                {/* Accordion Title Header */}
                <button
                  onClick={() => setExpandedSlug(isExpanded ? '' : entry.slug)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors touch-target"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isHealthy
                          ? 'bg-emerald-100 text-emerald-800'
                          : entry.category === 'Abiotic Stress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isHealthy ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-bold text-slate-900">{entry.name}</h3>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            isHealthy
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {entry.category}
                        </span>
                      </div>
                      <p className="text-xs italic text-slate-500 font-mono mt-0.5">
                        {entry.scientificName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-slate-400">
                    <span className="text-xs font-mono hidden sm:inline">{entry.slug}</span>
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-6">
                    {/* Symptoms */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Primary Symptom Indicators
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {entry.symptoms.map((symptom, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <span className="text-agri-600 font-bold">•</span>
                            <span className="leading-relaxed">{symptom}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Treatment Triad */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      {/* Organic */}
                      <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                        <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs">
                          <Sprout className="w-4 h-4 text-emerald-700" />
                          <span>Organic & Biological</span>
                        </div>
                        {entry.organicRemedies.map((r, i) => (
                          <div key={i} className="space-y-1 pt-1 text-xs">
                            <div className="font-semibold text-emerald-950">{r.name}</div>
                            <div className="text-[11px] font-mono text-emerald-800">
                              Dosage: {r.dosage}
                            </div>
                            <p className="text-[11px] text-emerald-900 leading-snug">{r.instruction}</p>
                          </div>
                        ))}
                      </div>

                      {/* Chemical */}
                      <div className="p-4 rounded-xl bg-agri-50/60 border border-agri-200 space-y-2">
                        <div className="flex items-center space-x-2 text-agri-900 font-bold text-xs">
                          <FlaskConical className="w-4 h-4 text-agri-700" />
                          <span>Chemical Fungicide</span>
                        </div>
                        {entry.chemicalRemedies.length > 0 ? (
                          entry.chemicalRemedies.map((r, i) => (
                            <div key={i} className="space-y-1 pt-1 text-xs">
                              <div className="font-semibold text-agri-950">{r.name}</div>
                              <div className="text-[11px] font-mono text-agri-800">
                                Dosage: {r.dosage}
                              </div>
                              <p className="text-[11px] text-agri-900 leading-snug">{r.instruction}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-agri-800 italic pt-2">
                            No synthetic chemicals required for healthy foliage baseline.
                          </p>
                        )}
                      </div>

                      {/* Cultural */}
                      <div className="p-4 rounded-xl bg-soil-50/60 border border-soil-200 space-y-2">
                        <div className="flex items-center space-x-2 text-soil-950 font-bold text-xs">
                          <Shield className="w-4 h-4 text-soil-700" />
                          <span>Cultural Management</span>
                        </div>
                        {entry.culturalRemedies.map((r, i) => (
                          <div key={i} className="space-y-1 pt-1 text-xs">
                            <div className="font-semibold text-soil-950">{r.name}</div>
                            <p className="text-[11px] text-soil-900 leading-snug">{r.instruction}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
