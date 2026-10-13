import React, { useState } from 'react';
import type { AuditLog, Webhook, Integration } from '../types';
import { mockIntegrations } from '../data/mockData';
import { 
  Activity, 
  Webhook as WebhookIcon, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Terminal, 
  Server, 
  GitMerge, 
  Layers, 
  ExternalLink, 
  Filter 
} from 'lucide-react';

interface Props {
  logs: AuditLog[];
  webhooks: Webhook[];
  integrations?: Integration[];
}

export const WebhookPanel: React.FC<Props> = ({ logs, webhooks, integrations = mockIntegrations }) => {
  const [showIntegrationsModal, setShowIntegrationsModal] = useState(false);
  const [selectedTargetFilter, setSelectedTargetFilter] = useState<string | null>(null);

  const filteredLogs = selectedTargetFilter
    ? logs.filter(log => log.target.toLowerCase().includes(selectedTargetFilter.toLowerCase()))
    : logs;

  return (
    <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden flex flex-col h-full text-slate-300">
      <div className="p-5 border-b border-slate-800 bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
            <Activity className="w-6 h-6 text-indigo-400" />
            Event & Audit Stream
          </h3>
          <p className="text-sm text-slate-400">Real-time webhook triggers and repository actions</p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          {/* Integrations Display */}
          <div className="relative">
            <button
              onClick={() => setShowIntegrationsModal(true)}
              className="flex items-center gap-2.5 bg-slate-800 hover:bg-slate-700/80 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 transition-all cursor-pointer group shadow-sm text-left"
              title="Click to view connected integrations"
            >
              <div className="flex items-center gap-1.5 text-indigo-400 font-semibold text-sm">
                <Layers className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span>Integrations</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                  {integrations.length}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 pl-1 border-l border-slate-700">
                {integrations.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-900/90 text-slate-300 border border-slate-700/60 group-hover:border-slate-600 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"></span>
                    {item.name}
                  </span>
                ))}
              </div>
            </button>
          </div>

          {/* Active Listeners */}
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-sm">
            <WebhookIcon className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">{webhooks.length} Active Listeners</span>
          </div>
        </div>
      </div>

      {selectedTargetFilter && (
        <div className="bg-indigo-950/60 border-b border-indigo-900/60 px-5 py-2 flex items-center justify-between text-xs text-indigo-200">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span>Filtering events for: <strong className="text-white capitalize">{selectedTargetFilter}</strong></span>
          </div>
          <button 
            onClick={() => setSelectedTargetFilter(null)}
            className="text-indigo-400 hover:text-white underline cursor-pointer"
          >
            Clear Filter
          </button>
        </div>
      )}
      
      <div className="flex-1 overflow-x-auto overflow-y-auto bg-slate-950">
        <table className="w-full text-left text-sm border-collapse min-w-[800px]">
          <thead className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10 text-slate-400 text-xs uppercase font-semibold">
            <tr>
              <th className="px-4 py-3 w-32">Timestamp</th>
              <th className="px-4 py-3 w-40">Event Type</th>
              <th className="px-4 py-3 w-48">Target System</th>
              <th className="px-4 py-3 w-56">Action</th>
              <th className="px-4 py-3">Details & Payload</th>
              <th className="px-4 py-3 w-24 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-24 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-500 space-y-3">
                    <Terminal className="w-10 h-10 opacity-20" />
                    <p className="text-base font-medium">Listening for repository events...</p>
                    <p className="text-sm max-w-sm text-center opacity-70">
                      {selectedTargetFilter ? `No events logged for "${selectedTargetFilter}".` : 'Trigger a sync or edit a test case to see webhook payloads generated here.'}
                    </p>
                    {selectedTargetFilter && (
                      <button
                        onClick={() => setSelectedTargetFilter(null)}
                        className="text-xs text-indigo-400 hover:underline cursor-pointer"
                      >
                        Reset Filter
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/50 transition-colors group animate-in fade-in slide-in-from-top-2 duration-300">
                  <td className="px-4 py-4 align-top font-mono text-xs text-indigo-300/80 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="px-4 py-4 align-top font-mono text-xs text-emerald-400/90 whitespace-nowrap">
                    {log.eventType}
                  </td>
                  <td className="px-4 py-4 align-top font-medium text-slate-300 flex items-center gap-2">
                    {log.target.includes('API') || log.target.includes('DevOps') ? <Server className="w-4 h-4 text-slate-500" /> : <GitMerge className="w-4 h-4 text-slate-500" />}
                    {log.target}
                  </td>
                  <td className="px-4 py-4 align-top font-semibold text-slate-200">
                    {log.action}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <p className="text-sm text-slate-300 mb-2">{log.details}</p>
                    {log.payload && (
                      <div className="bg-slate-900 rounded border border-slate-800 p-2 overflow-x-auto">
                        <pre className="text-[10px] font-mono text-indigo-200/70">
                          {JSON.stringify(log.payload, null, 2)}
                        </pre>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 align-top text-center">
                    <div className="flex justify-center">
                      {log.status === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500 bg-emerald-500/10 rounded-full" />}
                      {log.status === 'pending' && <Clock className="w-5 h-5 text-amber-500 bg-amber-500/10 rounded-full animate-pulse" />}
                      {log.status === 'failed' && <XCircle className="w-5 h-5 text-rose-500 bg-rose-500/10 rounded-full" />}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Connected Integrations Modal */}
      {showIntegrationsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Connected Integrations
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                      {integrations.length} Active
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">External toolchains and registries connected to the repository</p>
                </div>
              </div>
              <button 
                onClick={() => setShowIntegrationsModal(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Close"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 overflow-y-auto">
              {integrations.map((item) => (
                <div key={item.id} className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 hover:border-slate-600 transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-white text-base">{item.name}</h4>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-700/80 text-slate-300 font-medium">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Connected
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="text-slate-400 flex items-center gap-1.5 font-mono truncate">
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{item.endpoint}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {item.capabilities.map((cap, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-slate-900/60 text-[10px] text-indigo-300 border border-slate-700/40 font-mono">
                          {cap}
                        </span>
                      ))}
                      <button
                        onClick={() => {
                          setSelectedTargetFilter(item.name.toLowerCase().includes('ci/cd') ? 'pipeline' : item.name.toLowerCase());
                          setShowIntegrationsModal(false);
                        }}
                        className="px-2 py-0.5 rounded bg-indigo-600/30 hover:bg-indigo-600 text-[10px] text-indigo-200 hover:text-white border border-indigo-500/40 font-medium transition-colors cursor-pointer"
                        title={`Filter log by ${item.name}`}
                      >
                        Filter Logs
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
              <span className="text-xs text-slate-400">All data streams synchronized in real time</span>
              <button
                onClick={() => setShowIntegrationsModal(false)}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
