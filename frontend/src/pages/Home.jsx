import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  GitPullRequest,
  Search,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  Users,
  BookOpen,
  TrendingUp,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { analyzeRepository, getAnalyses } from '../services/api';

const QUICK_REPOS = [
  { name: 'expressjs/express', url: 'https://github.com/expressjs/express' },
  { name: 'facebook/react', url: 'https://github.com/facebook/react' },
  { name: 'vitejs/vite', url: 'https://github.com/vitejs/vite' },
  { name: 'nodejs/node', url: 'https://github.com/nodejs/node' },
];

export default function Home() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentAnalyses, setRecentAnalyses] = useState([]);

  useEffect(() => {
    getAnalyses(1, 3).then((res) => {
      if (res?.success && res.data?.analyses) {
        setRecentAnalyses(res.data.analyses);
      }
    }).catch(() => {});
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await analyzeRepository(url.trim());
      if (res?.data?.analysisId) {
        navigate(`/analysis/${res.data.analysisId}`);
      } else {
        setError('No analysis identifier returned from server.');
      }
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to start repository analysis. Ensure the URL is public and valid.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden py-12 sm:py-20">
      {/* Background ambient radial gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Phase 4 Automated Code & Pull Request Intelligence</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Decode Any GitHub Repository{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              In Seconds
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Instant architectural detection, byte-accurate language distribution, team contributor velocity, and automated README intelligence extraction.
          </p>
        </div>

        {/* Input Card */}
        <div className="max-w-2xl mx-auto">
          <form
            onSubmit={handleFormSubmit}
            className="p-2 sm:p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl flex flex-col sm:flex-row gap-2 transition-all focus-within:border-indigo-500/50"
          >
            <div className="relative flex-1 flex items-center">
              <GitPullRequest className="w-5 h-5 text-indigo-400 absolute left-3.5 pointer-events-none" />
              <input
                id="repository-url-input"
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/owner/repository"
                className="w-full pl-11 pr-4 py-3 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>
            <button
              id="analyze-submit-button"
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-60 shrink-0 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing Codebase…</span>
                </>
              ) : (
                <>
                  <span>Analyze Repository</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Error Message Alert */}
          {error && (
            <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5 text-left animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Repo Chips */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span className="text-slate-500">Quick tests:</span>
            {QUICK_REPOS.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => setUrl(item.url)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-12 text-left">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Architecture Detection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Scans root manifests to classify full-stack, SPA, API, or containerized archetypes with high precision.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Language Composition</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calculates exact byte volumes, percentages, and standard extensions across all source files.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">README Intelligence</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extracts core project purpose, key bullet features, tech stack mentions, and one-click install commands.
            </p>
          </div>
        </div>

        {/* Recent Analyses Preview Section */}
        {recentAnalyses.length > 0 && (
          <div className="pt-12 text-left">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Recent Evaluations
              </h2>
              <Link
                to="/history"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span>View all history</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {recentAnalyses.map((item) => (
                <Link
                  key={item._id}
                  to={`/analysis/${item._id}`}
                  className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between group"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors block truncate">
                      {item.fullName || item.repo}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {item.projectType || 'Analyzed'}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}