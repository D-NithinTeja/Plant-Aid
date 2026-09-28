import React from 'react';
import { Sprout, ShieldCheck, Cpu, Database } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-transparent text-slate-600 text-sm py-10 border-t border-slate-300/40 relative z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-lg">
              <div className="w-8 h-8 rounded-lg bg-agri-700 flex items-center justify-center text-white">
                <Sprout className="w-5 h-5" />
              </div>
              <span>Plant-Aid Platform</span>
            </div>
            <p className="text-slate-600 max-w-sm text-xs leading-relaxed font-normal">
              Real-time edge-ready crop diagnostic and treatment advisory system. Calibrated for groundnut pathology with two-layer localization and agronomic remedy planning.
            </p>
            <div className="flex items-center space-x-4 pt-2 text-xs text-slate-500">
              <span className="flex items-center space-x-1">
                <Cpu className="w-3.5 h-3.5 text-agri-700" />
                <span>ConvNeXt-Tiny</span>
              </span>
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-agri-700" />
                <span>τ = 0.55 Calibrated</span>
              </span>
              <span className="flex items-center space-x-1">
                <Database className="w-3.5 h-3.5 text-agri-700" />
                <span>6 Classes</span>
              </span>
            </div>
          </div>

          {/* Supported Diseases */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Taxonomy Classes
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>Early Leaf Spot (Cercospora)</li>
              <li>Late Leaf Spot (Phaeoisariopsis)</li>
              <li>Rust (Puccinia arachidis)</li>
              <li>Early Rust Pustules</li>
              <li>Nutritional Chlorosis</li>
              <li className="text-agri-700 font-semibold">Healthy Foliage Baseline</li>
            </ul>
          </div>

          {/* Agronomic Remedies */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Actionable Remedies
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>Biological & Bio-Fungicides</li>
              <li>Certified Chemical Fungicides</li>
              <li>Cultural Prevention & Spacing</li>
              <li>Historical Outbreak Auditing</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-300/40 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Plant-Aid Crop Diagnostic System. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 font-mono text-[11px] text-slate-500">
            FastAPI Backend • PyTorch Inference • React/Vite Client
          </p>
        </div>
      </div>
    </footer>
  );
};
