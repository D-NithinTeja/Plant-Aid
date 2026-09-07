import React from 'react';
import { 
  Scan, 
  ShieldCheck, 
  HeartHandshake, 
  ArrowRight, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import Logo from '../common/Logo';

export default function LandingPage({ onGetStarted, onLogin }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-white to-[#f8fafc] flex flex-col">
      {/* Landing Header */}
      <header className="max-w-6xl mx-auto w-full px-6 py-5 flex items-center justify-between">
        <Logo size="md" />

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#home" className="text-brand-800 font-semibold">Home</a>
          <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
          <a href="#about" className="hover:text-slate-900 transition-colors">About</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={onLogin}
            className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
          >
            Log in
          </button>
          <button
            onClick={onGetStarted}
            className="px-5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold rounded-full shadow-sm shadow-brand-700/20 transition-all hover:scale-[1.02]"
          >
            Sign up
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 md:py-16 flex flex-col justify-center">
        <div className="grid md:grid-cols-12 gap-10 items-center">
          {/* Left Text Column */}
          <div className="md:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/80 border border-brand-200 text-brand-800 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Real-Time AI Crop Diagnostics</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Healthy Plants <br />
              <span className="text-brand-700">Happier</span> Tomorrows
            </h1>

            <p className="text-base md:text-lg text-slate-600 max-w-lg leading-relaxed">
              Identify plant diseases with AI and get simple, effective treatment advice in real-time right from your device's camera.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onGetStarted}
                className="px-7 py-3.5 bg-brand-700 hover:bg-brand-800 text-white font-semibold text-base rounded-full shadow-md shadow-brand-700/25 transition-all hover:scale-[1.02] flex items-center gap-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onGetStarted}
                className="px-7 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-base rounded-full border border-slate-200/90 shadow-sm transition-colors"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Right Visual Graphic */}
          <div className="md:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-square rounded-3xl bg-gradient-to-tr from-brand-100 via-emerald-50 to-brand-200/50 p-6 flex flex-col justify-between overflow-hidden shadow-xl shadow-brand-900/5 border border-brand-100">
              {/* Decorative organic background leaves */}
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-brand-400/20 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex justify-between items-start z-10">
                <div className="bg-white/90 backdrop-blur-sm px-3.5 py-1.5 rounded-full shadow-sm text-xs font-bold text-brand-800 border border-brand-100 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-600" />
                  <span>Groundnut AI Model v1.0</span>
                </div>
              </div>

              {/* Center Leaf Visual Graphic */}
              <div className="my-auto text-center z-10 py-6">
                <div className="inline-block p-6 rounded-full bg-white shadow-lg border border-brand-100 mb-3 animate-pulse">
                  <div className="w-20 h-20 rounded-full bg-brand-600 flex items-center justify-center text-white shadow-inner">
                    <Scan className="w-10 h-10" />
                  </div>
                </div>
                <div className="font-bold text-slate-800 text-lg">Instant Crop Diagnostic</div>
                <p className="text-xs text-slate-500 max-w-[200px] mx-auto mt-1">
                  Sub-second live video inference with localized bounding box overlay
                </p>
              </div>

              {/* Bottom Badge */}
              <div className="text-right z-10">
                <span className="inline-block px-4 py-1.5 bg-brand-800 text-white font-medium text-xs rounded-full shadow-sm">
                  Greener Together 🌱
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Feature Highlights at Bottom */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 md:pt-24">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm hover:border-brand-200 hover:shadow-md transition-all flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 flex-shrink-0">
              <Scan className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Accurate Detection</h3>
              <p className="text-xs text-slate-500 mt-0.5">ConvNeXt deep vision with two-layer localization</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm hover:border-brand-200 hover:shadow-md transition-all flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Easy to Use</h3>
              <p className="text-xs text-slate-500 mt-0.5">Stream live from phone camera or drag and drop photos</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm hover:border-brand-200 hover:shadow-md transition-all flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 flex-shrink-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Healthier Plants</h3>
              <p className="text-xs text-slate-500 mt-0.5">Organic, chemical, and cultural treatment plans</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
