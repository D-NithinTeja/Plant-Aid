import React from 'react';
import { Link } from 'react-router-dom';
import {
  Scan,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Sprout,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DiseaseTaxonomyPreview {
  slug: string;
  name: string;
  pathogen: string;
  type: string;
  description: string;
  badgeColor: string;
}

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const supportedDiseases: DiseaseTaxonomyPreview[] = [
    {
      slug: 'early_leaf_spot',
      name: 'Early Leaf Spot',
      pathogen: 'Cercospora arachidicola',
      type: 'Fungal Pathogen',
      description: 'Circular dark brown lesions surrounded by prominent chlorotic yellow halos.',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    {
      slug: 'late_leaf_spot',
      name: 'Late Leaf Spot',
      pathogen: 'Phaeoisariopsis personata',
      type: 'Fungal Pathogen',
      description: 'Deep brown to carbon-black circular spots without yellow halos on lower surfaces.',
      badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
    },
    {
      slug: 'rust',
      name: 'Groundnut Rust',
      pathogen: 'Puccinia arachidis Speg.',
      type: 'Fungal Pathogen',
      description: 'Dense orange-brown to reddish pustules rupturing leaf epidermis.',
      badgeColor: 'bg-red-100 text-red-900 border-red-300',
    },
    {
      slug: 'early_rust',
      name: 'Early Rust Pustules',
      pathogen: 'Puccinia arachidis',
      type: 'Fungal Pathogen',
      description: 'Small speckled brown pustules appearing on lower canopy surfaces.',
      badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    },
    {
      slug: 'nutrition_deficiency',
      name: 'Nutritional Chlorosis',
      pathogen: 'Abiotic Stress',
      type: 'Nutrient Deficiency',
      description: 'Interveinal yellowing, stunted leaves, and pale foliage from mineral deficiencies.',
      badgeColor: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    },
    {
      slug: 'healthy_leaf',
      name: 'Healthy Foliage',
      pathogen: 'Arachis hypogaea',
      type: 'Normal Canopy',
      description: 'Vibrant green chlorophyll pigmentation without lesions or necrotic tissue.',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-agri-950 via-agri-900 to-slate-900 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#4ade80_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-agri-800/80 border border-agri-600/40 text-agri-300 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-agri-400" />
            <span>Edge-Calibrated Crop Vision • τ = 0.55 Confidence Floor</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Real-Time Plant Disease Identification & Treatment Advisory
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Equipping farmers, agronomists, and field extension workers with instant foliage scanning, two-layer lesion localization, and validated organic, chemical, and cultural remedies.
          </p>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={isAuthenticated ? '/scan' : '/auth?mode=register'}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-8 py-3.5 rounded-xl bg-agri-500 hover:bg-agri-400 text-slate-950 font-bold text-base shadow-lg shadow-agri-500/20 transition-all hover:scale-[1.02] touch-target"
            >
              <Scan className="w-5 h-5 text-slate-950" />
              <span>{isAuthenticated ? 'Launch Scanner' : 'Start Live Scan'}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              to="/guide"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-medium text-base border border-slate-700 transition-colors touch-target"
            >
              <BookOpen className="w-5 h-5 text-slate-300" />
              <span>Browse Disease Catalog</span>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left max-w-4xl mx-auto">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 backdrop-blur">
              <div className="text-agri-400 font-bold text-2xl font-mono">1.5s</div>
              <div className="text-xs text-slate-400 mt-1">Video Stream Loop</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 backdrop-blur">
              <div className="text-agri-400 font-bold text-2xl font-mono">6 Classes</div>
              <div className="text-xs text-slate-400 mt-1">Groundnut Pathology</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 backdrop-blur">
              <div className="text-agri-400 font-bold text-2xl font-mono">3 Tiers</div>
              <div className="text-xs text-slate-400 mt-1">Organic • Chemical • Cultural</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 backdrop-blur">
              <div className="text-agri-400 font-bold text-2xl font-mono">2FA OTP</div>
              <div className="text-xs text-slate-400 mt-1">Protected Farm Data</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mechanism Deep Dive */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-agri-700 mb-2">
            Engineered For Outdoor Agricultural Reality
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How Plant-Aid Eliminates Diagnostic Hallucinations
          </p>
          <p className="text-base text-slate-600 mt-4 leading-relaxed">
            Generic models guess diseases even on healthy leaves or dry soil. Plant-Aid applies a two-layer computer vision pipeline calibrated against a strict confidence threshold.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-field transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Layer 1: Leaf ROI Masking</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              OpenCV HSV green-dominance filtering isolates the plant foliage and strips out soil, hands, and field debris, ensuring only genuine leaf surface is fed to the deep network.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-2">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Eliminates background noise</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Aspect-preserving 640×480 preprocessing</span>
              </li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-field transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-agri-50 text-agri-700 flex items-center justify-center font-bold">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Layer 2: ConvNeXt & Saliency</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              ConvNeXt-Tiny performs deep multi-class classification, coupled with hue-distance saliency mapping that pinpoints the exact lesion focus area with normalized coordinates.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-2">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-agri-600 flex-shrink-0" />
                <span>Sub-second CPU inference</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-agri-600 flex-shrink-0" />
                <span>Real-time bounding box overlays</span>
              </li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-field transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-soil-50 text-soil-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Calibration Floor (τ = 0.55)</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              When prediction probability falls below τ = 0.55, Plant-Aid marks the frame as uncertain instead of emitting false alarms, advising the user to steady the camera or inspect closer.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-2">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-soil-700 flex-shrink-0" />
                <span>Prevents unnecessary pesticide sprays</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-soil-700 flex-shrink-0" />
                <span>Clear "Healthy" vs "Uncertain" states</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Disease Taxonomy Preview */}
      <section className="bg-white py-16 sm:py-24 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-agri-700 mb-2">
                Groundnut Disease Catalogue
              </h2>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                6 Verified Pathological & Healthy Classes
              </p>
              <p className="text-sm text-slate-600 mt-2 max-w-xl">
                Aligned with canonical database records, expert agronomic literature, and Hugging Face crop pathology standards.
              </p>
            </div>
            <Link
              to="/guide"
              className="mt-4 md:mt-0 inline-flex items-center space-x-1.5 text-sm font-semibold text-agri-700 hover:text-agri-800"
            >
              <span>Explore all remedies & dosages</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {supportedDiseases.map((disease) => (
              <div
                key={disease.slug}
                className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-agri-300 hover:shadow-field transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${disease.badgeColor}`}>
                    {disease.type}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{disease.slug}</span>
                </div>
                <h4 className="text-lg font-bold text-slate-900">{disease.name}</h4>
                <p className="text-xs italic text-slate-500 font-mono">{disease.pathogen}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{disease.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Action Banner */}
      <section className="py-16 sm:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-gradient-to-tr from-agri-900 to-agri-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-agri-300">
            <Sprout className="w-8 h-8" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Protect Your Groundnut Crop Today
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Experience sub-second foliage diagnosis directly in your field browser. No complex hardware required.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={isAuthenticated ? '/scan' : '/auth?mode=register'}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-agri-950 font-bold hover:bg-slate-100 shadow-md transition-colors touch-target"
            >
              Get Started Now
            </Link>
            <Link
              to="/auth"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-agri-700/60 text-white font-medium hover:bg-agri-700 border border-agri-600/60 transition-colors touch-target"
            >
              Registered User Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
