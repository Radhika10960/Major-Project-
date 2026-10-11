import React from 'react';
import { TrendingUp, GitCommit } from 'lucide-react';

export default function CommitActivityChart({ commitActivity = [] }) {
  if (!commitActivity || commitActivity.length === 0) {
    return null;
  }

  const maxCommits = Math.max(...commitActivity.map((d) => d.commits || 0), 1);
  const totalCommitsInPeriod = commitActivity.reduce((acc, d) => acc + (d.commits || 0), 0);

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-md shadow-xl shadow-slate-950/40">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Commit Activity Velocity</h3>
            <p className="text-xs text-slate-400">
              {commitActivity.length} recent weeks • {totalCommitsInPeriod.toLocaleString()} total commits recorded
            </p>
          </div>
        </div>
      </div>

      {/* Bar Chart Visualizer */}
      <div className="h-32 flex items-end gap-1.5 sm:gap-2 pt-6 px-2 border-b border-slate-800">
        {commitActivity.map((item, idx) => {
          const heightPercent = Math.max(
            Math.round(((item.commits || 0) / maxCommits) * 100),
            6
          );
          const dateStr = item.week
            ? new Date(item.week).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })
            : `Wk ${idx + 1}`;

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center h-full justify-end group relative"
            >
              {/* Tooltip */}
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-[11px] text-white px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-10 border border-slate-700">
                {item.commits} commits ({dateStr})
              </div>

              {/* Bar */}
              <div
                style={{ height: `${heightPercent}%` }}
                className={`w-full rounded-t transition-all duration-300 group-hover:brightness-125 ${
                  item.commits > 0
                    ? 'bg-gradient-to-t from-indigo-600 via-indigo-500 to-cyan-400 shadow-sm shadow-indigo-500/30'
                    : 'bg-slate-800/50'
                }`}
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-between text-[11px] text-slate-500 mt-2 px-2">
        <span>{commitActivity[0]?.week ? new Date(commitActivity[0].week).toLocaleDateString() : 'Earlier'}</span>
        <span>Latest Activity</span>
      </div>
    </div>
  );
}
