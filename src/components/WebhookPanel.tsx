import type { AuditLog, Webhook } from '../types';
import { Activity, Webhook as WebhookIcon, CheckCircle2, Clock, XCircle, Terminal, Server, GitMerge } from 'lucide-react';

interface Props {
  logs: AuditLog[];
  webhooks: Webhook[];
}

export const WebhookPanel: React.FC<Props> = ({ logs, webhooks }) => {
  return (
    <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden flex flex-col h-full text-slate-300">
      <div className="p-5 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
            <Activity className="w-6 h-6 text-indigo-400" />
            Event & Audit Stream
          </h3>
          <p className="text-sm text-slate-400">Real-time webhook triggers and repository actions</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
          <WebhookIcon className="w-5 h-5 text-emerald-400" />
          <span className="text-emerald-400 font-semibold">{webhooks.length} Active Listeners</span>
        </div>
      </div>
      
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
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-24 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-500 space-y-3">
                    <Terminal className="w-10 h-10 opacity-20" />
                    <p className="text-base font-medium">Listening for repository events...</p>
                    <p className="text-sm max-w-sm text-center opacity-70">Trigger a sync or edit a test case to see webhook payloads generated here.</p>
                  </div>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
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
    </div>
  );
};
