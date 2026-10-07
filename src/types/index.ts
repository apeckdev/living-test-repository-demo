export interface TestData {
  id: string;
  description: string;
  summary: string;
  status: string;
  priority: string;
  steps: string[];
  isAutomated?: boolean;
  [key: string]: any; // Allow dynamic fields like new requirement fields
}

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

export interface RequirementData {
  requirementId: string;
  description: string;
  acceptanceCriteria: string[];
  ticketAssociations: string[];
}

export interface CICDData {
  id: string;
  testId: string;
  executionEnvironment: string;
  artifactReferences: string[];
  pipelineRun: string;
  triggerSource: string;
}

export interface AggregatedTestObject {
  test: TestData;
  requirement: RequirementData | null;
  cicd: CICDData | null;
}
