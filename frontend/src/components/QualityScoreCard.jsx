import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Lightbulb,
  FileText,
} from 'lucide-react';

export default function QualityScoreCard({ quality }) {
  const [expanded, setExpanded] = useState(true);

  if (!quality || typeof quality.score !== 'number') {
    return null;
  }

  const {
    score,
    maxScore = 10,
    grade = 'N/A',
    passedCount = 0,
    totalCount = 0,
    licenseInfo = null,
    checks = [],
  } = quality;

  // Grade badge color styling
  const getGradeColor = (g) => {
    switch (g) {
      case 'A':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'B':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'C':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'D':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      default:
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    }
  };

  const getScoreBarGradient = (s) => {
    const ratio = s / maxScore;
    if (ratio >= 0.8) return 'from-emerald-500 via-teal-400 to-cyan-400';
    if (ratio >= 0.6) return 'from-cyan-500 via-blue-400 to-amber-400';
    if (ratio >= 0.4) return 'from-amber-500 via-orange-400 to-rose-400';
    return 'from-rose-500 to-red-600';
  };

  const failedCount = totalCount - passedCount;
  const percentage = Math.round((score / maxScore) * 100);

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-md shadow-xl shadow-slate-950/40 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">Repository Quality Scorecard</h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                <Sparkles className="w-3 h-3" /> 10-Point Benchmark
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Deterministic rubric based on documentation, setup guide, testing, and Git cleanliness
            </p>
          </div>
        </div>

        {/* Grade Badge */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="text-right">
            <span className="text-xs text-slate-400 block font-mono">GRADE</span>
            <span className="text-xs text-slate-500">
              {score >= 7.5 ? 'Strong' : score >= 6 ? 'Average' : 'Needs Work'}
            </span>
          </div>
          <div
            className={`w-12 h-12 rounded-xl border flex items-center justify-center font-extrabold text-2xl shadow-inner ${getGradeColor(
              grade
            )}`}
          >
            {grade}
          </div>
        </div>
      </div>

      {/* Score Meter & Summary */}
      <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/60 space-y-3">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white tracking-tight">{score}</span>
            <span className="text-sm font-semibold text-slate-500">/ {maxScore} pts ({percentage}%)</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> {passedCount} passed
            </span>
            {failedCount > 0 && (
              <span className="inline-flex items-center gap-1 text-rose-400">
                <AlertCircle className="w-3.5 h-3.5" /> {failedCount} to improve
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2.5 w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5">
          <div
            style={{ width: `${Math.min(100, Math.max(4, percentage))}%` }}
            className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 shadow-sm ${getScoreBarGradient(
              score
            )}`}
          />
        </div>
      </div>

      {/* Open Source License Informational Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs">
        <div className="flex items-center gap-2.5">
          <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
          <div>
            <span className="font-semibold text-slate-200">Open Source License: </span>
            <span className={licenseInfo?.exists ? 'text-cyan-300 font-medium' : 'text-slate-400'}>
              {licenseInfo?.exists
                ? `${licenseInfo.name} (Detected)`
                : 'No license file (Optional — needed only if distributing publicly)'}
            </span>
          </div>
        </div>
        <span className="text-[10px] text-slate-400 bg-slate-800/60 border border-slate-700/50 px-2 py-0.5 rounded self-start sm:self-auto">
          Informational only • Not scored
        </span>
      </div>

      {/* Expandable Breakdown Toggle */}
      <div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors border-t border-slate-800/60 pt-4"
        >
          <span className="flex items-center gap-2">
            <span>Detailed Audit Checks ({passedCount}/{totalCount} Passed)</span>
          </span>
          <span className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300">
            {expanded ? 'Collapse' : 'Expand why this score'}
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </button>

        {expanded && (
          <div className="mt-3 space-y-2.5">
            {checks.map((check) => (
              <div
                key={check.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  check.passed
                    ? 'bg-slate-950/40 border-slate-800/60'
                    : 'bg-rose-950/10 border-rose-900/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {check.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{check.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                          +{check.weight} pts
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        {check.evidence}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-mono font-semibold shrink-0 px-2 py-0.5 rounded ${
                      check.passed
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-rose-400 bg-rose-500/10'
                    }`}
                  >
                    {check.pointsEarned}/{check.weight} pts
                  </span>
                </div>

                {!check.passed && check.fix && (
                  <div className="mt-2.5 pt-2.5 border-t border-rose-900/20 flex items-start gap-2 text-xs text-amber-300/90 bg-amber-500/5 p-2 rounded-lg">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-amber-300 font-semibold">Recommended Fix: </strong>
                      {check.fix}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
