import React from 'react';
import { Link } from 'react-router-dom';
import { Scan, BookOpen, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-[82vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-transparent">
      {/* Hero Floating Card */}
      <div className="w-full max-w-4xl mx-auto bg-white/95 backdrop-blur-sm rounded-3xl p-10 sm:p-16 shadow-sm border border-slate-200/90 text-center space-y-8">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-slate-900 leading-tight">
          Real-Time Plant Disease Identification & Treatment Advisory
        </h1>

        {/* Action CTAs */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={isAuthenticated ? '/scan' : '/auth?mode=register'}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-8 py-4 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-base shadow-sm transition-all hover:scale-[1.02] touch-target"
          >
            <Scan className="w-5 h-5 text-white" />
            <span>{isAuthenticated ? 'Launch Field Scanner' : 'Start Field Scan'}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>

          <Link
            to="/guide"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-base border border-slate-300 shadow-sm transition-colors touch-target"
          >
            <BookOpen className="w-5 h-5 text-agri-700" />
            <span>Browse Pathology Catalog</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
