import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Scan,
  Upload,
  History,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Calendar,
  Layers,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { HistoryLog, PaginatedHistoryResponse } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [historyItems, setHistoryItems] = useState<HistoryLog[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRecentHistory = async () => {
      try {
        const res = await api.get<PaginatedHistoryResponse>('/api/history?page=1&size=4');
        setHistoryItems(res.data.items || []);
        setTotalCount(res.data.total_count || 0);
      } catch (err) {
        console.error('Failed to load recent history logs', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentHistory();
  }, []);

  const healthyCount = historyItems.filter((i) => i.disease_id.includes('healthy')).length;
  const infectedCount = historyItems.length - healthyCount;

  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Banner */}
        <div className="bg-agri-950 border border-agri-900 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-agri-900 border border-agri-700 text-agri-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-agri-400" />
              <span>Groundnut Agronomic Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.user_name || 'Agronomist'}!
            </h1>
            <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
              Field-ready diagnostic pipeline calibrated for rapid leaf lesion identification, confidence scoring, and immediate organic and chemical remedy guidance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/scan"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-agri-500 hover:bg-agri-400 text-slate-950 font-bold text-sm shadow-md transition-all hover:scale-[1.02] touch-target"
            >
              <Scan className="w-4 h-4 text-slate-950" />
              <span>Start Camera Scan</span>
            </Link>

            <Link
              to="/scan?mode=upload"
              className="inline-flex items-center space-x-2 px-4 py-3 rounded-xl bg-agri-900 hover:bg-agri-800 text-slate-200 font-medium text-sm border border-agri-800 transition-colors touch-target"
            >
              <Upload className="w-4 h-4 text-agri-400" />
              <span>Upload Photo</span>
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
              <span>Total Field Logs</span>
              <Activity className="w-4 h-4 text-agri-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono">{totalCount}</div>
            <div className="text-[11px] text-slate-600">Persisted diagnosis records</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
              <span>Healthy Baseline Scans</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-700 font-mono">{healthyCount}</div>
            <div className="text-[11px] text-slate-600">Non-pathological foliage</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
              <span>Confirmed Pathologies</span>
              <Layers className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-3xl font-extrabold text-amber-700 font-mono">{infectedCount}</div>
            <div className="text-[11px] text-slate-600">Active fungal/stress cases</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
              <span>Pathology Protocols</span>
              <BookOpen className="w-4 h-4 text-agri-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono">6</div>
            <div className="text-[11px] text-slate-600">Active treatment guides</div>
          </div>
        </div>

        {/* Quick Launch Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/scan"
            className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-agri-500 hover:shadow-field transition-all space-y-3"
          >
            <div className="w-12 h-12 rounded-xl bg-agri-100 text-agri-800 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Scan className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center justify-between">
              <span>Real-Time Foliage Scanner</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-agri-600 transition-colors" />
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Streams camera video at 1.5s intervals with HSV leaf isolation, bounding box lesion localization, and instant calibrated confidence.
            </p>
          </Link>

          <Link
            to="/history"
            className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-agri-500 hover:shadow-field transition-all space-y-3"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center justify-between">
              <span>Outbreak History & Records</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Review saved diagnoses, inspect captured foliage bounding boxes, track past outbreak clusters, and manage farm logs.
            </p>
          </Link>

          <Link
            to="/guide"
            className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-agri-500 hover:shadow-field transition-all space-y-3"
          >
            <div className="w-12 h-12 rounded-xl bg-soil-100 text-soil-900 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center justify-between">
              <span>Taxonomy & Remedy Guide</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-soil-700 transition-colors" />
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Browse biological bio-fungicides, chemical active ingredients, and cultural spacing practices for all 6 groundnut classes.
            </p>
          </Link>
        </div>

        {/* Recent Diagnoses Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent Field Diagnoses</h2>
              <p className="text-xs text-slate-500">Confirmed records saved to your farm database</p>
            </div>
            <Link
              to="/history"
              className="text-xs font-semibold text-agri-700 hover:text-agri-800 flex items-center space-x-1"
            >
              <span>View full log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Loading farm history...</div>
          ) : historyItems.length === 0 ? (
            <div className="py-12 text-center space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Scan className="w-10 h-10 text-slate-400 mx-auto" />
              <div className="text-sm font-semibold text-slate-700">No diagnoses recorded yet</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Point your mobile camera at groundnut foliage to perform real-time scanning and explicitly save confirmed cases.
              </p>
              <div className="pt-2">
                <Link
                  to="/scan"
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-agri-700 text-white text-xs font-bold hover:bg-agri-800 transition-colors"
                >
                  <Scan className="w-3.5 h-3.5" />
                  <span>Scan Foliage Now</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {historyItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center text-slate-400">
                      {item.media_url ? (
                        <img
                          src={item.media_url}
                          alt={item.disease_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Scan className="w-6 h-6" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{item.disease_name}</h4>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{new Date(item.diagnosis_timestamp).toLocaleDateString()}</span>
                        </span>
                        <span>•</span>
                        <span className="font-mono font-medium text-agri-700">
                          {(item.confidence_score * 100).toFixed(1)}% conf
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/history`}
                    className="flex-shrink-0 text-xs font-bold text-agri-700 hover:text-agri-800 px-3 py-1.5 rounded-lg bg-agri-50 border border-agri-200 hover:bg-agri-100 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
