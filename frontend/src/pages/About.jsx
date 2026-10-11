import React from 'react';
import {
  GitPullRequest,
  ShieldCheck,
  Zap,
  Code2,
  Database,
  Layers,
  Sparkles,
  Server,
  Cpu,
  CheckCircle2,
} from 'lucide-react';

export default function About() {
  const steps = [
    {
      num: '01',
      title: 'Target Ingestion & Validation',
      desc: 'Validates GitHub URL format, prevents SSRF vulnerabilities, and parses canonical owner/repo identifiers.',
    },
    {
      num: '02',
      title: 'Parallel Intelligence Gathering',
      desc: 'Retrieves metadata, language byte maps, contributor rosters, commit stats, README documents, and root directory trees.',
    },
    {
      num: '03',
      title: 'Heuristic & AST Classification',
      desc: 'Extracts install commands, features, and detects project architecture (Next.js, React SPA, Node.js API, Django, etc.).',
    },
    {
      num: '04',
      title: 'Interactive Dashboard Delivery',
      desc: 'Provides structured visualizations, language volume percentages, and shareable reporting URLs.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>About PR Quality Reporter</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Modern Codebase Intelligence & Quality Auditing
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Built to provide developers, team leads, and reviewers instant deep visibility into GitHub repositories without manual cloning.
        </p>
      </div>

      {/* Analysis Pipeline */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-md">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-400" />
          <span>End-to-End Analysis Pipeline</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {steps.map((step) => (
            <div
              key={step.num}
              className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-3.5"
            >
              <span className="text-lg font-extrabold text-indigo-400 font-mono shrink-0">
                {step.num}
              </span>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technology Stack */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2.5 mb-4">
            <Server className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-semibold text-white">Backend Infrastructure</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Node.js ES Modules & Express 4</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>MongoDB & Mongoose Schema Object Modeling</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>GitHub REST API Integration with Rate Limiting</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Jest Automated Test Suites (100% passing)</span>
            </li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2.5 mb-4">
            <Code2 className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-semibold text-white">Frontend Experience</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>React 19 & React Router 7</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Vite Lightning-fast Bundler</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Tailwind CSS v4 Modern Design System</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Lucide Iconography & Glassmorphic Dashboard</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}