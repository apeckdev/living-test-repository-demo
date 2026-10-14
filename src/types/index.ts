// ============================================================================
// Living Test Repository - Data Models & Type Definitions
// Supports: Jira Data Center (REST v2), Xray Data Center (Raven API),
// Azure DevOps (ADO Pipelines & Test Runs), Git Automated Test Definitions,
// Drift Detection & Assessment, and Selective Field Ingestion.
// ============================================================================

// ----------------------------------------------------------------------------
// 1. Xray Data Center & Jira DC Test Entities
// ----------------------------------------------------------------------------

export interface XrayStep {
  id: string;
  index: number;
  action: string;
  data?: string;
  result: string;
}

export type XrayTestType = 'Manual' | 'Cucumber' | 'Generic';

export interface TestData {
  id: string; // e.g. 'TEST-101'
  issueKey?: string; // Jira DC issue key (e.g. 'TEST-101' or 'PROJ-101')
  description: string;
  summary: string;
  status: string; // e.g. 'Passed' | 'Failed' | 'Skipped' | 'Todo'
  priority: string; // e.g. 'High' | 'Medium' | 'Low'
  steps: string[]; // Standard step list (for backwards compatibility)
  xraySteps?: XrayStep[]; // Native Xray DC manual step definitions
  testType?: XrayTestType;
  isAutomated?: boolean;
  linkedTests?: string[];
  prUrl?: string;
  prNumber?: number;
  components?: string[];
  fixVersions?: string[];
  labels?: string[];
  lastXrayModified?: string;
  lastXrayAuthor?: string;
  customFields?: Record<string, any>;
  [key: string]: any; // Allow dynamic / selective fields
}

// ----------------------------------------------------------------------------
// 2. Jira Data Center Requirements & User Stories
// ----------------------------------------------------------------------------

export type JiraIssueType = 'Epic' | 'Story' | 'Bug' | 'Requirement' | 'Test';

export interface RequirementData {
  requirementId: string; // e.g. 'REQ-1'
  key?: string; // Jira DC Issue Key, e.g. 'REQ-1' or 'JIRA-1001'
  summary?: string;
  description: string;
  issueType?: JiraIssueType | string;
  acceptanceCriteria: string[];
  ticketAssociations: string[];
  components?: string[];
  fixVersions?: string[];
  epicKey?: string;
  epicName?: string;
  storyPoints?: number;
  customFields?: Record<string, any>;
}

// ----------------------------------------------------------------------------
// 3. Azure DevOps (ADO) CI/CD & Test Runs
// ----------------------------------------------------------------------------

export interface CICDData {
  id: string;
  testId: string;
  executionEnvironment: string; // e.g. 'Azure DevOps Self-Hosted Agent (Ubuntu 22.04)'
  artifactReferences: string[];
  pipelineRun: string; // e.g. 'ADO-Release-Build-104'
  triggerSource: string; // e.g. 'Merge to Main', 'Nightly Scheduled Run'
  adoOrganization?: string;
  adoProject?: string;
  pipelineId?: number;
  pipelineName?: string;
  runId?: number;
  runUrl?: string;
  durationSeconds?: number;
  agentPool?: string;
  testRunId?: number; // ADO Test Management Run ID
  associatedXrayExecutionKey?: string; // e.g. 'EXEC-204'
  timestamp?: string;
}

// ----------------------------------------------------------------------------
// 4. Automated Code Definitions (from Git Test Repository)
// ----------------------------------------------------------------------------

export interface AutomatedCodeStep {
  stepNumber: number;
  description: string;
  type: 'action' | 'assertion' | 'setup';
  codeSnippet: string;
}

export interface AutomatedCodeDefinition {
  id: string;
  testCaseKey: string; // Referenced Xray ticket key (e.g. 'TEST-101')
  repository: string; // e.g. 'dev.azure.com/org/project/_git/e2e-tests'
  branch: string; // e.g. 'main'
  filePath: string; // e.g. 'tests/e2e/auth/login.spec.ts'
  lineRange: { start: number; end: number };
  framework: 'Playwright' | 'Cypress' | 'Jest' | 'SpecFlow' | 'Cucumber' | 'Pytest';
  testTitle: string;
  annotations: string[]; // e.g. ['@TEST-101', '@auth', '@smoke']
  codeSteps: AutomatedCodeStep[];
  rawCodeSnippet: string;
  lastCommitSha: string;
  lastCommitAuthor: string;
  lastCommitDate: string;
  lastCommitMessage: string;
}

// ----------------------------------------------------------------------------
// 5. Drift Detection & Human Assessment / Reconciliation
// ----------------------------------------------------------------------------

export type DriftSeverity = 'none' | 'low' | 'medium' | 'high' | 'critical';

export type DriftStatus = 
  | 'in_sync'               // Code and Xray match
  | 'minor_drift'           // Formatting/wording difference but logic aligns
  | 'critical_divergence'   // Missing steps, different assertions, or changed flow
  | 'code_missing'          // In Xray but no automated test exists in repo
  | 'xray_missing';         // In code repo but ticket not found or closed in Jira

export type DriftDiffType = 
  | 'step_content_mismatch'
  | 'step_count_mismatch'
  | 'test_data_mismatch'
  | 'assertion_discrepancy'
  | 'orphaned_test';

export interface DriftItem {
  id: string;
  type: DriftDiffType;
  title: string;
  description: string;
  xrayValue?: string;
  codeValue?: string;
  suggestedResolution?: string;
}

export type DriftResolutionStatus = 
  | 'pending'
  | 'resolved_accept_code'
  | 'resolved_accept_xray'
  | 'resolved_acknowledged';

export interface DriftResolution {
  status: DriftResolutionStatus;
  resolvedBy?: string;
  resolvedAt?: string;
  decisionNote?: string;
  actionTaken?: string; // e.g. 'Updated Xray steps via Raven API', 'Created PR #1049'
  targetPrUrl?: string;
}

export interface DriftAssessment {
  status: DriftStatus;
  severity: DriftSeverity;
  hasDrift: boolean;
  summary: string;
  items: DriftItem[];
  resolution?: DriftResolution;
  lastAssessedAt: string;
}

// ----------------------------------------------------------------------------
// 6. Selective Field Ingestion & Field Mapping Configuration
// ----------------------------------------------------------------------------

export type FieldDataSource = 'jira_dc' | 'xray_dc' | 'ado' | 'git_repo';
export type FieldDataType = 'string' | 'number' | 'boolean' | 'array' | 'user' | 'date' | 'object';

export interface FieldSelectionItem {
  id: string; // e.g. 'summary', 'components', 'customfield_10014'
  source: FieldDataSource;
  label: string; // User-facing name e.g. 'Epic Link'
  path: string; // API payload path e.g. 'fields.customfield_10014'
  type: FieldDataType;
  isRequired: boolean;
  isSelected: boolean;
  category: 'core' | 'custom_field' | 'test_step' | 'execution' | 'metadata';
  description?: string;
}

export interface JiraDataCenterConfig {
  baseUrl: string;
  pat: string;
  projectKeys: string[];
  jqlFilter: string;
  version?: string;
}

export interface XrayDataCenterConfig {
  enabled: boolean;
  ravenApiPath: string; // Default '/rest/raven/1.0'
  stepFormat: 'manual_steps' | 'cucumber_gherkin';
  testExecutionIssueType: string;
}

export interface AzureDevOpsConfig {
  orgUrl: string;
  project: string;
  pat: string;
  pipelineId: string;
  agentPool?: string;
}

export interface GitTestRepoConfig {
  repoUrl: string;
  branch: string;
  testFilePathPattern: string;
  annotationPattern: string;
}

export interface IntegrationHarnessConfig {
  jiraDc: JiraDataCenterConfig;
  xrayDc: XrayDataCenterConfig;
  ado: AzureDevOpsConfig;
  gitRepo: GitTestRepoConfig;
  fieldSelections: FieldSelectionItem[];
}

// ----------------------------------------------------------------------------
// 7. Aggregated Test Object (The Single Source of Truth)
// ----------------------------------------------------------------------------

export interface AggregatedTestObject {
  test: TestData;
  requirement: RequirementData | null;
  cicd: CICDData | null;
  codeDefinition?: AutomatedCodeDefinition | null;
  drift?: DriftAssessment | null;
  selectedFields?: Record<string, any>;
}

// ----------------------------------------------------------------------------
// 8. Event Stream, Audit Log & Legacy Integrations
// ----------------------------------------------------------------------------

export interface AuditLog {
  id: string;
  timestamp: string;
  eventType: string;
  action: string;
  details: string;
  target: string;
  payload?: any;
  status: 'success' | 'pending' | 'failed';
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
}

export interface Integration {
  id: string;
  name: string;
  category: string;
  status: 'connected' | 'syncing' | 'error';
  endpoint: string;
  description: string;
  capabilities: string[];
}
