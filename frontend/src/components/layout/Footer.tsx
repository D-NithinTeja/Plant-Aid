import React from 'react';
import { Sprout, ShieldCheck, Cpu, Database } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2 text-white font-bold text-lg">
              <div className="w-8 h-8 rounded-lg bg-agri-600 flex items-center justify-center text-white">
                <Sprout className="w-5 h-5" />
              </div>
              <span>Plant-Aid Platform</span>
            </div>
            <p className="text-slate-400 max-w-sm text-xs leading-relaxed">
              Real-time edge-ready artificial intelligence crop diagnostic and treatment advisory system. Calibrated for groundnut pathology with two-layer localization and agronomic remedy planning.
            </p>
            <div className="flex items-center space-x-4 pt-2 text-xs text-slate-400">
              <span className="flex items-center space-x-1">
                <Cpu className="w-3.5 h-3.5 text-agri-400" />
                <span>ConvNeXt-Tiny</span>
              </span>
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-agri-400" />
                <span>τ = 0.55 Calibrated</span>
              </span>
              <span className="flex items-center space-x-1">
                <Database className="w-3.5 h-3.5 text-agri-400" />
                <span>6 Groundnut Classes</span>
              </span>
            </div>
          </div>

          {/* Supported Diseases */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Taxonomy Classes
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li className="hover:text-slate-200 transition-colors">Early Leaf Spot (Cercospora)</li>
              <li className="hover:text-slate-200 transition-colors">Late Leaf Spot (Phaeoisariopsis)</li>
              <li className="hover:text-slate-200 transition-colors">Rust (Puccinia arachidis)</li>
              <li className="hover:text-slate-200 transition-colors">Early Rust Pustules</li>
              <li className="hover:text-slate-200 transition-colors">Nutritional Chlorosis</li>
              <li className="text-agri-400 font-medium">Healthy Foliage Baseline</li>
            </ul>
          </div>

          {/* Agronomic Remedies */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Actionable Remedies
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li className="hover:text-slate-200 transition-colors">Biological & Bio-Fungicides</li>
              <li className="hover:text-slate-200 transition-colors">Certified Chemical Fungicides</li>
              <li className="hover:text-slate-200 transition-colors">Cultural Prevention & Spacing</li>
              <li className="hover:text-slate-200 transition-colors">Historical Outbreak Auditing</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Plant-Aid Crop Diagnostic System. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 font-mono text-[11px]">
            FastAPI Backend • PyTorch Inference • React/Vite Client
          </p>
        </div>
      </div>
    </footer>
  );
};
