import { useState } from 'react';
import type { AggregatedTestObject } from '../types';
import { Server, CheckCircle, XCircle, AlertCircle, FileText, GitCommit, Link as LinkIcon, ListChecks, Code, Database, Edit2 } from 'lucide-react';

interface Props {
  data: AggregatedTestObject;
  onClose: () => void;
  schemaFields?: string[];
  onUpdateField?: (testId: string, field: string, value: any) => void;
  onLinkRequirement?: (testId: string, ticketId: string) => void;
  onRunAutomatedTest?: (testId: string) => void;
}

export const RelationalView: React.FC<Props> = ({ data, onClose, schemaFields = [], onUpdateField, onLinkRequirement, onRunAutomatedTest }) => {
  const [activeTab, setActiveTab] = useState<'relational' | 'json'>('relational');
  const [ticketId, setTicketId] = useState('');
  const { test, requirement, cicd } = data;

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'passed': return <CheckCircle className="w-6 h-6 text-emerald-500" />;
      case 'failed': return <XCircle className="w-6 h-6 text-rose-500" />;
      default: return <AlertCircle className="w-6 h-6 text-amber-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden ring-1 ring-slate-900/5">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50/50 gap-4">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative group">
                {getStatusIcon(test.status)}
                <select 
                  value={test.status} 
                  onChange={(e) => onUpdateField && onUpdateField(test.id, 'status', e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  title="Change Status"
                >
                  <option value="Passed">Passed</option>
                  <option value="Failed">Failed</option>
                  <option value="Skipped">Skipped</option>
                </select>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center flex-wrap gap-2">
                {test.id}: 
                <input 
                  type="text" 
                  value={test.summary} 
                  onChange={(e) => onUpdateField && onUpdateField(test.id, 'summary', e.target.value)}
                  className="bg-transparent border-b border-dashed border-slate-300 hover:border-slate-500 focus:border-indigo-500 outline-none w-full max-w-[300px] sm:max-w-md font-bold text-slate-900"
                />
              </h2>
            </div>
            <textarea 
              value={test.description}
              onChange={(e) => onUpdateField && onUpdateField(test.id, 'description', e.target.value)}
              className="text-slate-600 ml-9 w-full max-w-xl bg-transparent border-b border-dashed border-slate-300 hover:border-slate-500 focus:border-indigo-500 outline-none resize-none leading-relaxed"
              rows={2}
            />
            <div className="ml-9 mt-2 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-500">Priority:</span>
                <select 
                  value={test.priority} 
                  onChange={(e) => onUpdateField && onUpdateField(test.id, 'priority', e.target.value)}
                  className="text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded outline-none border border-transparent focus:border-indigo-500 cursor-pointer transition-colors"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-500">Type:</span>
                <span className={`text-xs font-medium px-2 py-1 rounded-md ${test.isAutomated ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                  {test.isAutomated ? 'Automated' : 'Manual'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 self-end sm:self-auto ml-9 sm:ml-0">
            <div className="flex p-1 bg-slate-200/50 rounded-lg">
              <button 
                onClick={() => setActiveTab('relational')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-colors ${activeTab === 'relational' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Database className="w-4 h-4" /> Relational
              </button>
              <button 
                onClick={() => setActiveTab('json')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-colors ${activeTab === 'json' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Code className="w-4 h-4" /> Schema JSON
              </button>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white">
          {activeTab === 'relational' ? (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {schemaFields.length > 0 && (
                  <div className="bg-indigo-50/30 rounded-xl p-5 border border-indigo-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-indigo-900 flex items-center gap-2 mb-4">
                      <Edit2 className="w-5 h-5 text-indigo-500" />
                      Dynamic Fields
                    </h3>
                    <div className="space-y-3">
                      {schemaFields.map(field => (
                        <div key={field} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                          <span className="font-medium text-slate-700 text-sm">{field}:</span>
                          <select
                            value={test[field] !== null ? String(test[field]) : ''}
                            onChange={(e) => onUpdateField && onUpdateField(test.id, field, e.target.value === 'true' ? true : e.target.value === 'false' ? false : e.target.value)}
                            className={`text-sm rounded border ${test[field] === null ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-slate-300 bg-white text-slate-700'} px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500`}
                          >
                            <option value="" disabled>Not Set (Missing Requirement Info)</option>
                            <option value="true">True</option>
                            <option value="false">False</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                    <ListChecks className="w-5 h-5 text-slate-500" />
                    Test Steps
                  </h3>
                  <ol className="list-decimal list-inside space-y-2 text-slate-600">
                    {test.steps.map((step, idx) => (
                      <li key={idx} className="pl-1 leading-relaxed text-sm">{step}</li>
                    ))}
                  </ol>
                </div>

                {/* CI/CD Context */}
                {cicd ? (
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                      <Server className="w-5 h-5 text-slate-500" />
                      CI/CD Context
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-slate-700 min-w-[120px]">Environment:</span>
                        <span className="text-slate-600">{cicd.executionEnvironment}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-slate-700 min-w-[120px]">Pipeline Run:</span>
                        <span className="text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100/50">{cicd.pipelineRun}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-slate-700 min-w-[120px]">Trigger:</span>
                        <span className="text-slate-600 flex items-center gap-1">
                          <GitCommit className="w-3 h-3" /> {cicd.triggerSource}
                        </span>
                      </div>
                      <div className="pt-2 mt-2 border-t border-slate-200">
                        <span className="font-medium text-slate-700 block mb-2">Artifacts:</span>
                        <div className="flex flex-wrap gap-2">
                          {cicd.artifactReferences.map((ref, idx) => (
                            <span key={idx} className="text-xs bg-white text-slate-600 px-2 py-1 rounded-md border border-slate-200 flex items-center gap-1 shadow-sm">
                              <LinkIcon className="w-3 h-3" /> {ref}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                   <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 text-slate-500 italic flex flex-col items-center justify-center text-sm space-y-4">
                     <span>No CI/CD data available for this test.</span>
                     {test.isAutomated && (
                       <button 
                         onClick={() => onRunAutomatedTest && onRunAutomatedTest(test.id)}
                         className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg not-italic shadow-sm transition-colors"
                       >
                         Manually Trigger Run
                       </button>
                     )}
                   </div>
                )}
              </div>

              {/* Right Column: Requirements Context */}
              <div>
                {requirement ? (
                  <div className="bg-emerald-50/30 rounded-xl p-5 border border-emerald-100 shadow-sm h-full">
                    <h3 className="text-lg font-semibold text-emerald-900 flex items-center gap-2 mb-4">
                      <FileText className="w-5 h-5 text-emerald-500" />
                      Requirement Linkage
                    </h3>
                    
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md">
                          {requirement.requirementId}
                        </span>
                      </div>
                      <p className="text-emerald-800 text-sm leading-relaxed">{requirement.description}</p>
                    </div>

                    <div className="mb-4">
                      <span className="font-medium text-emerald-900 text-sm block mb-2">Acceptance Criteria:</span>
                      <ul className="space-y-2">
                        {requirement.acceptanceCriteria.map((ac, idx) => (
                          <li key={idx} className="text-sm text-emerald-700 flex items-start gap-2 bg-white/60 p-2.5 rounded-lg border border-emerald-100/50">
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{ac}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-emerald-100/50 mt-auto">
                      <span className="font-medium text-emerald-900 text-sm block mb-2">Associated Tickets:</span>
                      <div className="flex gap-2">
                        {requirement.ticketAssociations.map((ticket, idx) => (
                          <span key={idx} className="text-xs font-medium bg-white text-emerald-700 px-2 py-1.5 rounded-md shadow-sm border border-emerald-100">
                            {ticket}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                   <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col items-center justify-center text-sm h-full space-y-4">
                     <span className="text-slate-500 italic">No requirement linked to this test.</span>
                     <div className="flex flex-col sm:flex-row gap-2 w-full max-w-[240px]">
                       <input 
                         type="text" 
                         value={ticketId}
                         onChange={(e) => setTicketId(e.target.value)}
                         placeholder="e.g. JIRA-4001"
                         className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                       />
                       <button 
                         onClick={() => {
                           if (ticketId.trim() && onLinkRequirement) {
                             onLinkRequirement(test.id, ticketId.trim());
                             setTicketId('');
                           }
                         }}
                         disabled={!ticketId.trim()}
                         className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-lg font-medium shadow-sm transition-colors whitespace-nowrap"
                       >
                         Link
                       </button>
                     </div>
                   </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 h-full bg-slate-900 text-slate-300 font-mono text-sm overflow-auto">
              <pre className="animate-in fade-in duration-300">
                <code dangerouslySetInnerHTML={{ 
                  __html: JSON.stringify(data, null, 2)
                    .replace(/"([^"]+)":/g, '<span class="text-indigo-400">"$1"</span>:')
                    .replace(/: ("[^"]+")/g, ': <span class="text-emerald-400">$1</span>')
                    .replace(/: (true|false|null|[0-9]+)/g, ': <span class="text-amber-400">$1</span>')
                }} />
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
