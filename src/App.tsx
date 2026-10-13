import { useState } from 'react';
import { AggregationDemo } from './components/AggregationDemo';
import { Dashboard } from './components/Dashboard';
import { RelationalView } from './components/RelationalView';
import { WebhookPanel } from './components/WebhookPanel';
import { AddTestModal } from './components/AddTestModal';
import { runAggregationEngine } from './services/aggregation';
import { mockIntegrations } from './data/mockData';
import type { AggregatedTestObject, AuditLog, Webhook, TestData, Integration } from './types';
import { Layers, Plus, FileText, GitPullRequest, ArrowRight, XCircle } from 'lucide-react';

function App() {
  const [currentTab, setCurrentTab] = useState<'repository' | 'events'>('repository');
  const [data, setData] = useState<AggregatedTestObject[]>([]);
  const [isAggregated, setIsAggregated] = useState(false);
  const [selectedTest, setSelectedTest] = useState<AggregatedTestObject | null>(null);
  const [isAddingTest, setIsAddingTest] = useState(false);
  const [activeTargetFilter, setActiveTargetFilter] = useState<string | null>(null);
  const [toastNotification, setToastNotification] = useState<{
    id: string;
    title: string;
    message: string;
    prUrl?: string;
  } | null>(null);
  
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [webhooks] = useState<Webhook[]>([{ id: 'WH-1', name: 'Jira Sync Listener', url: 'https://api.internal/webhooks/jira-sync', events: ['schema.updated', 'test.updated'] }]);
  const [integrations] = useState<Integration[]>(mockIntegrations);
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
        setData(prevData => {
          return prevData.map(item => {
            // Find other tests with the same underlying requirement to link them
            const reqId = item.requirement?.requirementId;
            let linkedTests: string[] = item.test.linkedTests || [];
            
            if (reqId) {
              const peers = prevData
                .filter(other => other.requirement?.requirementId === reqId && other.test.id !== item.test.id)
                .map(other => other.test.id);
                
              linkedTests = Array.from(new Set([...linkedTests, ...peers]));
            }

            return {
              ...item,
              test: {
                ...item.test,
                requiresAuthToken: null, // Assign null initially to be filled
                linkedTests: linkedTests.length > 0 ? linkedTests : undefined
              }
            };
          });
        });
        addLog('Schema Modification Complete', 'Field "requiresAuthToken" added to Test Schema', 'success', 'schema.update', 'Schema Registry', { field: 'requiresAuthToken', type: 'boolean' });
        
        // Trigger webhook log
        setTimeout(() => {
          addLog('Webhook Fired: Jira Sync Listener', 'Payload sent to https://api.internal/webhooks/jira-sync with schema.updated event', 'success', 'webhook.fire', 'Jira Sync Service', { event: 'schema.updated', field: 'requiresAuthToken' });
        }, 500);

      }, 1000);
    }, 1000);
  };

  const handleUpdateTestField = (testId: string, field: string, value: any) => {
    // Find main test and any linked tests
    const mainTest = data.find(item => item.test.id === testId);
    const linkedTests = mainTest?.test.linkedTests || [];
    const allTestsToUpdate = [testId, ...linkedTests];

    setData(prev => prev.map(item => {
      if (allTestsToUpdate.includes(item.test.id)) {
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
    if (selectedTest && allTestsToUpdate.includes(selectedTest.test.id)) {
      setSelectedTest(prev => prev ? {
        ...prev,
        test: {
          ...prev.test,
          [field]: value
        }
      } : null);
    }

    allTestsToUpdate.forEach(id => {
      addLog('Test Record Updated', `Test ${id} field "${field}" set to ${value}`, 'success', 'test.update', 'Internal Engine', { testId: id, field, newValue: value });
      
      // Simulate specific webhooks based on field edited
      if (field === 'priority' || field === 'summary' || field === 'description') {
        setTimeout(() => addLog('Webhook Fired: Jira Sync', `Updating Jira issue via API for ${id}`, 'pending', 'webhook.fire', 'Jira API', { issueId: id, [field]: value }), 200);
        setTimeout(() => addLog('Jira Sync Complete', `Issue successfully updated`, 'success', 'webhook.response', 'Jira API'), 1200);
      } else if (field === 'status') {
        setTimeout(() => addLog('Webhook Fired: TestRail Sync', `Updating execution status for ${id}`, 'pending', 'webhook.fire', 'TestRail API', { testRunId: id, status: value }), 200);
        setTimeout(() => addLog('TestRail Sync Complete', `Status set to ${value}`, 'success', 'webhook.response', 'TestRail API'), 1200);
        
        // Auto-trigger bug creation if failed
        if (value === 'Failed') {
          setTimeout(() => addLog('Webhook Fired: Azure DevOps', `Automated bug creation triggered for ${id}`, 'pending', 'webhook.fire', 'Azure DevOps API', { title: `Automated Bug: ${id} Failed` }), 1600);
          setTimeout(() => addLog('Azure DevOps Complete', `Bug AD-1052 created and linked`, 'success', 'webhook.response', 'Azure DevOps API', { createdBugId: 'AD-1052' }), 2800);
        }
      } else {
        setTimeout(() => addLog('Webhook Fired: Universal Listener', `Payload sent with test.updated event for ${id}`, 'success', 'webhook.fire', 'Universal Event Bus', { entity: 'test', event: 'updated', id: id, changes: { [field]: value } }), 200);
      }
    });
  };

  const handleAddTest = (testData: Partial<TestData>) => {
    setIsAddingTest(false);
    
    const newTestId = `TEST-${Math.floor(Math.random() * 900) + 100}`;
    const effectiveSteps = (testData.steps && testData.steps.length > 0)
      ? testData.steps
      : [
          `Navigate to ${testData.summary || 'application module'}`,
          `Execute test action for ${newTestId}`,
          `Verify successful outcome and assertion`
        ];

    const newTest: AggregatedTestObject = {
      test: {
        id: newTestId,
        description: testData.description || '',
        summary: testData.summary || '',
        priority: testData.priority || 'Medium',
        status: testData.status || 'Skipped',
        steps: effectiveSteps,
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
    addLog('New Test Ticket Created', `${newTestId}: ${newTest.test.summary}`, 'success', 'ticket.create', 'Internal Engine', { 
      ticketId: newTestId, 
      type: testData.isAutomated ? 'Automated Test' : 'Manual Test',
      stepsCount: effectiveSteps.length 
    });

    // Automation Check & PR Generation for Automated Tests
    if (testData.isAutomated) {
      const prNumber = Math.floor(Math.random() * 800) + 1040;
      const prUrl = `https://github.com/org/living-test-repo/pull/${prNumber}`;
      const branchName = `test/${newTestId.toLowerCase()}-automated`;

      // 1. Fake check beforehand: verify steps against repository definitions
      setTimeout(() => {
        addLog(
          'Verifying Automation Steps',
          `Checking ${effectiveSteps.length} step(s) against repository step definitions in living-test-repo...`,
          'pending',
          'github.step_check',
          'GitHub Integration',
          {
            repository: 'github.com/org/living-test-repo',
            testId: newTestId,
            stepsToCheck: effectiveSteps,
            targetBranch: 'main'
          }
        );
      }, 500);

      // 2. Fake check result: all steps exist in automation
      setTimeout(() => {
        addLog(
          'Automation Step Definitions Verified',
          `All ${effectiveSteps.length} step(s) exist in automation repository. Step definitions matched.`,
          'success',
          'github.steps_verified',
          'GitHub Integration',
          {
            repository: 'github.com/org/living-test-repo',
            testId: newTestId,
            matchedSteps: effectiveSteps,
            stepCoverage: '100%',
            status: 'ALL_DEFINITIONS_EXIST'
          }
        );
      }, 1300);

      // 3. PR Created event on the GitHub integration
      setTimeout(() => {
        // Also attach the PR info to the test record in state so UI can show it
        setData(prev => prev.map(item => {
          if (item.test.id === newTestId) {
            return {
              ...item,
              test: {
                ...item.test,
                prNumber,
                prUrl
              }
            };
          }
          return item;
        }));

        addLog(
          'GitHub PR Created',
          `PR #${prNumber} created for new automated test ${newTestId}: "${testData.summary}". Automated test definition added to repository.`,
          'success',
          'github.pr_created',
          'GitHub Integration',
          {
            prNumber,
            prUrl,
            testId: newTestId,
            title: `[Auto-Test] ${newTestId}: ${testData.summary}`,
            headBranch: branchName,
            baseBranch: 'main',
            stepsIncluded: effectiveSteps,
            status: 'opened',
            checks: 'passed'
          }
        );

        setToastNotification({
          id: `toast-${Date.now()}`,
          title: `GitHub PR #${prNumber} Created`,
          message: `Automated PR generated for ${newTestId}: "${testData.summary}"`,
          prUrl
        });

        setTimeout(() => {
          setToastNotification(null);
        }, 8000);
      }, 2200);
    } else {
      addLog('Manual Test Case Ingested', `Test ${newTestId} marked as manual. Automated step verification and GitHub PR creation skipped.`, 'success', 'test.info', 'Automation Engine', { testId: newTestId });
    }
  };

  const handleRunAutomatedTest = (testId: string) => {
    addLog('Automated Test Triggered', `Manual execution requested for ${testId}`, 'pending', 'webhook.fire', 'CI/CD Pipeline', { testId, trigger: 'manual_ui' });
    
    const isADO = Math.random() > 0.5;
    const runnerName = isADO ? 'ado-agent-pool-ubuntu' : 'jenkins-node-04';
    const pipelineName = isADO ? 'Azure Pipelines' : 'Jenkins Runner';

    setTimeout(() => {
      addLog('Test Execution Started', `Running test script on ${pipelineName}`, 'pending', 'system.compute', 'CI/CD Pipeline', { runner: runnerName });
    }, 1000);

    setTimeout(() => {
      const passed = Math.random() > 0.2;
      const finalStatus = passed ? 'Passed' : 'Failed';
      addLog('Test Execution Finished', `Pipeline completed with status: ${finalStatus}`, passed ? 'success' : 'failed', 'webhook.response', 'CI/CD Pipeline', { testId, status: finalStatus, duration: '14s' });
      
      const runId = Math.floor(Math.random() * 9000) + 1000;
      const newCicdData = {
        id: `EXEC-${runId}`,
        testId,
        executionEnvironment: runnerName,
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
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${currentTab === 'events' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <span>Events</span>
                {logs.length > 0 && (
                  <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${currentTab === 'events' ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-200 text-slate-700'}`}>
                    {logs.length}
                  </span>
                )}
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
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-indigo-600/20 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    New Ticket / Test Case
                  </button>
                  <button 
                    onClick={handleSimulateRequirement}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm cursor-pointer"
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
            <WebhookPanel 
              logs={logs} 
              webhooks={webhooks} 
              integrations={integrations} 
              activeTargetFilter={activeTargetFilter}
              onFilterChange={setActiveTargetFilter}
            />
          </div>
        )}
      </main>

      {selectedTest && (
        <RelationalView 
          key={selectedTest.test.id}
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

      {/* Toast Notification for GitHub PR */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 border border-slate-700 text-white rounded-xl shadow-2xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg shrink-0 mt-0.5">
            <GitPullRequest className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              {toastNotification.title}
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Verified
              </span>
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 truncate">{toastNotification.message}</p>
            <div className="mt-2.5 flex items-center gap-3">
              <button
                onClick={() => {
                  setCurrentTab('events');
                  setActiveTargetFilter('github');
                  setToastNotification(null);
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>View in Events Stream</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <button
            onClick={() => setToastNotification(null)}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-md transition-colors cursor-pointer"
            title="Dismiss"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
