import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Sprout,
  FlaskConical,
  ShieldCheck,
  Scan,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Search,
  Eye,
  Info,
  X,
  Droplets,
  HelpCircle,
} from 'lucide-react';

interface DiseaseGuideEntry {
  slug: string;
  name: string;
  localName: string;
  scientificName: string;
  category: 'Fungal Spot' | 'Fungal Rust' | 'Soil & Nutrition' | 'Healthy Foliage';
  severity: 'High Spread' | 'Moderate Spread' | 'Early Stage' | 'Nutritional' | 'Healthy & Optimal';
  severityColor: string;
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
    severityColor: 'bg-amber-100 text-amber-800 border-amber-300',
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
    severityColor: 'bg-rose-100 text-rose-800 border-rose-300',
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
    severityColor: 'bg-orange-100 text-orange-900 border-orange-300',
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
    severityColor: 'bg-yellow-100 text-yellow-900 border-yellow-300',
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
    severityColor: 'bg-sky-100 text-sky-900 border-sky-300',
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
    severityColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
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

type ActiveTab = 'symptoms' | 'organic' | 'chemical' | 'cultural';

export const DiseaseGuidePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedSlug, setExpandedSlug] = useState<string>('early_leaf_spot');
  const [activeTabs, setActiveTabs] = useState<Record<string, ActiveTab>>({
    early_leaf_spot: 'symptoms',
    late_leaf_spot: 'symptoms',
    rust: 'symptoms',
    early_rust: 'symptoms',
    nutrition_deficiency: 'symptoms',
    healthy_leaf: 'symptoms',
  });

  const setCardTab = (slug: string, tab: ActiveTab) => {
    setActiveTabs((prev) => ({ ...prev, [slug]: tab }));
  };

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

    const matchesQuery =
      item.name.toLowerCase().includes(query) ||
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
      ) ||
      item.culturalRemedies.some(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.instruction.toLowerCase().includes(query)
      );

    return matchesCategory && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Header */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-agri-50 border border-agri-200 text-agri-800 text-xs font-semibold">
                <BookOpen className="w-4 h-4 text-agri-600" />
                <span>Field Practical Guide for Farmers</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Groundnut Disease & Care Guide
              </h1>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Simple visual signs, high-definition leaf photos, organic remedies, safe chemical spray dosages, and field prevention practices.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                to="/scan"
                className="inline-flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-2xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-sm shadow-md transition-all hover:scale-[1.02] touch-target"
              >
                <Scan className="w-5 h-5" />
                <span>Scan a Leaf Now</span>
              </Link>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Box */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search disease, symptoms, or spray (e.g. yellow ring, mancozeb)..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500 focus:bg-white transition-all"
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

            {/* Category Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-agri-800 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Counter if Filtered */}
        {(searchQuery || selectedCategory !== 'All') && (
          <div className="flex items-center justify-between text-xs text-slate-500 px-2">
            <span>
              Showing {filteredCatalogue.length} of {CATALOGUE.length} disease classes
            </span>
            {(searchQuery || selectedCategory !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="text-agri-700 hover:underline font-semibold"
              >
                Reset filters
              </button>
            )}
          </div>
        )}

        {/* Empty State */}
        {filteredCatalogue.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <HelpCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No matching crop diseases found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              We couldn't find any symptoms or remedies matching &ldquo;{searchQuery}&rdquo;. Try searching for general terms like &ldquo;spot&rdquo;, &ldquo;rust&rdquo;, or &ldquo;spray&rdquo;.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="px-5 py-2.5 rounded-xl bg-agri-700 text-white font-semibold text-xs hover:bg-agri-800 transition-colors"
            >
              Show All Diseases
            </button>
          </div>
        )}

        {/* Catalogue Cards Grid */}
        <div className="space-y-6">
          {filteredCatalogue.map((entry) => {
            const isExpanded = expandedSlug === entry.slug;
            const isHealthy = entry.slug === 'healthy_leaf';
            const currentTab = activeTabs[entry.slug] || 'symptoms';

            return (
              <div
                key={entry.slug}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md"
              >
                {/* Header Banner & Visual Card */}
                <div className="p-6 sm:p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
                    {/* Left: Disease Photo with Zoom & Badge */}
                    <div className="lg:col-span-4 flex flex-col space-y-3">
                      <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 border border-slate-200 group shadow-sm">
                        <img
                          src={entry.image}
                          alt={entry.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border backdrop-blur-md shadow-sm ${entry.severityColor}`}
                          >
                            {entry.severity}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 font-medium">
                        <span>Class Key: <code className="font-mono font-bold text-slate-700">{entry.slug}</code></span>
                        <span>{entry.category}</span>
                      </div>
                    </div>

                    {/* Right: Key Facts, Quick Check, and Action */}
                    <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
                      <div>
                        {/* Title & Scientific Name */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                                {entry.name}
                              </h2>
                              <span className="text-xs font-semibold text-agri-700 bg-agri-50 px-2.5 py-0.5 rounded-md border border-agri-200">
                                {entry.localName}
                              </span>
                            </div>
                            <p className="text-xs italic text-slate-500 font-mono">
                              {entry.scientificName}
                            </p>
                          </div>

                          <Link
                            to="/scan"
                            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-agri-50 hover:text-agri-800 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
                          >
                            <Scan className="w-3.5 h-3.5" />
                            <span>Verify in Camera</span>
                          </Link>
                        </div>

                        {/* Plain Language Summary */}
                        <p className="text-slate-700 text-sm leading-relaxed mt-3">
                          {entry.simpleSummary}
                        </p>

                        {/* Quick Check Box */}
                        <div className="mt-4 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start space-x-2.5">
                          <Eye className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                          <div className="text-xs text-amber-900">
                            <span className="font-bold">🔍 Quick Field Check: </span>
                            {entry.quickCheck}
                          </div>
                        </div>

                        {/* Best Time to Act */}
                        <div className="mt-2.5 flex items-center space-x-2 text-xs text-slate-500">
                          <Info className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            <strong className="text-slate-700">When to Act:</strong> {entry.whenToAct}
                          </span>
                        </div>
                      </div>

                      {/* Expand / Collapse Button */}
                      <div className="pt-2">
                        <button
                          onClick={() => setExpandedSlug(isExpanded ? '' : entry.slug)}
                          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-agri-800 bg-agri-50 hover:bg-agri-100 border border-agri-200 transition-all touch-target"
                        >
                          <span>{isExpanded ? 'Hide Remedies & Treatment' : 'View Symptoms & Remedies'}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Section: Interactive Tabs (Symptoms, Organic, Chemical, Prevention) */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-slate-50/70 p-6 sm:p-8 space-y-6">
                    {/* Navigation Tabs */}
                    <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
                      <button
                        onClick={() => setCardTab(entry.slug, 'symptoms')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          currentTab === 'symptoms'
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                        }`}
                      >
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>Symptoms & Visual Signs ({entry.symptoms.length})</span>
                      </button>

                      <button
                        onClick={() => setCardTab(entry.slug, 'organic')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          currentTab === 'organic'
                            ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200'
                            : 'text-slate-600 hover:text-emerald-800 hover:bg-white/60'
                        }`}
                      >
                        <Sprout className="w-4 h-4 text-emerald-600" />
                        <span>Organic & Natural ({entry.organicRemedies.length})</span>
                      </button>

                      <button
                        onClick={() => setCardTab(entry.slug, 'chemical')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          currentTab === 'chemical'
                            ? 'bg-white text-agri-800 shadow-sm border border-agri-200'
                            : 'text-slate-600 hover:text-agri-800 hover:bg-white/60'
                        }`}
                      >
                        <FlaskConical className="w-4 h-4 text-agri-600" />
                        <span>Chemical Spray ({entry.chemicalRemedies.length})</span>
                      </button>

                      <button
                        onClick={() => setCardTab(entry.slug, 'cultural')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          currentTab === 'cultural'
                            ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4 text-soil-700" />
                        <span>Field Care & Prevention ({entry.culturalRemedies.length})</span>
                      </button>
                    </div>

                    {/* Tab 1: Symptoms */}
                    {currentTab === 'symptoms' && (
                      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 space-y-4">
                        <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          <span>Checklist: What to look for in the field</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          {entry.symptoms.map((symptom, idx) => (
                            <div
                              key={idx}
                              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start space-x-3 text-xs text-slate-800"
                            >
                              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold flex-shrink-0 text-[11px]">
                                {idx + 1}
                              </span>
                              <span className="leading-relaxed">{symptom}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tab 2: Organic Remedies */}
                    {currentTab === 'organic' && (
                      <div className="bg-white rounded-2xl border border-emerald-200/90 p-5 sm:p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm">
                            <Sprout className="w-4 h-4 text-emerald-600" />
                            <span>Natural & Bio-Fungicide Recommendations</span>
                          </div>
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Safe for Soil & Bees
                          </span>
                        </div>

                        <div className="space-y-3 pt-1">
                          {entry.organicRemedies.map((remedy, idx) => (
                            <div
                              key={idx}
                              className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-2 text-xs"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <h4 className="font-bold text-emerald-950 text-sm">
                                  {remedy.name}
                                </h4>
                                <span className="inline-flex items-center space-x-1 font-mono font-bold text-emerald-800 bg-white px-2.5 py-0.5 rounded-lg border border-emerald-200 text-[11px]">
                                  <Droplets className="w-3 h-3 text-emerald-600" />
                                  <span>Dosage: {remedy.dosage}</span>
                                </span>
                              </div>
                              <p className="text-emerald-900 leading-relaxed pt-1">
                                {remedy.instruction}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tab 3: Chemical Remedies */}
                    {currentTab === 'chemical' && (
                      <div className="bg-white rounded-2xl border border-agri-200/90 p-5 sm:p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-agri-950 font-bold text-sm">
                            <FlaskConical className="w-4 h-4 text-agri-700" />
                            <span>Chemical Fungicide Dosages (When Severe)</span>
                          </div>
                          <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            Wear Gloves & Mask When Spraying
                          </span>
                        </div>

                        {entry.chemicalRemedies.length > 0 ? (
                          <div className="space-y-3 pt-1">
                            {entry.chemicalRemedies.map((remedy, idx) => (
                              <div
                                key={idx}
                                className="p-4 rounded-xl bg-agri-50/50 border border-agri-200/80 space-y-2 text-xs"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                  <h4 className="font-bold text-agri-950 text-sm">
                                    {remedy.name}
                                  </h4>
                                  <span className="inline-flex items-center space-x-1 font-mono font-bold text-agri-800 bg-white px-2.5 py-0.5 rounded-lg border border-agri-200 text-[11px]">
                                    <Droplets className="w-3 h-3 text-agri-600" />
                                    <span>Dosage: {remedy.dosage}</span>
                                  </span>
                                </div>
                                <p className="text-agri-900 leading-relaxed pt-1">
                                  {remedy.instruction}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 italic">
                            No synthetic chemicals required for healthy foliage baseline. Keep up good watering and nutrition.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tab 4: Cultural & Field Prevention */}
                    {currentTab === 'cultural' && (
                      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
                        <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                          <ShieldCheck className="w-4 h-4 text-soil-700" />
                          <span>Field Management & Prevention Tips</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          {entry.culturalRemedies.map((remedy, idx) => (
                            <div
                              key={idx}
                              className="p-4 rounded-xl bg-soil-50/50 border border-soil-200/70 space-y-1.5 text-xs"
                            >
                              <div className="font-bold text-soil-950 text-sm flex items-center space-x-2">
                                <span className="w-2 h-2 rounded-full bg-soil-700" />
                                <span>{remedy.name}</span>
                              </div>
                              <p className="text-soil-900 leading-relaxed">{remedy.instruction}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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

export default DiseaseGuidePage;
