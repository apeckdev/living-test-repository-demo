import React, { useState } from 'react';
import { XCircle, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import type { TestData } from '../types';

interface Props {
  onClose: () => void;
  onSave: (test: Partial<TestData>) => void;
}

// Pre-defined step templates that match automation
const AUTOMATION_STEP_HINTS = [
  "Navigate to [page]",
  "Enter [text] into [field]",
  "Click [button] button",
  "Verify [element] is visible"
];

export const AddTestModal: React.FC<Props> = ({ onClose, onSave }) => {
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [steps, setSteps] = useState<string[]>(['']);
  const [isAutomated, setIsAutomated] = useState(false);

  const handleAddStep = () => setSteps([...steps, '']);
  
  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      summary,
      description,
      priority,
      status: 'Skipped', // Default for new tests
      steps: steps.filter(s => s.trim() !== ''),
      isAutomated
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden ring-1 ring-slate-900/5">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-900">Create New Test Case</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="add-test-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Summary</label>
                <input 
                  required
                  type="text" 
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  placeholder="e.g. Verify user profile updates"
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea 
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Detailed explanation of the test..."
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow resize-y"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Priority</label>
                <select 
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <input 
                  type="checkbox" 
                  id="isAutomated"
                  checked={isAutomated}
                  onChange={e => setIsAutomated(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isAutomated" className="text-sm font-semibold text-slate-700 cursor-pointer">
                  Mark as Automated Test
                  <p className="text-xs font-normal text-slate-500">If steps match automation keywords, a PR will be generated.</p>
                </label>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Test Steps</label>
                  <p className="text-xs text-slate-500 mt-1">Write steps matching BDD formats to enable automated PR generation.</p>
                </div>
                <button type="button" onClick={handleAddStep} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" /> Add Step
                </button>
              </div>

              <div className="space-y-3">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold mt-1.5">
                      {idx + 1}
                    </span>
                    <input 
                      required
                      type="text" 
                      value={step}
                      onChange={e => handleStepChange(idx, e.target.value)}
                      placeholder={AUTOMATION_STEP_HINTS[idx % AUTOMATION_STEP_HINTS.length]}
                      className="flex-1 bg-white border border-slate-300 text-slate-900 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                    />
                    {steps.length > 1 && (
                      <button type="button" onClick={() => handleRemoveStep(idx)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors mt-0.5">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-700 font-medium hover:bg-slate-200 rounded-lg transition-colors">
            Cancel
          </button>
          <button type="submit" form="add-test-form" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm shadow-indigo-600/20 transition-all flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> Save Test
          </button>
        </div>
      </div>
    </div>
  );
};
