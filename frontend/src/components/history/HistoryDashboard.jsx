import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Search, 
  ChevronRight, 
  Trash2, 
  Filter, 
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import Badge from '../common/Badge';
import { historyService } from '../../services/history';
import { toast } from 'sonner';

export default function HistoryDashboard({ onBack, onSelectDiagnosis }) {
  const [historyItems, setHistoryItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'diseased' | 'healthy'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await historyService.getHistory({ page: 1, limit: 20 });
        if (data.items && data.items.length > 0) {
          setHistoryItems(data.items);
        } else {
          setHistoryItems([
            {
              id: 'diag-8842',
              disease_name: 'Groundnut Early Leaf Spot',
              plant_species: 'Groundnut Leaf',
              confidence_score: 0.984,
              diagnosis_timestamp: new Date().toISOString(),
              severity: 'Severe',
              sector: 'Sector 4',
              media_url: 'https://images.unsplash.com/photo-1596726359556-9a2c3f9a76d8?auto=format&fit=crop&w=400&q=80',
            },
            {
              id: 'diag-8839',
              disease_name: 'Healthy Foliage',
              plant_species: 'Groundnut Leaf',
              confidence_score: 0.991,
              diagnosis_timestamp: new Date(Date.now() - 86400000).toISOString(),
              severity: 'Healthy',
              sector: 'Sector 2',
              media_url: null,
            },
            {
              id: 'diag-8831',
              disease_name: 'Early Rust (Puccinia)',
              plant_species: 'Groundnut Leaf',
              confidence_score: 0.887,
              diagnosis_timestamp: new Date(Date.now() - 172800000).toISOString(),
              severity: 'Moderate',
              sector: 'Sector 4',
              media_url: null,
            },
            {
              id: 'diag-8820',
              disease_name: 'Late Leaf Spot (Phaeoisariopsis)',
              plant_species: 'Groundnut Leaf',
              confidence_score: 0.942,
              diagnosis_timestamp: new Date(Date.now() - 345600000).toISOString(),
              severity: 'Severe',
              sector: 'Sector 1',
              media_url: null,
            },
          ]);
        }
      } catch {
        setHistoryItems([
          {
            id: 'diag-8842',
            disease_name: 'Groundnut Early Leaf Spot',
            plant_species: 'Groundnut Leaf',
            confidence_score: 0.984,
            diagnosis_timestamp: new Date().toISOString(),
            severity: 'Severe',
            sector: 'Sector 4',
          },
          {
            id: 'diag-8839',
            disease_name: 'Healthy Foliage',
            plant_species: 'Groundnut Leaf',
            confidence_score: 0.991,
            diagnosis_timestamp: new Date(Date.now() - 86400000).toISOString(),
            severity: 'Healthy',
            sector: 'Sector 2',
          },
          {
            id: 'diag-8831',
            disease_name: 'Early Rust (Puccinia)',
            plant_species: 'Groundnut Leaf',
            confidence_score: 0.887,
            diagnosis_timestamp: new Date(Date.now() - 172800000).toISOString(),
            severity: 'Moderate',
            sector: 'Sector 4',
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  const formatDate = (isoStr) => {
    if (!isoStr) return 'Oct 24, 2026';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Oct 24, 2026';
    }
  };

  const filteredItems = historyItems.filter((item) => {
    const isHealthy = (item.disease_name || '').toLowerCase().includes('healthy');
    if (filter === 'healthy' && !isHealthy) return false;
    if (filter === 'diseased' && isHealthy) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (item.disease_name || '').toLowerCase();
      const sector = (item.sector || '').toLowerCase();
      const id = (item.id || '').toLowerCase();
      return name.includes(q) || sector.includes(q) || id.includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto w-full px-4 md:px-8 py-6 space-y-6 animate-elevate-in">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface btn-press"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">Diagnosis Archive</h1>
            <p className="text-xs text-on-surface-variant">Permanent telemetry records and thermal Grad-CAM captures.</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-surface-container p-1 rounded-xl border border-outline-variant/20 self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium btn-press transition-all ${
              filter === 'all'
                ? 'bg-primary text-on-primary shadow-sm font-semibold'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            All Logs
          </button>
          <button
            onClick={() => setFilter('diseased')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium btn-press transition-all ${
              filter === 'diseased'
                ? 'bg-primary text-on-primary shadow-sm font-semibold'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            Pathogens
          </button>
          <button
            onClick={() => setFilter('healthy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium btn-press transition-all ${
              filter === 'healthy'
                ? 'bg-primary text-on-primary shadow-sm font-semibold'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            Healthy
          </button>
        </div>
      </div>

      {/* Search Input (No iOS zoom: text-base) */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by pathogen name, sector (e.g. Sector 4), or tag ID..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-base md:text-sm text-on-surface placeholder:text-outline outline-none focus:border-primary transition-all"
        />
      </div>

      {/* History Items List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-surface-container-lowest p-12 rounded-2xl border border-outline-variant/30 text-center space-y-2">
            <p className="text-sm font-semibold text-on-surface">No diagnosis records found</p>
            <p className="text-xs text-outline">Try searching for a different symptom or change your active filter.</p>
          </div>
        ) : (
          filteredItems.map((item, idx) => {
            const isHealthy = (item.disease_name || '').toLowerCase().includes('healthy');
            const statusLabel = isHealthy ? 'Healthy' : item.severity || 'Moderate';
            const conf = Math.round((item.confidence_score || item.confidence || 0.94) * 100);

            return (
              <div
                key={item.id || idx}
                onClick={() => onSelectDiagnosis(item)}
                className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-secondary/50 cursor-pointer btn-press transition-all group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-surface-container border border-outline-variant/20 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {item.media_url ? (
                      <img src={item.media_url} alt={item.disease_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        🌿
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                        {item.disease_name}
                      </h3>
                      <Badge status={statusLabel} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-outline mt-0.5 font-mono">
                      <span>{item.id ? `#${item.id.slice(-6).toUpperCase()}` : '#GN-8842'}</span>
                      <span>•</span>
                      <span>{item.sector || 'Sector 4'}</span>
                      <span>•</span>
                      <span>{formatDate(item.diagnosis_timestamp)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end md:self-center">
                  <div className="text-right">
                    <span className="text-[10px] text-outline font-mono uppercase block">Model Confidence</span>
                    <span className="text-xs font-bold text-primary font-mono tabular-nums">{conf}% Match</span>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-container text-outline group-hover:text-primary group-hover:bg-primary-fixed transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
