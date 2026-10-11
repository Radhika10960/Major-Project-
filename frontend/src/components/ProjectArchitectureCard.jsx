import React from 'react';
import { Cpu, FileCode2, CheckCircle, ShieldCheck, Box, Hash, Files } from 'lucide-react';

export default function ProjectArchitectureCard({
  projectType = 'unknown',
  projectTypeConfidence = 'unknown',
  configFilesFound = [],
  totalFiles = 0,
  totalLines = 0,
}) {
  const getConfidenceBadge = (confidence) => {
    switch (confidence) {
      case 'high':
        return {
          label: 'High Confidence',
          class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        };
      case 'medium':
        return {
          label: 'Medium Confidence',
          class: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        };
      case 'low':
        return {
          label: 'Inferred / Low',
          class: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
        };
      default:
        return {
          label: 'Unspecified',
          class: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        };
    }
  };

  const badge = getConfidenceBadge(projectTypeConfidence);

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-md shadow-xl shadow-slate-950/40">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Project Architecture</h3>
            <p className="text-xs text-slate-400">Inferred stack & configuration manifests</p>
          </div>
        </div>
        <span
          className={`px-2.5 py-1 text-xs font-medium rounded-full border flex items-center gap-1.5 ${badge.class}`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          {badge.label}
        </span>
      </div>

      {/* Main Detected Type Card */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-950/40 border border-indigo-500/20 mb-5">
        <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider block mb-1">
          Identified Framework / Archetype
        </span>
        <div className="text-lg font-bold text-white flex items-center gap-2">
          <Box className="w-5 h-5 text-indigo-400 shrink-0" />
          <span>{projectType}</span>
        </div>
      </div>

      {/* Quick Stats: Lines and Files */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Hash className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Est. Source Lines</span>
            <span className="text-base font-semibold text-white">
              {totalLines ? totalLines.toLocaleString() : 'N/A'}
            </span>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Files className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Root Files</span>
            <span className="text-base font-semibold text-white">
              {totalFiles || configFilesFound.length || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Configuration Files Found */}
      <div>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">
          Configuration Manifests Found ({configFilesFound.length})
        </span>
        {configFilesFound.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {configFilesFound.map((file) => (
              <span
                key={file}
                className="px-2.5 py-1 text-xs font-mono bg-slate-950 border border-slate-800 text-slate-300 rounded-lg flex items-center gap-1.5 hover:border-slate-700 transition-colors"
              >
                <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
                {file}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No standard build or package config files found in root.</p>
        )}
      </div>
    </div>
  );
}
