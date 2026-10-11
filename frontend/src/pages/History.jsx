import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  History as HistoryIcon,
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Star,
  GitFork,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { getAnalyses } from '../services/api';

export default function History() {
  const [analyses, setAnalyses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchHistory = async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await getAnalyses(pageNum, 12);
      if (res?.success && res.data) {
        setAnalyses(res.data.analyses || []);
        setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0 });
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(page);
  }, [page]);

  const filtered = analyses.filter((item) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      item.fullName?.toLowerCase().includes(q) ||
      item.projectType?.toLowerCase().includes(q) ||
      item.metadata?.language?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <HistoryIcon className="w-4 h-4" />
            <span>Analysis Archive</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Analyzed Repositories
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse through {pagination.total || 0} previously evaluated GitHub codebases.
          </p>
        </div>

        {/* Filter Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by repo or tech…"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Grid of Analysis Records */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-44 bg-slate-900/60 rounded-2xl border border-slate-800" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl bg-slate-950/40">
          <HistoryIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white">No Analyses Found</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1 mb-6">
            {searchFilter ? 'No analyzed repos match your query.' : 'No repositories have been analyzed yet.'}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all"
          >
            Analyze First Repository
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => {
            const meta = item.metadata || {};
            return (
              <div
                key={item._id}
                className="group p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 transition-all hover:shadow-xl hover:shadow-indigo-500/5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider truncate">
                      {item.owner}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        item.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors truncate mb-1.5">
                    {item.repo || item.fullName}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 h-8">
                    {meta.description || 'No description available for this codebase.'}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                    {meta.stars !== undefined && (
                      <span className="flex items-center gap-1 text-amber-300">
                        <Star className="w-3 h-3 fill-amber-300" />
                        {meta.stars.toLocaleString()}
                      </span>
                    )}
                    {meta.language && (
                      <span className="flex items-center gap-1 text-slate-300">
                        <Layers className="w-3 h-3 text-indigo-400" />
                        {meta.language}
                      </span>
                    )}
                    {item.projectType && item.projectType !== 'unknown' && (
                      <span className="px-2 py-0.5 text-[10px] rounded bg-slate-800 text-slate-300 truncate max-w-[120px]">
                        {item.projectType}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>

                  <Link
                    to={`/analysis/${item._id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>View Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-slate-800">
          <span className="text-xs text-slate-400">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
