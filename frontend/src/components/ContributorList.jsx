import React from 'react';
import { Users, ExternalLink, GitCommit, UserCheck } from 'lucide-react';

export default function ContributorList({
  contributors = [],
  contributorCount = 0,
}) {
  const displayCount = contributorCount || contributors.length;

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-md shadow-xl shadow-slate-950/40">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Contributor Team</h3>
            <p className="text-xs text-slate-400">
              {displayCount} active contributors identified
            </p>
          </div>
        </div>
      </div>

      {contributors.length === 0 ? (
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-950/50 text-center text-slate-400 text-sm">
          No contributor records found or API rate limits restricted retrieval.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {contributors.map((contrib, idx) => (
            <div
              key={contrib.login || idx}
              className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/70 hover:border-slate-700 transition-all group flex items-center gap-3"
            >
              <img
                src={contrib.avatarUrl || `https://github.com/identicons/${contrib.login}.png`}
                alt={contrib.login || 'Contributor'}
                className="w-10 h-10 rounded-full border border-slate-700 object-cover shrink-0"
                onError={(e) => {
                  e.target.src = 'https://github.com/ghost.png';
                }}
              />
              <div className="min-w-0 flex-1">
                <a
                  href={contrib.profileUrl || `https://github.com/${contrib.login}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-slate-200 hover:text-indigo-400 flex items-center gap-1 truncate"
                >
                  <span className="truncate">{contrib.login || 'Anonymous'}</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </a>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                  <GitCommit className="w-3 h-3 text-pink-400 shrink-0" />
                  <span>
                    {(contrib.contributions || contrib.commits || 0).toLocaleString()} commits
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[11px] text-slate-500 mt-4 italic">
        * Commit numbers are descriptive activity metrics retrieved from the GitHub REST API.
      </p>
    </div>
  );
}
