import React from 'react';
import {
  Scan,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Eye,
  CheckCircle2,
  Stethoscope,
  Microscope,
  Leaf
} from 'lucide-react';
import Logo from '../common/Logo';

export default function LandingPage({ onGetStarted, onLogin }) {
  return (
    <div className="min-h-[100svh] bg-surface flex flex-col justify-between">
      {/* Top Header */}
      <header className="max-w-6xl mx-auto w-full px-6 py-5 flex items-center justify-between">
        <Logo size="md" />

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-on-surface-variant">
          <a href="#science" className="hover:text-primary transition-colors">Science & ViT Models</a>
          <a href="#pathogens" className="hover:text-primary transition-colors">Pathogen Index</a>
          <a href="#enterprise" className="hover:text-primary transition-colors">Farm Enterprise</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={onLogin}
            className="px-4 py-2 text-xs md:text-sm font-semibold text-on-surface hover:text-primary transition-colors btn-press"
          >
            Sign In
          </button>
          <button
            onClick={onGetStarted}
            className="px-5 py-2.5 bg-primary hover:bg-primary-container text-on-primary text-xs md:text-sm font-semibold rounded-xl shadow-sm btn-press"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero / Value Proposition Section */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 md:py-16 flex flex-col justify-center">
        <div className="grid md:grid-cols-12 gap-10 items-center">

          {/* Left Editorial Text */}
          <div className="md:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container border border-outline-variant/30 text-primary text-xs font-mono">
              <Leaf className="w-3.5 h-3.5 text-secondary" />
              <span>AI Agronomy Engine // v4.2</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-on-surface tracking-tight leading-[1.1]">
              Instant plant pathology, <br />
              <span className="text-primary italic font-serif">precision treatments.</span>
            </h1>

            <p className="text-sm md:text-base text-on-surface-variant max-w-lg leading-relaxed">
              Plant-Aid bridges advanced computer vision with field-tested agronomy. Capture a diseased leaf or failing crop zone to receive instant, accurate diagnoses and tailored recovery protocols.
            </p>

            {/* 3 Compact Feature Points */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-1">
                <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center mb-2">
                  <Microscope className="w-4 h-4 text-secondary-fixed" />
                </div>
                <h2 className="text-xs font-bold text-on-surface">Identify Pathogens</h2>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Real-time classification across 450+ crop diseases.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-1">
                <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center mb-2">
                  <Eye className="w-4 h-4 text-secondary-fixed" />
                </div>
                <h2 className="text-xs font-bold text-on-surface">Visual Attention</h2>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Grad-CAM heatmaps highlight chlorotic halos and spore clusters.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-1">
                <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center mb-2">
                  <Stethoscope className="w-4 h-4 text-secondary-fixed" />
                </div>
                <h2 className="text-xs font-bold text-on-surface">Practical Cures</h2>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Field dosages for organic & chemical interventions.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={onGetStarted}
                className="px-6 py-3.5 bg-primary text-on-primary font-semibold text-sm rounded-xl shadow-md btn-press flex items-center gap-2"
              >
                <span>Launch Field Scanner</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onLogin}
                className="px-6 py-3.5 bg-surface-container text-on-surface font-semibold text-sm rounded-xl hover:bg-surface-container-high btn-press border border-outline-variant/20"
              >
                Already have an account? Log In
              </button>
            </div>
          </div>

          {/* Right Visual Graphic */}
          <div className="md:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-sm aspect-[4/5] rounded-2xl bg-surface-container-low border border-outline-variant/30 overflow-hidden shadow-2xl p-4 flex flex-col justify-between">
              <div className="relative w-full h-3/5 rounded-xl overflow-hidden bg-black">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/76/%27Cercospora_capsici.jpg?utm_source=en.wikipedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled"
                  alt="Groundnut leaf pathology"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                  <div className="text-white text-xs font-mono">
                    <span className="text-secondary-fixed font-bold">98.4% Match:</span> Early Leaf Spot
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs font-mono text-outline">
                  <span>AgriNet ViT v2.8</span>
                  <span className="text-secondary font-bold">NOMINAL</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-container text-xs space-y-1">
                  <p className="font-bold text-on-surface">Target Pathogen: Cercospora</p>
                  <p className="text-[11px] text-on-surface-variant">Recommended: Chlorothalonil 720 SC (2.0 mL/L)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full px-6 py-4 border-t border-outline-variant/20 text-xs text-outline flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© 2026 Plant-Aid Agronomy Systems. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-primary">Privacy Policy</a>
          <a href="#" className="hover:text-primary">Terms of Service</a>
          <a href="#" className="hover:text-primary">Field API Docs</a>
        </div>
      </footer>
    </div>
  );
}
