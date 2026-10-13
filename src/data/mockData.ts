import type { TestData, RequirementData, CICDData, Integration } from '../types';

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
  },
  {
    id: 'TEST-104',
    description: 'Verify user can add a product to the cart',
    summary: 'Add Product to Cart',
    status: 'Passed',
    priority: 'High',
    steps: ['Search for a product', 'Click on product details', 'Click Add to Cart', 'Verify cart counter updates']
  },
  {
    id: 'TEST-105',
    description: 'Verify user can remove a product from the cart',
    summary: 'Remove Product from Cart',
    status: 'Passed',
    priority: 'Medium',
    steps: ['Navigate to cart with items', 'Click remove on an item', 'Verify item is removed', 'Verify total price updates']
  },
  {
    id: 'TEST-106',
    description: 'Search for an existing product by exact name',
    summary: 'Exact Product Search',
    status: 'Passed',
    priority: 'High',
    steps: ['Type product name in search bar', 'Press enter', 'Verify product appears in results']
  },
  {
    id: 'TEST-107',
    description: 'Search for a non-existing product',
    summary: 'No Results Search',
    status: 'Passed',
    priority: 'Low',
    steps: ['Type invalid product name', 'Press enter', 'Verify no results message']
  },
  {
    id: 'TEST-108',
    description: 'Password reset flow with valid email',
    summary: 'Password Reset',
    status: 'Failed',
    priority: 'High',
    steps: ['Click forgot password', 'Enter valid email', 'Submit', 'Verify confirmation message']
  },
  {
    id: 'TEST-109',
    description: 'Update user profile information',
    summary: 'Update Profile',
    status: 'Skipped',
    priority: 'Medium',
    steps: ['Navigate to profile', 'Edit phone number', 'Save', 'Verify updated info']
  },
  {
    id: 'TEST-110',
    description: 'Process payment with valid credit card',
    summary: 'Successful Payment',
    status: 'Passed',
    priority: 'High',
    steps: ['Navigate to checkout', 'Enter valid credit card', 'Submit payment', 'Verify order confirmation']
  }
];

export const mockRequirements: RequirementData[] = [
  {
    requirementId: 'REQ-1',
    description: 'The system shall allow users to securely authenticate and manage accounts.',
    acceptanceCriteria: ['Users can log in with valid credentials', 'Users are locked out after 5 failed attempts', 'Users can reset passwords', 'Users can update profiles'],
    ticketAssociations: ['JIRA-1001', 'JIRA-1002']
  },
  {
    requirementId: 'REQ-2',
    description: 'The system shall provide a shopping cart for purchasing products.',
    acceptanceCriteria: ['Users can add and remove items', 'Checkout button is disabled if cart is empty'],
    ticketAssociations: ['JIRA-2005']
  },
  {
    requirementId: 'REQ-4',
    description: 'The system shall allow searching for products.',
    acceptanceCriteria: ['Users can search by name', 'Empty state handles no results'],
    ticketAssociations: ['JIRA-3001']
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
    executionEnvironment: 'Azure DevOps Agent (Ubuntu)',
    artifactReferences: ['s3://logs/run-4433.log'],
    pipelineRun: 'ADO-Release-Build-104',
    triggerSource: 'Merge to Main'
  },
  {
    id: 'CI-104',
    testId: 'TEST-104',
    executionEnvironment: 'Production-Mirror (AWS)',
    artifactReferences: ['s3://logs/run-4434.log'],
    pipelineRun: 'Pipeline-Alpha-Build-99',
    triggerSource: 'Merge to Main'
  }
];

// Mapping for the demo to know which test relates to which requirement
export const testToRequirementMap: Record<string, string> = {
  'TEST-101': 'REQ-1',
  'TEST-102': 'REQ-1',
  'TEST-103': 'REQ-2',
  'TEST-104': 'REQ-2',
  'TEST-105': 'REQ-2',
  'TEST-106': 'REQ-4',
  'TEST-107': 'REQ-4',
  'TEST-108': 'REQ-1',
  'TEST-109': 'REQ-1',
  'TEST-110': 'REQ-2'
};

export const mockIntegrations: Integration[] = [
  {
    id: 'int-jira',
    name: 'Jira',
    category: 'Requirements & Issues',
    status: 'connected',
    endpoint: 'https://jira.internal/rest/api/2',
    description: 'Bi-directional requirement syncing and issue field updates',
    capabilities: ['Two-way issue sync', 'Dynamic field mapping', 'Status webhooks']
  },
  {
    id: 'int-testrail',
    name: 'TestRail',
    category: 'Test Management',
    status: 'connected',
    endpoint: 'https://testrail.internal/index.php?/api/v2',
    description: 'Centralized test case definitions and run execution results',
    capabilities: ['Run result logging', 'Case definition sync', 'Status mapping']
  },
  {
    id: 'int-cicd',
    name: 'CI/CD Pipelines',
    category: 'Execution Engines',
    status: 'connected',
    endpoint: 'Jenkins Runner & Azure Pipelines',
    description: 'Automated test runners, build pipelines, and artifact storage',
    capabilities: ['Jenkins node-04', 'Azure DevOps agents', 'S3 artifact collection']
  },
  {
    id: 'int-github',
    name: 'GitHub',
    category: 'Version Control',
    status: 'connected',
    endpoint: 'github.com/org/living-test-repo',
    description: 'Repository automation and automated PR creation for new test definitions',
    capabilities: ['Automated PR creation', 'Branch linkage', 'Action triggers']
  }
];
