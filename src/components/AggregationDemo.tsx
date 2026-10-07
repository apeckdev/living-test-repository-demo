import { useState } from 'react';
import { Database, GitMerge, Settings, Play, DatabaseZap, CheckCircle2 } from 'lucide-react';

interface Props {
  onRunAggregation: () => Promise<void>;
  isAggregated: boolean;
}

export const AggregationDemo: React.FC<Props> = ({ onRunAggregation, isAggregated }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleRun = async () => {
    if (isAnimating || isAggregated) return;
    setIsAnimating(true);
    await onRunAggregation();
    setIsAnimating(false);
  };

  return (
    <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden ring-1 ring-white/10">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight">The Living Test Repository</h2>
          <p className="text-indigo-200/80 text-lg max-w-2xl mx-auto">
            A centralized dashboard demonstrating how fragmented test data is aggregated into a single source of truth.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full max-w-4xl">
          {/* Source 1: Requirements */}
          <div className="flex-1 w-full bg-slate-800/80 backdrop-blur border border-slate-700 rounded-2xl p-6 flex flex-col items-center shadow-lg relative group">
            <div className={`absolute inset-0 bg-emerald-500/10 rounded-2xl transition-opacity duration-500 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}></div>
            <div className="w-14 h-14 bg-slate-700/50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Settings className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-white font-bold mb-1">Requirements</h3>
            <p className="text-slate-400 text-sm text-center">Jira, Confluence</p>
          </div>

          {/* Connection Line & Dots */}
          <div className="hidden md:flex flex-col items-center justify-center px-2">
            <div className={`h-1 w-12 rounded-full transition-all duration-700 ${isAnimating ? 'bg-indigo-500 animate-pulse' : 'bg-slate-700'}`}></div>
          </div>

          {/* Source 2: Tests */}
          <div className="flex-1 w-full bg-slate-800/80 backdrop-blur border border-slate-700 rounded-2xl p-6 flex flex-col items-center shadow-lg relative group">
            <div className={`absolute inset-0 bg-blue-500/10 rounded-2xl transition-opacity duration-500 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}></div>
            <div className="w-14 h-14 bg-slate-700/50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Database className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-white font-bold mb-1">Existing Tests</h3>
            <p className="text-slate-400 text-sm text-center">TestRail, Xray</p>
          </div>

          {/* Connection Line & Dots */}
          <div className="hidden md:flex flex-col items-center justify-center px-2">
            <div className={`h-1 w-12 rounded-full transition-all duration-700 ${isAnimating ? 'bg-indigo-500 animate-pulse' : 'bg-slate-700'}`}></div>
          </div>

          {/* Source 3: CI/CD */}
          <div className="flex-1 w-full bg-slate-800/80 backdrop-blur border border-slate-700 rounded-2xl p-6 flex flex-col items-center shadow-lg relative group">
            <div className={`absolute inset-0 bg-amber-500/10 rounded-2xl transition-opacity duration-500 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}></div>
            <div className="w-14 h-14 bg-slate-700/50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <GitMerge className="w-7 h-7 text-amber-400" />
            </div>
            <h3 className="text-white font-bold mb-1">CI/CD Pipelines</h3>
            <p className="text-slate-400 text-sm text-center">GitHub Actions, Jenkins</p>
          </div>
        </div>

        {/* Aggregation Button & Target */}
        <div className="mt-12 flex flex-col items-center w-full max-w-4xl relative">
          {/* Flow arrows going down */}
          <div className="flex gap-40 mb-8 absolute -top-8 w-full justify-center opacity-50 pointer-events-none hidden md:flex">
             <div className={`w-0.5 h-12 transition-all duration-700 ${isAnimating ? 'bg-indigo-500 translate-y-4' : 'bg-transparent'}`}></div>
             <div className={`w-0.5 h-12 transition-all duration-700 delay-100 ${isAnimating ? 'bg-indigo-500 translate-y-4' : 'bg-transparent'}`}></div>
             <div className={`w-0.5 h-12 transition-all duration-700 delay-200 ${isAnimating ? 'bg-indigo-500 translate-y-4' : 'bg-transparent'}`}></div>
          </div>

          <button
            onClick={handleRun}
            disabled={isAnimating || isAggregated}
            className={`
              relative z-20 group overflow-hidden rounded-full font-bold text-lg px-10 py-4 shadow-xl transition-all duration-300
              ${isAggregated 
                ? 'bg-emerald-500 text-white cursor-default ring-4 ring-emerald-500/30' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-indigo-500/25 hover:-translate-y-1 active:translate-y-0'}
            `}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
            <div className="relative flex items-center justify-center gap-3">
              {isAnimating ? (
                <>
                  <DatabaseZap className="w-6 h-6 animate-pulse" />
                  Aggregating Data...
                </>
              ) : isAggregated ? (
                <>
                  <CheckCircle2 className="w-6 h-6" />
                  Test Repository Generated
                </>
              ) : (
                <>
                  <Play className="w-6 h-6" fill="currentColor" />
                  Run Aggregation
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
