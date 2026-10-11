import React from 'react';
import { Code, Layers } from 'lucide-react';

const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Kotlin: '#A97BFF',
  Swift: '#F05138',
  Shell: '#89e051',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Dockerfile: '#384d54',
  Markdown: '#083fa1',
  JSON: '#292929',
  YAML: '#cb171e',
  SQL: '#e38c00',
};

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function LanguageBar({ languages = [] }) {
  if (!languages || languages.length === 0) {
    return (
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 text-center text-slate-400 text-sm">
        No language statistics available for this repository.
      </div>
    );
  }

  const totalBytes = languages.reduce((acc, l) => acc + (l.totalBytes || 0), 0);

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-md shadow-xl shadow-slate-950/40">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Language Breakdown</h3>
            <p className="text-xs text-slate-400">{languages.length} detected • {formatBytes(totalBytes)} source code</p>
          </div>
        </div>
      </div>

      {/* Stacked Progress Bar */}
      <div className="h-3 w-full bg-slate-800/80 rounded-full overflow-hidden flex shadow-inner mb-6">
        {languages.map((lang, idx) => {
          const color = LANGUAGE_COLORS[lang.language] || '#818cf8';
          const pct = Math.max(lang.percentage || 0, 0.5);
          return (
            <div
              key={lang.language || idx}
              style={{
                width: `${pct}%`,
                backgroundColor: color,
              }}
              title={`${lang.language}: ${lang.percentage}%`}
              className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full hover:opacity-90 relative group"
            />
          );
        })}
      </div>

      {/* Language Chips Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {languages.map((lang, idx) => {
          const color = LANGUAGE_COLORS[lang.language] || '#818cf8';
          return (
            <div
              key={lang.language || idx}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/60 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: color }}
                />
                <div className="min-w-0">
                  <span className="text-sm font-medium text-slate-200 block truncate">
                    {lang.language}
                  </span>
                  {lang.extensions && lang.extensions.length > 0 && (
                    <span className="text-[11px] text-slate-500 font-mono truncate block">
                      {lang.extensions.slice(0, 3).join(', ')}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0 ml-3">
                <span className="text-sm font-semibold text-white block">
                  {lang.percentage}%
                </span>
                <span className="text-[11px] text-slate-400 block font-mono">
                  {formatBytes(lang.totalBytes)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
