import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  Star,
  GitFork,
  AlertCircle,
  Clock,
  RefreshCw,
  Share2,
  Calendar,
  CheckCircle2,
  FileCode,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { getAnalysis, analyzeRepository } from '../services/api';
import LanguageBar from '../components/LanguageBar';
import ProjectArchitectureCard from '../components/ProjectArchitectureCard';
import ContributorList from '../components/ContributorList';
import ReadmeViewer from '../components/ReadmeViewer';
import CommitActivityChart from '../components/CommitActivityChart';
import QualityScoreCard from '../components/QualityScoreCard';

export default function AnalysisDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchAnalysisData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAnalysis(id);
      if (res?.success && res.data) {
        setAnalysis(res.data);
      } else {
        setError(res?.error?.message || 'Could not find analysis record.');
      }
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to connect to the backend API.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAnalysisData();
    }
  }, [id]);

  const handleReanalyze = async () => {
    if (!analysis?.repositoryUrl) return;
    try {
      setReanalyzing(true);
      const res = await analyzeRepository(analysis.repositoryUrl);
      if (res?.data?.analysisId) {
        navigate(`/analysis/${res.data.analysisId}`);
        fetchAnalysisData();
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to re-trigger analysis');
    } finally {
      setReanalyzing(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Loading Skeleton State
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
        <div className="h-6 w-36 bg-slate-800 rounded-lg" />
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="h-10 w-2/3 bg-slate-800 rounded-xl" />
          <div className="h-5 w-1/2 bg-slate-800/60 rounded-lg" />
          <div className="flex gap-4 pt-4">
            <div className="h-8 w-24 bg-slate-800 rounded-lg" />
            <div className="h-8 w-24 bg-slate-800 rounded-lg" />
            <div className="h-8 w-24 bg-slate-800 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-72 bg-slate-900/40 border border-slate-800 rounded-2xl" />
          <div className="h-72 bg-slate-900/40 border border-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Error State
  if (error || !analysis) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-rose-500/10">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Analysis Not Available</h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto mb-8">
          {error || 'The requested repository analysis record could not be loaded.'}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/20"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Analyzer
        </Link>
      </div>
    );
  }

  const meta = analysis.metadata || {};
  const owner = meta.owner || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Search</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'Copied Link!' : 'Share Report'}</span>
          </button>
          <button
            onClick={handleReanalyze}
            disabled={reanalyzing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reanalyzing ? 'animate-spin' : ''}`} />
            <span>{reanalyzing ? 'Analyzing…' : 'Refresh Analysis'}</span>
          </button>
        </div>
      </div>

      {/* Hero Repository Banner */}
      <div className="relative rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-900/90 via-slate-900/50 to-slate-950 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-slate-950/50 overflow-hidden">
        {/* Glow ambient accent */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4 sm:gap-5 min-w-0">
            <img
              src={owner.avatarUrl || `https://github.com/identicons/${meta.name}.png`}
              alt={owner.login || 'Owner'}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-indigo-500/30 bg-slate-950 object-cover shadow-xl shrink-0"
              onError={(e) => {
                e.target.src = 'https://github.com/ghost.png';
              }}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-sm font-medium text-indigo-400">
                  {analysis.owner}
                </span>
                <span className="text-slate-600">/</span>
                <h1 className="text-xl sm:text-2xl font-bold text-white truncate">
                  {meta.name || analysis.repo}
                </h1>
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-slate-800 border border-slate-700 text-slate-300 uppercase tracking-wider">
                  {meta.visibility || 'Public'}
                </span>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed max-w-3xl mb-4 line-clamp-2">
                {meta.description || 'No description provided by the repository.'}
              </p>

              {/* Badges / Stats Bar */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                  <Star className="w-3.5 h-3.5 fill-amber-300" />
                  <span className="font-semibold">{(meta.stars || 0).toLocaleString()}</span>
                  <span className="text-amber-400/80">stars</span>
                </div>

                <div className="flex items-center gap-1.5 text-sky-300 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-lg">
                  <GitFork className="w-3.5 h-3.5" />
                  <span className="font-semibold">{(meta.forks || 0).toLocaleString()}</span>
                  <span className="text-sky-400/80">forks</span>
                </div>

                {meta.license?.name && (
                  <div className="flex items-center gap-1.5 text-slate-300 bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-lg">
                    <Shield className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{meta.license.spdxId || meta.license.name}</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-slate-400 bg-slate-900/60 border border-slate-800 px-2.5 py-1 rounded-lg">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Analyzed {new Date(analysis.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          <a
            href={meta.htmlUrl || analysis.repositoryUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 hover:border-slate-600 transition-all shrink-0 self-start shadow-md"
          >
            <span>View on GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Repository Quality Scorecard */}
      {analysis.quality && (
        <QualityScoreCard quality={analysis.quality} />
      )}

      {/* Main Analysis Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Code & Architecture */}
        <div className="space-y-8">
          <ProjectArchitectureCard
            projectType={analysis.projectType}
            projectTypeConfidence={analysis.projectTypeConfidence}
            configFilesFound={analysis.configFilesFound}
            totalFiles={analysis.totalFiles}
            totalLines={analysis.totalLines}
          />

          <LanguageBar languages={analysis.languages} />

          <CommitActivityChart
            commitActivity={analysis.commitActivity}
            lastPushedAt={analysis.metadata?.pushedAt}
          />
        </div>

        {/* Right Column: README & Contributors */}
        <div className="space-y-8">
          <ReadmeViewer readmeSummary={analysis.readmeSummary} />

          <ContributorList
            contributors={analysis.contributors}
            contributorCount={analysis.contributorCount}
          />
        </div>
      </div>
    </div>
  );
}
