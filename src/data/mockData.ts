import type { TestData, RequirementData, CICDData } from '../types';

export const mockTests: TestData[] = [
  {
    id: 'TEST-101',
    description: 'Verify user can log in with valid credentials',
    summary: 'User Login Success',
    status: 'Passed',
    priority: 'High',
    steps: ['Navigate to login page', 'Enter valid username and password', 'Click Login button', 'Verify user is redirected to dashboard']
  },
  {
    id: 'TEST-102',
    description: 'Verify user is rejected with invalid password',
    summary: 'User Login Failure',
    status: 'Failed',
    priority: 'Medium',
    steps: ['Navigate to login page', 'Enter valid username and invalid password', 'Click Login button', 'Verify error message is displayed']
  },
  {
    id: 'TEST-103',
    description: 'Check out process with empty cart',
    summary: 'Empty Cart Checkout',
    status: 'Skipped',
    priority: 'Low',
    steps: ['Navigate to cart', 'Ensure cart is empty', 'Click checkout', 'Verify warning message']
  }
];

export const mockRequirements: RequirementData[] = [
  {
    requirementId: 'REQ-1',
    description: 'The system shall allow users to securely authenticate.',
    acceptanceCriteria: ['Users can log in with valid credentials', 'Users are locked out after 5 failed attempts'],
    ticketAssociations: ['JIRA-1001', 'JIRA-1002']
  },
  {
    requirementId: 'REQ-2',
    description: 'The system shall prevent checkout of empty carts.',
    acceptanceCriteria: ['Checkout button is disabled or shows warning if cart is empty'],
    ticketAssociations: ['JIRA-2005']
  }
];

export const mockCICDData: CICDData[] = [
  {
    id: 'CI-101',
    testId: 'TEST-101',
    executionEnvironment: 'Production-Mirror (AWS)',
    artifactReferences: ['s3://logs/run-4432.log', 's3://artifacts/build-99.zip'],
    pipelineRun: 'Pipeline-Alpha-Build-99',
    triggerSource: 'Merge to Main'
  },
  {
    id: 'CI-102',
    testId: 'TEST-102',
    executionEnvironment: 'Staging (GCP)',
    artifactReferences: ['s3://logs/run-4433.log'],
    pipelineRun: 'Pipeline-Alpha-Build-99',
    triggerSource: 'Merge to Main'
  }
];

// Mapping for the demo to know which test relates to which requirement
export const testToRequirementMap: Record<string, string> = {
  'TEST-101': 'REQ-1',
  'TEST-102': 'REQ-1',
  'TEST-103': 'REQ-2'
};
