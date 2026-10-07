import { useState } from 'react';
import { AggregationDemo } from './components/AggregationDemo';
import { Dashboard } from './components/Dashboard';
import { RelationalView } from './components/RelationalView';
import { WebhookPanel } from './components/WebhookPanel';
import { AddTestModal } from './components/AddTestModal';
import { runAggregationEngine } from './services/aggregation';
import type { AggregatedTestObject, AuditLog, Webhook, TestData } from './types';
import { Layers, Plus, FileText } from 'lucide-react';

function App() {
  const [currentTab, setCurrentTab] = useState<'repository' | 'events'>('repository');
  const [data, setData] = useState<AggregatedTestObject[]>([]);
  const [isAggregated, setIsAggregated] = useState(false);
  const [selectedTest, setSelectedTest] = useState<AggregatedTestObject | null>(null);
  const [isAddingTest, setIsAddingTest] = useState(false);
  
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [webhooks] = useState<Webhook[]>([{ id: 'WH-1', name: 'Jira Sync Listener', url: 'https://api.internal/webhooks/jira-sync', events: ['schema.updated', 'test.updated'] }]);
  const [schemaFields, setSchemaFields] = useState<string[]>([]);

  const addLog = (
    action: string, 
    details: string, 
    status: 'success' | 'pending' | 'failed' = 'success',
    eventType: string = 'system.info',
    target: string = 'Internal Engine',
    payload?: any
  ) => {
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString(),
      eventType,
      action,
      details,
      target,
      payload,
      status
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const handleRunAggregation = async () => {
    addLog('System Aggregation Started', 'Pulling data from Requirements, Tests, and CI/CD', 'pending', 'sync.start', 'Data Sources');
    const results = await runAggregationEngine();
    setData(results);
    setIsAggregated(true);
    addLog('System Aggregation Complete', `Successfully unified ${results.length} test entities`, 'success', 'sync.complete', 'Internal Engine', { testCount: results.length });
  };

  const handleSimulateRequirement = () => {
    addLog('New Requirement Ingested', 'REQ-3: "All API requests must include an AuthToken header"', 'success', 'requirement.ingest', 'Jira API', { reqId: 'REQ-3', type: 'Security' });
    
    setTimeout(() => {
      addLog('Schema Modification Triggered', 'Adding "requiresAuthToken" field to Test Schema based on REQ-3', 'pending', 'schema.update', 'Schema Registry');
      
      setTimeout(() => {
        setSchemaFields(prev => [...prev, 'requiresAuthToken']);
        setData(prevData => prevData.map(item => ({
          ...item,
          test: {
            ...item.test,
            requiresAuthToken: null // Assign null initially to be filled
          }
        })));
        addLog('Schema Modification Complete', 'Field "requiresAuthToken" added to Test Schema', 'success', 'schema.update', 'Schema Registry', { field: 'requiresAuthToken', type: 'boolean' });
        
        // Trigger webhook log
        setTimeout(() => {
          addLog('Webhook Fired: Jira Sync Listener', 'Payload sent to https://api.internal/webhooks/jira-sync with schema.updated event', 'success', 'webhook.fire', 'Jira Sync Service', { event: 'schema.updated', field: 'requiresAuthToken' });
        }, 500);

      }, 1000);
    }, 1000);
  };

  const handleUpdateTestField = (testId: string, field: string, value: any) => {
    setData(prev => prev.map(item => {
      if (item.test.id === testId) {
        return {
          ...item,
          test: {
            ...item.test,
            [field]: value
          }
        };
      }
      return item;
    }));
    
    // Also update selectedTest if it's open
    if (selectedTest?.test.id === testId) {
      setSelectedTest(prev => prev ? {
        ...prev,
        test: {
          ...prev.test,
          [field]: value
        }
      } : null);
    }

    addLog('Test Record Updated', `Test ${testId} field "${field}" set to ${value}`, 'success', 'test.update', 'Internal Engine', { testId, field, newValue: value });
    
    // Simulate specific webhooks based on field edited
    if (field === 'priority' || field === 'summary' || field === 'description') {
      setTimeout(() => addLog('Webhook Fired: Jira Sync', `Updating Jira issue via API for ${testId}`, 'pending', 'webhook.fire', 'Jira API', { issueId: testId, [field]: value }), 200);
      setTimeout(() => addLog('Jira Sync Complete', `Issue successfully updated`, 'success', 'webhook.response', 'Jira API'), 1200);
    } else if (field === 'status') {
      setTimeout(() => addLog('Webhook Fired: TestRail Sync', `Updating execution status for ${testId}`, 'pending', 'webhook.fire', 'TestRail API', { testRunId: testId, status: value }), 200);
      setTimeout(() => addLog('TestRail Sync Complete', `Status set to ${value}`, 'success', 'webhook.response', 'TestRail API'), 1200);
      
      // Auto-trigger bug creation if failed
      if (value === 'Failed') {
        setTimeout(() => addLog('Webhook Fired: Azure DevOps', `Automated bug creation triggered for ${testId}`, 'pending', 'webhook.fire', 'Azure DevOps API', { title: `Automated Bug: ${testId} Failed` }), 1600);
        setTimeout(() => addLog('Azure DevOps Complete', `Bug AD-1052 created and linked`, 'success', 'webhook.response', 'Azure DevOps API', { createdBugId: 'AD-1052' }), 2800);
      }
    } else {
      setTimeout(() => addLog('Webhook Fired: Universal Listener', `Payload sent with test.updated event for ${testId}`, 'success', 'webhook.fire', 'Universal Event Bus', { entity: 'test', event: 'updated', id: testId, changes: { [field]: value } }), 200);
    }
  };

  const handleAddTest = (testData: Partial<TestData>) => {
    setIsAddingTest(false);
    
    const newTestId = `TEST-${Math.floor(Math.random() * 900) + 100}`;
    const newTest: AggregatedTestObject = {
      test: {
        id: newTestId,
        description: testData.description || '',
        summary: testData.summary || '',
        priority: testData.priority || 'Medium',
        status: testData.status || 'Skipped',
        steps: testData.steps || [],
        isAutomated: testData.isAutomated || false,
      },
      requirement: null,
      cicd: null
    };

    // Incorporate any dynamic fields
    schemaFields.forEach(field => {
      newTest.test[field] = null;
    });

    setData(prev => [newTest, ...prev]);
    addLog('New Test Created', `${newTestId}: ${newTest.test.summary}`, 'success', 'test.create', 'Internal Engine', { testId: newTestId });

    // Automation Check for PR Generation
    if (testData.isAutomated && testData.steps && testData.steps.length > 0) {
      const automationKeywords = ['navigate', 'enter', 'click', 'verify', 'select', 'type'];
      const allStepsMatch = testData.steps.every(step => {
        const lowerStep = step.toLowerCase();
        return automationKeywords.some(keyword => lowerStep.startsWith(keyword));
      });

      if (allStepsMatch) {
        addLog('Automation BDD Match', `Steps match definitions. Generating PR code...`, 'success', 'system.compute', 'Automation Engine');
        setTimeout(() => addLog('Webhook Fired: GitHub PR', `Automated PR requested for ${newTestId}`, 'pending', 'webhook.fire', 'GitHub API', { prTitle: `Auto-test: ${testData.summary}`, steps: testData.steps }), 800);
        setTimeout(() => addLog('GitHub PR Created', `PR #1042 successfully opened`, 'success', 'webhook.response', 'GitHub API', { prUrl: 'https://github.com/org/repo/pull/1042', status: 'opened' }), 2000);
      } else {
        addLog('Automated Test Created', `Steps do not perfectly match definitions. Manual review required.`, 'success', 'system.info', 'Automation Engine');
      }
    } else {
      addLog('Manual Test Created', `No PR generated because test is marked as manual.`, 'success', 'system.info', 'Automation Engine');
    }
  };

  const handleRunAutomatedTest = (testId: string) => {
    addLog('Automated Test Triggered', `Manual execution requested for ${testId}`, 'pending', 'webhook.fire', 'CI/CD Pipeline', { testId, trigger: 'manual_ui' });
    
    setTimeout(() => {
      addLog('Test Execution Started', `Running test script on Jenkins Runner`, 'pending', 'system.compute', 'CI/CD Pipeline', { runner: 'jenkins-slave-04' });
    }, 1000);

    setTimeout(() => {
      const passed = Math.random() > 0.2;
      const finalStatus = passed ? 'Passed' : 'Failed';
      addLog('Test Execution Finished', `Pipeline completed with status: ${finalStatus}`, passed ? 'success' : 'failed', 'webhook.response', 'CI/CD Pipeline', { testId, status: finalStatus, duration: '14s' });
      
      const runId = Math.floor(Math.random() * 9000) + 1000;
      const newCicdData = {
        id: `EXEC-${runId}`,
        testId,
        executionEnvironment: 'jenkins-slave-04',
        artifactReferences: [
          `s3://logs/run-${runId}.log`,
          passed ? '' : `s3://artifacts/failure-screenshot-${runId}.png`
        ].filter(Boolean),
        pipelineRun: `Run #${runId}`,
        triggerSource: 'Manual UI Trigger'
      };

      setData(prev => prev.map(item => {
        if (item.test.id === testId) {
          return {
            ...item,
            test: {
              ...item.test,
              status: finalStatus
            },
            cicd: newCicdData
          };
        }
        return item;
      }));

      if (selectedTest?.test.id === testId) {
        setSelectedTest(prev => prev ? {
          ...prev,
          test: {
            ...prev.test,
            status: finalStatus
          },
          cicd: newCicdData
        } : null);
      }
    }, 3500);
  };

  const handleLinkRequirement = (testId: string, ticketId: string) => {
    const mockReqId = `REQ-${Math.floor(Math.random() * 90) + 10}`;
    const newRequirement = {
      requirementId: mockReqId,
      description: `Automatically generated requirement context for ${ticketId}`,
      acceptanceCriteria: [
        `Ensure functionality covers ${ticketId} specifications`,
        'All standard edge cases handled correctly'
      ],
      ticketAssociations: [ticketId]
    };

    setData(prev => prev.map(item => {
      if (item.test.id === testId) {
        return {
          ...item,
          requirement: newRequirement
        };
      }
      return item;
    }));

    if (selectedTest?.test.id === testId) {
      setSelectedTest(prev => prev ? {
        ...prev,
        requirement: newRequirement
      } : null);
    }

    addLog('Requirement Linkage Requested', `Linking ${ticketId} to ${testId}`, 'pending', 'webhook.fire', 'Jira API', { testId, ticketId });
    setTimeout(() => {
      addLog('Requirement Successfully Linked', `${mockReqId} associated with ${testId} from ${ticketId}`, 'success', 'webhook.response', 'Jira API', { reqId: mockReqId, ticketId });
    }, 1200);
  };
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-inner shadow-indigo-400/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 mr-8">LivingTest<span className="text-indigo-600">Repo</span></span>
            
            <nav className="flex space-x-2">
              <button 
                onClick={() => setCurrentTab('repository')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentTab === 'repository' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                Repository
              </button>
              <button 
                onClick={() => setCurrentTab('events')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentTab === 'events' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                Events
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-600 hidden sm:flex">
            <span className="px-3 py-1 bg-slate-100 rounded-full">Conference Demo</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {currentTab === 'repository' ? (
          <div className="space-y-12">
            <section>
              <AggregationDemo 
                onRunAggregation={handleRunAggregation} 
                isAggregated={isAggregated} 
              />
            </section>

            <section className={`transition-all duration-700 transform ${isAggregated ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-50 pointer-events-none'}`}>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">Single Source of Truth</h2>
                  <p className="text-slate-500 text-sm">Aggregated view of requirements, tests, and execution history.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setIsAddingTest(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-indigo-600/20"
                  >
                    <FileText className="w-4 h-4" />
                    New Test Case
                  </button>
                  <button 
                    onClick={handleSimulateRequirement}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Simulate New Requirement
                  </button>
                </div>
              </div>
              
              <Dashboard 
                data={data} 
                onSelectTest={setSelectedTest} 
                schemaFields={schemaFields}
                onUpdateField={handleUpdateTestField}
              />
            </section>
          </div>
        ) : (
          <div className="h-[800px] max-h-[80vh]">
            <WebhookPanel logs={logs} webhooks={webhooks} />
          </div>
        )}
      </main>

      {selectedTest && (
        <RelationalView 
          data={selectedTest} 
          onClose={() => setSelectedTest(null)} 
          schemaFields={schemaFields}
          onUpdateField={handleUpdateTestField}
          onLinkRequirement={handleLinkRequirement}
          onRunAutomatedTest={handleRunAutomatedTest}
        />
      )}

      {isAddingTest && (
        <AddTestModal 
          onClose={() => setIsAddingTest(false)} 
          onSave={handleAddTest} 
        />
      )}
    </div>
  );
}

export default App;
