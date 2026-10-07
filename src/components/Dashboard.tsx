import type { AggregatedTestObject } from '../types';
import { CheckCircle, XCircle, AlertCircle, ArrowRight, Eye, Edit2 } from 'lucide-react';

interface Props {
  data: AggregatedTestObject[];
  onSelectTest: (test: AggregatedTestObject) => void;
  schemaFields?: string[];
  onUpdateField?: (testId: string, field: string, value: any) => void;
}

export const Dashboard: React.FC<Props> = ({ data, onSelectTest, schemaFields = [], onUpdateField }) => {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'passed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            <CheckCircle className="w-3.5 h-3.5" /> Passed
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20">
            <XCircle className="w-3.5 h-3.5" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20">
            <AlertCircle className="w-3.5 h-3.5" /> {status}
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colorMap: Record<string, string> = {
      'High': 'bg-rose-100 text-rose-800',
      'Medium': 'bg-amber-100 text-amber-800',
      'Low': 'bg-slate-100 text-slate-800'
    };
    const colors = colorMap[priority] || 'bg-slate-100 text-slate-800';
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors}`}>
        {priority}
      </span>
    );
  };

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-white rounded-2xl shadow-sm border border-slate-200 border-dashed">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4">
          <ArrowRight className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No Data Aggregated</h3>
        <p className="text-slate-500 max-w-md">
          Run the aggregation engine to pull data from Requirements, Existing Tests, and CI/CD Pipelines into the Single Source of Truth.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-900">Unified Test Catalog</h2>
        <span className="text-sm text-slate-500 font-medium">{data.length} records found</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 bg-slate-50 uppercase font-semibold">
            <tr>
              <th scope="col" className="px-6 py-4 rounded-tl-lg">ID</th>
              <th scope="col" className="px-6 py-4">Summary</th>
              <th scope="col" className="px-6 py-4">Status</th>
              <th scope="col" className="px-6 py-4">Priority</th>
              {schemaFields.map(field => (
                <th key={field} scope="col" className="px-6 py-4 text-indigo-600 flex items-center gap-1">
                  <Edit2 className="w-3 h-3" /> {field}
                </th>
              ))}
              <th scope="col" className="px-6 py-4 text-center">Coverage</th>
              <th scope="col" className="px-6 py-4 text-right rounded-tr-lg">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item) => (
              <tr 
                key={item.test.id} 
                className="hover:bg-indigo-50/30 transition-colors group cursor-pointer"
                onClick={() => onSelectTest(item)}
              >
                <td className="px-6 py-4 font-mono text-indigo-600 font-medium">
                  {item.test.id}
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">
                  {item.test.summary}
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(item.test.status)}
                </td>
                <td className="px-6 py-4">
                  {getPriorityBadge(item.test.priority)}
                </td>
                {schemaFields.map(field => (
                  <td key={field} className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={item.test[field] !== null ? String(item.test[field]) : ''}
                      onChange={(e) => onUpdateField && onUpdateField(item.test.id, field, e.target.value === 'true' ? true : e.target.value === 'false' ? false : e.target.value)}
                      className={`text-xs rounded border ${item.test[field] === null ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-slate-300 bg-white text-slate-700'} px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500`}
                    >
                      <option value="" disabled>Not Set</option>
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  </td>
                ))}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${item.requirement ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-200'}`} title={item.requirement ? 'Requirement Linked' : 'No Requirement'}></span>
                    <span className={`w-2 h-2 rounded-full ${item.cicd ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-slate-200'}`} title={item.cicd ? 'CI/CD Linked' : 'No CI/CD'}></span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTest(item);
                    }}
                    className="inline-flex items-center justify-center p-2 text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 rounded-lg transition-all"
                    title="View Details"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
