import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Terminal,
  Play,
  Layers,
  Link2,
  Copy,
  Check,
  FileText,
} from 'lucide-react';

export default function ReadmeViewer({ readmeSummary }) {
  const [copiedSection, setCopiedSection] = useState(null);

  if (!readmeSummary || !readmeSummary.exists) {
    return (
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-md shadow-xl text-center">
        <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <h3 className="text-base font-semibold text-slate-300">No README Found</h3>
        <p className="text-xs text-slate-500 mt-1">
          This repository does not contain a standard README file.
        </p>
      </div>
    );
  }

  const copyToClipboard = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-md shadow-xl shadow-slate-950/40 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">README Intelligence</h3>
            <p className="text-xs text-slate-400">
              Parsed from {readmeSummary.filename || 'README.md'} (
              {((readmeSummary.rawLength || 0) / 1024).toFixed(1)} KB)
            </p>
          </div>
        </div>
      </div>

      {/* Purpose / Overview */}
      {readmeSummary.purpose && (
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-2">
            Project Purpose & Overview
          </span>
          <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-800/60">
            {readmeSummary.purpose}
          </p>
        </div>
      )}

      {/* Key Features */}
      {readmeSummary.keyFeatures && readmeSummary.keyFeatures.length > 0 && (
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-2.5">
            Key Features Extracted ({readmeSummary.keyFeatures.length})
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {readmeSummary.keyFeatures.map((feat, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/50 border border-slate-800/60 text-xs text-slate-300"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technologies Mentioned */}
      {readmeSummary.technologies && readmeSummary.technologies.length > 0 && (
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-2">
            Technologies & Tools Identified
          </span>
          <div className="flex flex-wrap gap-2">
            {readmeSummary.technologies.map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Installation Snippet */}
      {readmeSummary.installationInstructions && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" /> Installation Steps
            </span>
            <button
              onClick={() => copyToClipboard(readmeSummary.installationInstructions, 'install')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded bg-slate-800/60 hover:bg-slate-800 transition-colors"
            >
              {copiedSection === 'install' ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap max-h-56">
            <code>{readmeSummary.installationInstructions}</code>
          </pre>
        </div>
      )}

      {/* Usage Snippet */}
      {readmeSummary.usageInstructions && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5" /> Usage / Run Command
            </span>
            <button
              onClick={() => copyToClipboard(readmeSummary.usageInstructions, 'usage')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded bg-slate-800/60 hover:bg-slate-800 transition-colors"
            >
              {copiedSection === 'usage' ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs font-mono text-sky-400 overflow-x-auto whitespace-pre-wrap max-h-56">
            <code>{readmeSummary.usageInstructions}</code>
          </pre>
        </div>
      )}

      {/* Documentation Links */}
      {readmeSummary.links && readmeSummary.links.length > 0 && (
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-2">
            Referenced Documentation & External Links
          </span>
          <div className="flex flex-wrap gap-2">
            {readmeSummary.links.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Link2 className="w-3 h-3 text-indigo-400" />
                <span className="max-w-[200px] truncate">{link.text || link.url}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
