import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Sprout,
  FlaskConical,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Search,
  Eye,
  Info,
  X,
  Droplets,
  ChevronRight,
  Sparkles,
  LayoutGrid,
  SplitSquareVertical,
} from 'lucide-react';
import { Surface } from '../components/ui/Surface';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import ExpandableProfileCard from '../components/watermelon/original';

interface DiseaseGuideEntry {
  slug: string;
  name: string;
  localName: string;
  scientificName: string;
  category: 'Fungal Spot' | 'Fungal Rust' | 'Soil & Nutrition' | 'Healthy Foliage';
  severity: 'High Spread' | 'Moderate Spread' | 'Early Stage' | 'Nutritional' | 'Healthy & Optimal';
  badgeVariant: 'warning' | 'destructive' | 'info' | 'optimal' | 'default';
  image: string;
  simpleSummary: string;
  quickCheck: string;
  whenToAct: string;
  symptoms: string[];
  organicRemedies: {
    name: string;
    dosage: string;
    instruction: string;
  }[];
  chemicalRemedies: {
    name: string;
    dosage: string;
    instruction: string;
  }[];
  culturalRemedies: {
    name: string;
    instruction: string;
  }[];
}

const CATALOGUE: DiseaseGuideEntry[] = [
  {
    slug: 'early_leaf_spot',
    name: 'Early Leaf Spot',
    localName: 'Early Tikka Disease',
    scientificName: 'Cercospora arachidicola',
    category: 'Fungal Spot',
    severity: 'Moderate Spread',
    badgeVariant: 'warning',
    image: '/images/diseases/early_leaf_spot.jpg',
    simpleSummary:
      'Dark brown spots with bright yellow rings around them. Usually appears early in the crop cycle (3 to 4 weeks after sowing) on lower leaves.',
    quickCheck: 'Look for brown spots that have a clear bright yellow halo ring around each spot.',
    whenToAct: 'Act within 48 hours of spotting first leaf marks on bottom foliage.',
    symptoms: [
      'Circular brown or reddish-brown spots on the upper side of leaves.',
      'A distinct bright yellow halo ring clearly surrounding each brown spot.',
      'Starts on lower leaves close to the ground and gradually moves upward.',
      'Infected leaves turn yellow and fall off early, reducing pod yield if not managed.',
    ],
    organicRemedies: [
      {
        name: 'Trichoderma Bio-Fungicide (Friendly Fungi)',
        dosage: '5 grams per 1 Litre of clean water (approx. 500g per 100L tank)',
        instruction:
          'Spray thoroughly on leaf tops and bottoms early in the morning. Friendly fungi multiply on leaves and block disease spores.',
      },
      {
        name: 'Neem Seed Kernel Extract (5% NSKE)',
        dosage: '50 ml per 1 Litre of water (or 500ml per 10L bucket)',
        instruction:
          'Herbal protective spray that stops fungus spores from germinating. Spray every 10–12 days during cloudy or damp weather.',
      },
    ],
    chemicalRemedies: [
      {
        name: 'Mancozeb 75% WP (Contact Shield)',
        dosage: '2 grams per 1 Litre of water (approx. 400 grams per acre)',
        instruction:
          'Protective contact spray. Coats healthy leaves so spores cannot enter. Repeat after 14 days if wet rains continue.',
      },
      {
        name: 'Chlorothalonil 75% WP',
        dosage: '2 grams per 1 Litre of water',
        instruction:
          'Broad-spectrum fungicide that halts disease germination across foliage.',
      },
    ],
    culturalRemedies: [
      {
        name: 'Crop Rotation with Cereals',
        instruction:
          'Rotate your field with pearl millet (bajra), maize, or sorghum for 2 seasons to starve fungal spores left in the soil.',
      },
      {
        name: 'Clear Old Crop Waste',
        instruction:
          'Deep plough or compost dried crop stems and leaves after harvest to break the disease cycle.',
      },
    ],
  },
  {
    slug: 'late_leaf_spot',
    name: 'Late Leaf Spot',
    localName: 'Late Tikka Disease',
    scientificName: 'Phaeoisariopsis personata',
    category: 'Fungal Spot',
    severity: 'High Spread',
    badgeVariant: 'destructive',
    image: '/images/diseases/late_leaf_spot.jpg',
    simpleSummary:
      'Dark brown or almost black spots with no yellow rings. Appears later in the season (50 to 60 days after sowing) and causes heavy leaf shedding.',
    quickCheck: 'Nearly black spots with black powdery soot on the underside, without yellow halos.',
    whenToAct: 'High danger of fast defoliation; spray immediately upon first detection.',
    symptoms: [
      'Dark brown to pitch-black circular spots on both sides of the leaf.',
      'No yellow halo ring around the spots (this is how you tell it apart from Early Leaf Spot).',
      'The underside of the spot has a dark velvety soot of fungal spores.',
      'Leaves shed rapidly from lower to upper canopy, leaving bare stems.',
    ],
    organicRemedies: [
      {
        name: 'Pseudomonas fluorescens (Bio-Bacterial Spray)',
        dosage: '10 grams per 1 Litre of water',
        instruction:
          'Beneficial bacteria that shields foliage, outcompetes harmful fungal spores, and boosts plant defenses.',
      },
    ],
    chemicalRemedies: [
      {
        name: 'Tebuconazole 25.9% EC (Systemic Healer)',
        dosage: '1.25 ml per 1 Litre of water (approx. 250 ml per acre)',
        instruction:
          'Absorbs directly into plant sap to heal active spots and protect new leaves from within.',
      },
      {
        name: 'Carbendazim + Mancozeb Combo (Saaf / Sixer)',
        dosage: '1.5 grams per 1 Litre of water',
        instruction:
          'Dual-action contact and systemic fungicide. Ideal for stubborn or fast-advancing outbreaks.',
      },
    ],
    culturalRemedies: [
      {
        name: 'Proper Plant Spacing',
        instruction:
          'Maintain 30 cm between rows and 10 cm between plants so sunlight and fresh breeze can reach lower foliage and keep leaves dry.',
      },
      {
        name: 'Avoid Evening Sprinkler Irrigation',
        instruction:
          'Do not leave plant leaves wet overnight. Use furrow or drip irrigation during humid weather.',
      },
    ],
  },
  {
    slug: 'rust',
    name: 'Groundnut Rust',
    localName: 'Gerua / Tambera Disease',
    scientificName: 'Puccinia arachidis Speg.',
    category: 'Fungal Rust',
    severity: 'High Spread',
    badgeVariant: 'destructive',
    image: '/images/diseases/rust.jpg',
    simpleSummary:
      'Orange-brown powdery blisters on the underside of leaves. Leaves curl, dry up, and look scorched or burnt, but remain attached to the stem.',
    quickCheck: 'Raised blisters under leaves that leave rust-brown powder on your fingers when touched.',
    whenToAct: 'Rust spreads fast in wind; spray at first sight of clustered blisters.',
    symptoms: [
      'Small raised blisters (pustules) packed with orange-brown powder on the bottom of leaves.',
      'Faint yellow spots on the upper leaf surface directly above the blisters.',
      'When you rub your fingers on the leaf bottom, reddish-brown dust comes off.',
      'Badly infected leaves curl up, turn brittle, and look burnt or scorched, but stay attached.',
    ],
    organicRemedies: [
      {
        name: 'Garlic-Chili Herbal Spray',
        dosage: '20 ml per 1 Litre of water',
        instruction:
          'Sulfur-rich natural botanical extract that repels pests and prevents rust spores from germinating on leaves.',
      },
    ],
    chemicalRemedies: [
      {
        name: 'Hexaconazole 5% EC (Fast Knockdown)',
        dosage: '2 ml per 1 Litre of water (approx. 400 ml per acre)',
        instruction:
          'Fast systemic fungicide that halts spore growth and knocks down active rust pustules within 48 hours.',
      },
      {
        name: 'Wettable Sulfur 80% WP (Sulfex)',
        dosage: '3 grams per 1 Litre of water',
        instruction:
          'Cost-effective protective sulfur wash. Avoid spraying during extreme hot sunny afternoons (above 38°C).',
      },
    ],
    culturalRemedies: [
      {
        name: 'Intercropping with Cereals',
        instruction:
          'Plant 1 row of pearl millet (bajra) or pigeon pea for every 3 rows of groundnut. Tall cereals block wind-blown spores.',
      },
      {
        name: 'Remove Stray Groundnut Seedlings',
        instruction:
          'Uproot self-sown groundnut seedlings along field borders that harbor rust between seasons.',
      },
    ],
  },
  {
    slug: 'early_rust',
    name: 'Early Rust Pustules',
    localName: 'Early Rust Warning',
    scientificName: 'Puccinia arachidis (Initial Stage)',
    category: 'Fungal Rust',
    severity: 'Early Stage',
    badgeVariant: 'warning',
    image: '/images/diseases/early_rust.jpg',
    simpleSummary:
      'The very first stage of rust disease. A few tiny pin-sized orange dots start appearing on the lower leaves. Catching it here makes treatment quick and affordable.',
    quickCheck: 'Scattered tiny orange-brown pinpricks on bottom leaves with no scorched patches yet.',
    whenToAct: 'Best window to stop rust before it spreads to neighboring rows.',
    symptoms: [
      'Tiny, scattered orange-brown specks on the underside of lower leaves.',
      'Light yellow pinpricks visible on the top surface of the leaf.',
      'Leaves are still green and flexible with no curling or scorching yet.',
    ],
    organicRemedies: [
      {
        name: 'Trichoderma Bio-Fungicide Spray',
        dosage: '5 grams per 1 Litre of water',
        instruction:
          'Foliar spray to populate leaf surfaces with friendly microbes before rust spores multiply.',
      },
    ],
    chemicalRemedies: [
      {
        name: 'Mancozeb 75% WP (Protective Shield)',
        dosage: '2 grams per 1 Litre of water',
        instruction:
          'Protective contact spray that covers leaves and prevents young rust specks from growing into big pustules.',
      },
    ],
    culturalRemedies: [
      {
        name: 'Twice-Weekly Field Walks',
        instruction:
          'Walk field diagonals twice a week during rainy or misty periods to check lower leaf bottoms.',
      },
      {
        name: 'Balanced Fertilizer (Avoid Excess Urea)',
        instruction:
          'Do not over-apply nitrogen/urea fertilizer, as soft excessive foliage makes leaves extra prone to rust.',
      },
    ],
  },
  {
    slug: 'nutrition_deficiency',
    name: 'Nutritional Chlorosis',
    localName: 'Iron / Zinc Yellowing (Not a Fungus)',
    scientificName: 'Abiotic Micronutrient Stress',
    category: 'Soil & Nutrition',
    severity: 'Nutritional',
    badgeVariant: 'info',
    image: '/images/diseases/nutrition_deficiency.jpg',
    simpleSummary:
      'Leaves turn pale yellow between the leaf veins while the veins stay green. This is caused by soil nutrients (iron or zinc), not by a fungus or insect.',
    quickCheck: 'Yellow leaf tissue with crisp green leaf veins (stripes or net pattern).',
    whenToAct: 'Apply foliar spray when new top leaves turn pale or yellowish.',
    symptoms: [
      'Young tender leaves turn pale lime-green or bright yellow between the veins.',
      'The leaf veins remain darker green, creating a distinctive striped or net-like look.',
      'Stunted plant growth, smaller leaves, and thin stems.',
      'Common in chalky / high-lime soils, sandy fields, or waterlogged roots that cannot drink nutrients.',
    ],
    organicRemedies: [
      {
        name: 'Well-Composted Farm Yard Manure (FYM)',
        dosage: '10–12 tonnes (cartloads) per hectare',
        instruction:
          'Mix well into soil during field preparation. Increases organic carbon so plant roots can absorb minerals naturally.',
      },
    ],
    chemicalRemedies: [
      {
        name: 'Ferrous Sulfate + Citric Acid (Iron Foliar Spray)',
        dosage: '5 grams Ferrous Sulfate + 1 gram Citric Acid (Nimbu Sat) per 1 Litre of water',
        instruction:
          'Foliar spray twice, 10 days apart. Citric acid helps leaves absorb iron directly within 48 to 72 hours.',
      },
      {
        name: 'Chelated Zinc (Zinc-EDTA 12%)',
        dosage: '1 gram per 1 Litre of water',
        instruction:
          'Foliar spray if yellowing is accompanied by small leaves (little-leaf symptom) in red sandy soils.',
      },
    ],
    culturalRemedies: [
      {
        name: 'Improve Field Drainage Channels',
        instruction:
          'Dig drainage furrows so water does not pool in the field. Waterlogged roots suffocate and stop absorbing iron.',
      },
      {
        name: 'Apply Gypsum at Flowering',
        instruction:
          'Apply 200 kg gypsum per acre during flowering/pegging to give sulfur and calcium for strong pod development.',
      },
    ],
  },
  {
    slug: 'healthy_leaf',
    name: 'Healthy Groundnut Foliage',
    localName: 'Healthy Crop Baseline',
    scientificName: 'Arachis hypogaea L.',
    category: 'Healthy Foliage',
    severity: 'Healthy & Optimal',
    badgeVariant: 'optimal',
    image: '/images/diseases/healthy_leaf.jpg',
    simpleSummary:
      'Deep, rich green leaves with clean surfaces and strong stems. Zero spots, yellowing rings, or rust blisters. This is your target benchmark.',
    quickCheck: 'Uniform vibrant green color, glossy leaves, and robust foliage with zero lesions.',
    whenToAct: 'Continue routine weekly checks and regular balanced irrigation.',
    symptoms: [
      'Even, vibrant deep green color across all four leaflets.',
      'Clean leaf margins with no spots, blisters, or yellow rings.',
      'Firm stems and active, healthy canopy growth.',
      'Normal flowering and smooth pegs pushing into the soil.',
    ],
    organicRemedies: [
      {
        name: 'Rhizobium Bio-Fertilizer (Root Nodule Boost)',
        dosage: 'Seed treatment or liquid root drench',
        instruction:
          'Forms healthy pink nodules on groundnut roots that naturally capture free nitrogen from the atmosphere.',
      },
    ],
    chemicalRemedies: [],
    culturalRemedies: [
      {
        name: 'Weekly Field Audits',
        instruction:
          'Walk through your field once a week to catch any isolated spots before they spread to nearby rows.',
      },
      {
        name: 'Balanced Watering Schedule',
        instruction:
          'Water crops every 10–14 days based on soil moisture, especially during flowering and pod development.',
      },
    ],
  },
];

export const DiseaseGuidePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeSlug, setActiveSlug] = useState<string>('early_leaf_spot');
  const [viewMode, setViewMode] = useState<'cards' | 'console'>('cards');

  const categories = [
    'All',
    'Fungal Spot',
    'Fungal Rust',
    'Soil & Nutrition',
    'Healthy Foliage',
  ];

  const filteredCatalogue = CATALOGUE.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;

    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCategory;

    return (
      matchesCategory &&
      (item.name.toLowerCase().includes(query) ||
        item.localName.toLowerCase().includes(query) ||
        item.scientificName.toLowerCase().includes(query) ||
        item.simpleSummary.toLowerCase().includes(query) ||
        item.quickCheck.toLowerCase().includes(query) ||
        item.symptoms.some((s) => s.toLowerCase().includes(query)) ||
        item.organicRemedies.some(
          (r) =>
            r.name.toLowerCase().includes(query) ||
            r.instruction.toLowerCase().includes(query)
        ) ||
        item.chemicalRemedies.some(
          (r) =>
            r.name.toLowerCase().includes(query) ||
            r.instruction.toLowerCase().includes(query)
        ))
    );
  });

  const activeDisease =
    CATALOGUE.find((d) => d.slug === activeSlug) ||
    filteredCatalogue[0] ||
    CATALOGUE[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-transparent py-8 px-4 sm:px-6 lg:px-8 font-sans"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Unified Editorial Console Header */}
        <Surface className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-emerald-950/10">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center space-x-2 text-agri-800 text-xs font-semibold">
                <BookOpen className="w-4 h-4 text-agri-600" />
                <span>Field Diagnostics Reference</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Groundnut Pathology & Treatment Guide
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Farmer-tested visual symptoms, photorealistic specimen photos, natural bio-fungicides, chemical dosages, and soil care.
              </p>
            </div>
          </div>

          {/* Search & Category Filter Strip */}
          <div className="pt-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search symptom or remedy (e.g. yellow halo, mancozeb)..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-emerald-950/10 bg-white/60 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-agri-600 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all touch-target ${
                      selectedCategory === cat
                        ? 'bg-agri-800 text-white shadow-xs'
                        : 'bg-white/60 text-slate-700 hover:bg-white/90 border border-emerald-950/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* View Switcher: Interactive Cards vs Split Console */}
              <div className="flex items-center p-1 rounded-xl bg-slate-950/5 border border-emerald-950/10 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'cards'
                      ? 'bg-white text-agri-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Expandable card gallery"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('console')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'console'
                      ? 'bg-white text-agri-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Master-detail split console"
                >
                  <SplitSquareVertical className="w-3.5 h-3.5" />
                  <span>Split View</span>
                </button>
              </div>
            </div>
          </div>
        </Surface>

        {filteredCatalogue.length === 0 ? (
          <Surface className="py-16 text-center space-y-3">
            <Search className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No Matching Diseases</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try searching for a different symptom, remedy, or switch category filters.
            </p>
          </Surface>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCatalogue.map((disease) => (
              <ExpandableProfileCard
                key={disease.slug}
                id={`guide-card-${disease.slug}`}
                imageSrc={disease.image}
                title={disease.name}
                subtitle={`${disease.localName} • ${disease.scientificName}`}
                badge={
                  <Badge variant={disease.badgeVariant} className="shadow-xs backdrop-blur-md">
                    {disease.severity}
                  </Badge>
                }
                content={
                  <div className="space-y-5">
                    {/* Quick Identification */}
                    <div className="p-4 rounded-2xl bg-emerald-950/5 border border-emerald-950/10 space-y-2">
                      <div className="text-xs font-extrabold uppercase tracking-wider text-agri-800">
                        Quick Identification
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {disease.quickCheck}
                      </p>
                      <div className="pt-1 text-[11px] font-semibold text-emerald-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                        <span>Action: {disease.whenToAct}</span>
                      </div>
                    </div>

                    {/* Diagnostic Symptoms */}
                    <div>
                      <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-agri-700" />
                        <span>Diagnostic Symptoms</span>
                      </h4>
                      <ul className="space-y-1.5">
                        {disease.symptoms.map((s, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-agri-600 shrink-0 mt-1.5" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Bio-Organic Remedies */}
                    {disease.organicRemedies.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                          <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Bio-Organic Treatment</span>
                        </h4>
                        {disease.organicRemedies.map((r, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-white/70 border border-emerald-950/10 space-y-1">
                            <div className="text-xs font-bold text-slate-900">{r.name}</div>
                            <div className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                              Dosage: {r.dosage}
                            </div>
                            <p className="text-[11px] text-slate-600">{r.instruction}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Chemical Shield */}
                    {disease.chemicalRemedies.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                          <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
                          <span>Protective Chemical Shield</span>
                        </h4>
                        {disease.chemicalRemedies.map((r, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-white/70 border border-emerald-950/10 space-y-1">
                            <div className="text-xs font-bold text-slate-900">{r.name}</div>
                            <div className="text-[11px] text-blue-800 font-semibold bg-blue-50 px-2 py-0.5 rounded-md inline-block">
                              Dosage: {r.dosage}
                            </div>
                            <p className="text-[11px] text-slate-600">{r.instruction}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Cultural & Soil Care */}
                    {disease.culturalRemedies.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-agri-700" />
                          <span>Field & Soil Management</span>
                        </h4>
                        {disease.culturalRemedies.map((r, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-white/70 border border-emerald-950/10 space-y-1">
                            <div className="text-xs font-bold text-slate-900">{r.name}</div>
                            <p className="text-[11px] text-slate-600">{r.instruction}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                }
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Disease Navigation Rail */}
            <div className="lg:col-span-4 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-agri-950/70 px-2 pb-1">
              Pathology Classes ({filteredCatalogue.length})
            </div>

            <div className="space-y-2">
              {filteredCatalogue.map((disease) => {
                const isSelected = activeDisease.slug === disease.slug;

                return (
                  <motion.button
                    key={disease.slug}
                    onClick={() => setActiveSlug(disease.slug)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full text-left p-3.5 rounded-2xl transition-all duration-200 flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-white/90 shadow-[0_4px_20px_rgba(20,83,45,0.08)] border-2 border-agri-600/40'
                        : 'bg-white/50 hover:bg-white/70 border border-white/60 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-emerald-950/10">
                        <img
                          src={disease.image}
                          alt={disease.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-sm truncate">
                          {disease.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {disease.localName}
                        </div>
                      </div>
                    </div>

                    <Badge variant={disease.badgeVariant} className="flex-shrink-0 text-[10px]">
                      {disease.severity}
                    </Badge>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Right: Active Disease Console Surface */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDisease.slug}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <Surface className="overflow-hidden">
                  {/* Specimen Hero Banner */}
                  <div className="relative aspect-[16/9] sm:aspect-[21/9] max-h-72 w-full overflow-hidden bg-slate-900">
                    <img
                      src={activeDisease.image}
                      alt={activeDisease.name}
                      className="w-full h-full object-cover opacity-95 hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                    <div className="absolute top-4 left-4 flex gap-2">
                      <Badge variant={activeDisease.badgeVariant} className="backdrop-blur-md">
                        {activeDisease.severity}
                      </Badge>
                      <Badge variant="outline" className="bg-slate-900/60 text-white border-white/30 backdrop-blur-md">
                        {activeDisease.category}
                      </Badge>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        {activeDisease.name}
                      </div>
                      <div className="text-xs text-emerald-200/90 font-mono italic mt-0.5">
                        {activeDisease.scientificName} &bull; {activeDisease.localName}
                      </div>
                    </div>
                  </div>

                  {/* Disease Content & Interactive Remediation Tabs */}
                  <div className="p-6 sm:p-8 space-y-6">
                    {/* Quick Identification Banner */}
                    <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/70 flex items-start space-x-3">
                      <Eye className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1 text-xs text-amber-950">
                        <div className="font-bold">Quick Field Identification:</div>
                        <p className="leading-relaxed">{activeDisease.quickCheck}</p>
                      </div>
                    </div>

                    {/* Plain Language Summary */}
                    <div className="space-y-1.5">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-agri-950/70">
                        Overview & Timing
                      </h3>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        {activeDisease.simpleSummary}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-slate-500 pt-1">
                        <Info className="w-3.5 h-3.5 text-agri-600" />
                        <span><strong>When to Act:</strong> {activeDisease.whenToAct}</span>
                      </div>
                    </div>

                    {/* Integrated Radix Tabs for Actionable Protocols */}
                    <Tabs defaultValue="symptoms" className="w-full pt-2">
                      <TabsList className="w-full flex flex-wrap h-auto gap-1 p-1.5 bg-emerald-950/5 rounded-xl">
                        <TabsTrigger value="symptoms" className="flex-1 min-w-[120px]">
                          <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                          <span>Symptoms ({activeDisease.symptoms.length})</span>
                        </TabsTrigger>
                        <TabsTrigger value="organic" className="flex-1 min-w-[120px]">
                          <Sprout className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                          <span>Organic Care</span>
                        </TabsTrigger>
                        <TabsTrigger value="chemical" className="flex-1 min-w-[120px]">
                          <FlaskConical className="w-3.5 h-3.5 mr-1.5 text-agri-600" />
                          <span>Chemical Spray</span>
                        </TabsTrigger>
                        <TabsTrigger value="cultural" className="flex-1 min-w-[120px]">
                          <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-soil-700" />
                          <span>Prevention</span>
                        </TabsTrigger>
                      </TabsList>

                      {/* Tab 1: Symptoms Checklist */}
                      <TabsContent value="symptoms" className="space-y-3 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {activeDisease.symptoms.map((symptom, idx) => (
                            <div
                              key={idx}
                              className="p-3.5 rounded-xl bg-white/60 border border-emerald-950/5 flex items-start space-x-3 text-xs text-slate-800"
                            >
                              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold flex-shrink-0 text-[10px]">
                                {idx + 1}
                              </span>
                              <span className="leading-relaxed">{symptom}</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      {/* Tab 2: Organic Remedies */}
                      <TabsContent value="organic" className="space-y-3 pt-2">
                        {activeDisease.organicRemedies.map((remedy, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/60 space-y-2 text-xs"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <h4 className="font-bold text-emerald-950 text-sm">
                                {remedy.name}
                              </h4>
                              <span className="inline-flex items-center space-x-1 font-mono font-bold text-emerald-800 bg-white/80 px-2.5 py-0.5 rounded-lg border border-emerald-200 text-[11px] self-start sm:self-auto">
                                <Droplets className="w-3 h-3 text-emerald-600" />
                                <span>Dosage: {remedy.dosage}</span>
                              </span>
                            </div>
                            <p className="text-emerald-900 leading-relaxed pt-1">
                              {remedy.instruction}
                            </p>
                          </div>
                        ))}
                      </TabsContent>

                      {/* Tab 3: Chemical Remedies */}
                      <TabsContent value="chemical" className="space-y-3 pt-2">
                        {activeDisease.chemicalRemedies.length > 0 ? (
                          activeDisease.chemicalRemedies.map((remedy, idx) => (
                            <div
                              key={idx}
                              className="p-4 rounded-xl bg-agri-50/50 border border-agri-200/60 space-y-2 text-xs"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <h4 className="font-bold text-agri-950 text-sm">
                                  {remedy.name}
                                </h4>
                                <span className="inline-flex items-center space-x-1 font-mono font-bold text-agri-800 bg-white/80 px-2.5 py-0.5 rounded-lg border border-agri-200 text-[11px] self-start sm:self-auto">
                                  <Droplets className="w-3 h-3 text-agri-600" />
                                  <span>Dosage: {remedy.dosage}</span>
                                </span>
                              </div>
                              <p className="text-agri-900 leading-relaxed pt-1">
                                {remedy.instruction}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 rounded-xl bg-white/50 border border-emerald-950/5 text-xs text-slate-600 italic">
                            No synthetic chemicals required for healthy foliage baseline.
                          </div>
                        )}
                      </TabsContent>

                      {/* Tab 4: Cultural & Prevention */}
                      <TabsContent value="cultural" className="space-y-3 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {activeDisease.culturalRemedies.map((remedy, idx) => (
                            <div
                              key={idx}
                              className="p-4 rounded-xl bg-white/60 border border-emerald-950/5 space-y-1.5 text-xs"
                            >
                              <div className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                                <span className="w-2 h-2 rounded-full bg-agri-600" />
                                <span>{remedy.name}</span>
                              </div>
                              <p className="text-slate-600 leading-relaxed">{remedy.instruction}</p>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </Surface>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        )}
      </div>
    </motion.div>
  );
};

export default DiseaseGuidePage;
