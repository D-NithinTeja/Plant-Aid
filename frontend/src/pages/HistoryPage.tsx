import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  Trash2,
  Calendar,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Scan,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { HistoryLog, PaginatedHistoryResponse, Remedy } from '../types';
import { TreatmentPlanModal } from '../components/treatment/TreatmentPlanModal';

export const HistoryPage: React.FC = () => {
  const [historyItems, setHistoryItems] = useState<HistoryLog[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [diseaseFilter, setDiseaseFilter] = useState<string>('all');

  // Deletion modal
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Selected item for remedy inspection
  const [selectedLog, setSelectedLog] = useState<HistoryLog | null>(null);
  const [remediesForModal, setRemediesForModal] = useState<Remedy[]>([]);

  // Fetch paginated history from FastAPI backend
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/history?page=${page}&size=9`;
      if (diseaseFilter !== 'all') {
        url += `&disease_id=${diseaseFilter}`;
      }

      const res = await api.get<PaginatedHistoryResponse>(url);
      setHistoryItems(res.data.items || []);
      setTotalCount(res.data.total_count || 0);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      console.error('Failed to load history items', err);
    } finally {
      setLoading(false);
    }
  }, [page, diseaseFilter]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Handle Soft-Delete
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      await api.delete(`/api/history/${deleteId}`);
      setDeleteId(null);
      fetchHistory();
    } catch (err) {
      alert('Failed to soft delete record');
    } finally {
      setIsDeleting(false);
    }
  };

  // Inspect remedies for historical record
  const handleInspectRemedies = async (item: HistoryLog) => {
    setSelectedLog(item);
    try {
      const res = await api.get<{ remedies: Remedy[] }>(`/api/remedies/${item.disease_id}`);
      setRemediesForModal(res.data.remedies || []);
    } catch {
      setRemediesForModal([]);
    }
  };

  // Filter items by client search string
  const filteredItems = historyItems.filter((item) =>
    item.disease_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center space-x-2 text-agri-700 text-xs font-bold uppercase tracking-wider">
              <History className="w-4 h-4" />
              <span>Historical Field Outbreak Registry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Diagnosis History
            </h1>
          </div>

          <Link
            to="/scan"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs shadow-sm transition-all hover:scale-[1.02] touch-target self-start sm:self-auto"
          >
            <Scan className="w-4 h-4" />
            <span>Launch Live Scanner</span>
          </Link>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by disease name..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-agri-500 focus:border-agri-500"
            />
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-semibold text-slate-500 flex items-center space-x-1 pl-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </span>

            {[
              { id: 'all', label: 'All Records' },
              { id: 'healthy_leaf', label: 'Healthy' },
              { id: 'early_leaf_spot', label: 'Early Spot' },
              { id: 'late_leaf_spot', label: 'Late Spot' },
              { id: 'rust', label: 'Rust' },
              { id: 'nutrition_deficiency', label: 'Chlorosis' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setDiseaseFilter(f.id);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  diseaseFilter === f.id
                    ? 'bg-agri-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* History Records Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-500 text-sm">
            <div className="w-8 h-8 border-4 border-agri-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span>Retrieving verified farm logs...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-white rounded-3xl border border-dashed border-slate-300 p-8">
            <Scan className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">No Diagnosis Records Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || diseaseFilter !== 'all'
                ? 'No historical logs match your current search and filter settings.'
                : 'Diagnoses are saved explicitly from the Live Scanner. Start scanning crops to build your history.'}
            </p>
            <div className="pt-2">
              <Link
                to="/scan"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-agri-700 text-white font-bold text-xs hover:bg-agri-800 transition-colors"
              >
                <Scan className="w-4 h-4" />
                <span>Start Crop Scan</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const isHealthy = item.disease_name.toLowerCase().includes('healthy');
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-field hover:border-agri-300 transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-5 space-y-4">
                    {/* Top Row: Thumbnail + Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0 flex items-center justify-center text-slate-400">
                        {item.media_url ? (
                          <img
                            src={item.media_url}
                            alt={item.disease_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Scan className="w-8 h-8" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <span
                          className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border mb-1 ${
                            isHealthy
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          {isHealthy ? 'Healthy Leaf' : 'Pathogen Detected'}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 truncate">
                          {item.disease_name}
                        </h3>
                      </div>
                    </div>

                    {/* Stats & Meta */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Confidence:</span>
                        <span className="font-mono font-bold text-agri-800">
                          {(item.confidence_score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{new Date(item.diagnosis_timestamp).toLocaleDateString()}</span>
                        </span>
                        <span className="font-mono">
                          {new Date(item.diagnosis_timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleInspectRemedies(item)}
                      className="flex-1 py-2 px-3 rounded-lg bg-agri-50 border border-agri-200 text-agri-800 hover:bg-agri-100 text-xs font-bold transition-colors flex items-center justify-center space-x-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Inspect Plan</span>
                    </button>

                    <button
                      onClick={() => setDeleteId(item.id)}
                      className="p-2 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                      title="Soft delete record"
                      aria-label="Delete diagnosis record"
                    >
                      <Trash2 className="w-4 h-4 text-slate-600 hover:text-rose-700" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pt-4 flex items-center justify-between border-t border-slate-200 text-xs font-semibold text-slate-600">
            <div>
              Showing page <span className="font-mono font-bold text-slate-900">{page}</span> of{' '}
              <span className="font-mono font-bold text-slate-900">{totalPages}</span> (Total {totalCount}{' '}
              records)
            </div>

            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-40 transition-colors touch-target flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-40 transition-colors touch-target flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteId && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Confirm Record Soft Deletion</h3>
                <p className="text-xs text-slate-500">
                  This diagnosis log will be archived and hidden from your active history dashboard.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setDeleteId(null)}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  disabled={isDeleting}
                  onClick={handleDeleteConfirm}
                  className="py-2.5 px-4 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-sm"
                >
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Re-usable Treatment Plan Modal for Historical Inspection */}
        {selectedLog && (
          <TreatmentPlanModal
            isOpen={!!selectedLog}
            onClose={() => setSelectedLog(null)}
            diseaseName={selectedLog.disease_name}
            diseaseId={selectedLog.disease_id}
            confidenceScore={selectedLog.confidence_score}
            remedies={remediesForModal}
          />
        )}
      </div>
    </div>
  );
};
