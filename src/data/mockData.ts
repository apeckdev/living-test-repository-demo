import type { 
  TestData, 
  RequirementData, 
  CICDData, 
  Integration, 
  AutomatedCodeDefinition, 
  DriftAssessment, 
  FieldSelectionItem, 
  IntegrationHarnessConfig 
} from '../types';

// ============================================================================
// 1. Jira Data Center Requirements & User Stories
// ============================================================================

export const mockRequirements: RequirementData[] = [
  {
    requirementId: 'REQ-1',
    key: 'AUTH-1001',
    summary: 'Enterprise Authentication & Session Security',
    description: 'The system shall allow users to securely authenticate via Jira DC single-sign-on or local credentials with rate-limiting.',
    issueType: 'Story',
    epicKey: 'AUTH-EPIC-1',
    epicName: 'Core Identity & Access Management',
    storyPoints: 8,
    components: ['Auth-Service', 'Security-Gateway'],
    fixVersions: ['v2.4.0'],
    acceptanceCriteria: [
      'Users can log in with valid credentials and receive a cryptographically signed JWT token',
      'Users are locked out and challenged with CAPTCHA after 5 consecutive failed attempts',
      'Password reset emails must require at least 12 characters and a special character',
      'Session tokens expire after 30 minutes of inactivity'
    ],
    ticketAssociations: ['AUTH-1001', 'AUTH-1002', 'SEC-409'],
    customFields: {
      customfield_10014: 'AUTH-EPIC-1', // Jira DC Epic Link
      customfield_10020: 'Regulated - Security Audit Required', // Classification
      customfield_10025: 'Risk Level: Medium'
    }
  },
  {
    requirementId: 'REQ-2',
    key: 'CART-2005',
    summary: 'Shopping Cart & Multi-Item Checkout',
    description: 'The system shall provide a real-time reactive shopping cart supporting inventory reservation and promotional checkout.',
    issueType: 'Story',
    epicKey: 'CART-EPIC-3',
    epicName: 'Checkout Modernization',
    storyPoints: 13,
    components: ['Cart-Engine', 'Pricing-Service', 'Payment-Gateway'],
    fixVersions: ['v2.5.0'],
    acceptanceCriteria: [
      'Users can add products and update quantities up to available stock limit',
      'Checkout button remains disabled when subtotal is $0 or cart is empty',
      'Bulk discount applied when item quantity exceeds 3 units'
    ],
    ticketAssociations: ['CART-2005', 'CART-2010'],
    customFields: {
      customfield_10014: 'CART-EPIC-3',
      customfield_10020: 'Standard E-Commerce Flow',
      customfield_10025: 'Risk Level: Low'
    }
  },
  {
    requirementId: 'REQ-4',
    key: 'SRCH-3001',
    summary: 'Product Catalog Elasticsearch Querying',
    description: 'The system shall allow searching items with fuzzy matching, facets, and instant empty-state fallbacks.',
    issueType: 'Story',
    epicKey: 'SRCH-EPIC-2',
    epicName: 'Catalog Discovery Engine',
    storyPoints: 5,
    components: ['Catalog-Service', 'Elasticsearch-Indexer'],
    fixVersions: ['v2.4.0'],
    acceptanceCriteria: [
      'Exact SKU and title search returns matching product card as top result',
      'Typo tolerance handles up to 2 transposed characters',
      'Empty result view provides recommended trending items'
    ],
    ticketAssociations: ['SRCH-3001'],
    customFields: {
      customfield_10014: 'SRCH-EPIC-2',
      customfield_10020: 'High Throughput API',
      customfield_10025: 'Risk Level: Low'
    }
  }
];

// ============================================================================
// 2. Xray Data Center Test Cases (Native Raven API Steps)
// ============================================================================

export const mockTests: TestData[] = [
  {
    id: 'TEST-101',
    issueKey: 'TEST-101',
    summary: 'User Login Success with Valid Credentials',
    description: 'Verify standard user authentication against Jira DC Identity Provider and redirect to user dashboard.',
    status: 'Passed',
    priority: 'High',
    testType: 'Manual',
    isAutomated: true,
    components: ['Auth-Service'],
    fixVersions: ['v2.4.0'],
    labels: ['smoke', 'p1', 'auth', 'regression'],
    lastXrayModified: '2026-10-08T11:20:00Z',
    lastXrayAuthor: 'sarah.jenkins@company.internal',
    steps: [
      'Navigate to /login authentication portal',
      'Enter valid registered username and password',
      'Click the "Sign In" button',
      'Verify 200 OK and redirection to /dashboard'
    ],
    xraySteps: [
      {
        id: 'xstep-101-1',
        index: 1,
        action: 'Navigate to /login authentication portal',
        data: 'URL: https://app.internal/login',
        result: 'Login form is displayed with username and password fields enabled'
      },
      {
        id: 'xstep-101-2',
        index: 2,
        action: 'Enter valid registered username and password',
        data: 'User: test.lead@company.internal, Password: [MASKED]',
        result: 'Credentials populated in input fields'
      },
      {
        id: 'xstep-101-3',
        index: 3,
        action: 'Click the "Sign In" button',
        data: 'Click primary submit button',
        result: 'Loading spinner appears and request dispatches to /api/v1/auth'
      },
      {
        id: 'xstep-101-4',
        index: 4,
        action: 'Verify redirection to dashboard',
        data: 'Expected URL: /dashboard',
        result: 'User is authenticated, auth token stored in HTTP-only cookie, and dashboard renders'
      }
    ],
    customFields: {
      customfield_10014: 'AUTH-EPIC-1',
      customfield_10020: 'Automated CI Test Suite'
    }
  },
  {
    id: 'TEST-102',
    issueKey: 'TEST-102',
    summary: 'User Login Failure & Security Lockout',
    description: 'Verify account lock and warning banner when invalid credentials exceed security policy threshold.',
    status: 'Failed',
    priority: 'Medium',
    testType: 'Manual',
    isAutomated: true,
    components: ['Auth-Service', 'Security-Gateway'],
    fixVersions: ['v2.4.0'],
    labels: ['security', 'auth', 'negative-test'],
    lastXrayModified: '2026-09-14T09:15:00Z', // Note: Outdated relative to code!
    lastXrayAuthor: 'bob.qa@company.internal',
    steps: [
      'Navigate to login page',
      'Enter valid username and invalid password',
      'Click Login button',
      'Verify error banner: "Invalid credentials"'
    ],
    xraySteps: [
      {
        id: 'xstep-102-1',
        index: 1,
        action: 'Navigate to login page',
        data: 'URL: https://app.internal/login',
        result: 'Login form is displayed'
      },
      {
        id: 'xstep-102-2',
        index: 2,
        action: 'Enter valid username and invalid password',
        data: 'Username: qa-user@company.internal, Password: wrongpassword123',
        result: 'Inputs accepted'
      },
      {
        id: 'xstep-102-3',
        index: 3,
        action: 'Click Login button',
        data: 'Click submit',
        result: 'Form validates and submits'
      },
      {
        id: 'xstep-102-4',
        index: 4,
        action: 'Verify error banner',
        data: 'Locator: .alert-danger',
        result: 'Static error message displays "Invalid username or password"'
      }
    ],
    customFields: {
      customfield_10014: 'AUTH-EPIC-1',
      customfield_10020: 'Security Compliance'
    }
  },
  {
    id: 'TEST-103',
    issueKey: 'TEST-103',
    summary: 'Checkout Validation with Empty Cart',
    description: 'Ensure checkout cannot be triggered when no items exist in cart session.',
    status: 'Skipped',
    priority: 'Low',
    testType: 'Manual',
    isAutomated: false, // Manual only - no code definition in repo!
    components: ['Cart-Engine'],
    fixVersions: ['v2.5.0'],
    labels: ['manual-only', 'cart'],
    lastXrayModified: '2026-10-01T15:45:00Z',
    lastXrayAuthor: 'sarah.jenkins@company.internal',
    steps: [
      'Navigate to /cart view',
      'Confirm item count is 0',
      'Attempt to click Checkout button',
      'Verify button is disabled and tooltip explains empty state'
    ],
    xraySteps: [
      {
        id: 'xstep-103-1',
        index: 1,
        action: 'Navigate to cart view',
        data: 'URL: /cart with clean session',
        result: 'Cart view loads with 0 items'
      },
      {
        id: 'xstep-103-2',
        index: 2,
        action: 'Inspect Checkout CTA button state',
        data: 'DOM selector: button#checkout-btn',
        result: 'Button has disabled attribute and aria-disabled="true"'
      }
    ]
  },
  {
    id: 'TEST-104',
    issueKey: 'TEST-104',
    summary: 'Add Product to Cart & Update Badge Counter',
    description: 'Select an available SKU from catalog, add to cart, and verify reactive badge counter and drawer update.',
    status: 'Passed',
    priority: 'High',
    testType: 'Manual',
    isAutomated: true,
    components: ['Cart-Engine', 'Catalog-Service'],
    fixVersions: ['v2.5.0'],
    labels: ['smoke', 'e2e', 'cart'],
    lastXrayModified: '2026-10-05T10:00:00Z',
    lastXrayAuthor: 'alex.dev@company.internal',
    steps: [
      'Search for "Ergonomic Mechanical Keyboard"',
      'Open product details page',
      'Click Add to Cart button (Quantity: 1)',
      'Verify header cart badge increments to 1'
    ],
    xraySteps: [
      {
        id: 'xstep-104-1',
        index: 1,
        action: 'Search and select product SKU-KB-99',
        data: 'Query: "Ergonomic Mechanical Keyboard"',
        result: 'Product PDP opens'
      },
      {
        id: 'xstep-104-2',
        index: 2,
        action: 'Click "Add to Cart"',
        data: 'Default Quantity: 1 unit',
        result: 'Item added toast appears and badge reads "1"'
      }
    ]
  },
  {
    id: 'TEST-105',
    issueKey: 'TEST-105',
    summary: 'Remove Product from Cart & Recalculate Subtotal',
    description: 'Delete line items from checkout drawer and verify subtotal recalculates without full page refresh.',
    status: 'Passed',
    priority: 'Medium',
    testType: 'Manual',
    isAutomated: true,
    components: ['Cart-Engine'],
    fixVersions: ['v2.5.0'],
    steps: [
      'Navigate to cart with preloaded items',
      'Click delete icon on line item',
      'Confirm removal in confirmation dialog',
      'Verify subtotal updates immediately'
    ]
  },
  {
    id: 'TEST-106',
    issueKey: 'TEST-106',
    summary: 'Exact Product Search by SKU Code',
    description: 'Verify search input directly resolves exact SKU match to top position.',
    status: 'Passed',
    priority: 'High',
    testType: 'Manual',
    isAutomated: true,
    components: ['Catalog-Service'],
    fixVersions: ['v2.4.0'],
    steps: [
      'Enter SKU-4820 in search bar',
      'Press Enter or click magnifying glass',
      'Verify exact product card appears with "Exact Match" badge'
    ]
  },
  {
    id: 'TEST-107',
    issueKey: 'TEST-107',
    summary: 'No Results Search Empty State Fallback',
    description: 'Ensure invalid keyword searches trigger friendly zero-results fallback recommendations.',
    status: 'Passed',
    priority: 'Low',
    testType: 'Manual',
    isAutomated: true,
    components: ['Catalog-Service'],
    fixVersions: ['v2.4.0'],
    steps: [
      'Enter random gibberish string in search bar',
      'Submit search query',
      'Verify "No products found" message and popular recommendations'
    ]
  },
  {
    id: 'TEST-108',
    issueKey: 'TEST-108',
    summary: 'Self-Service Password Reset Email Workflow',
    description: 'Verify password reset link generation and new password complexity enforcement.',
    status: 'Failed',
    priority: 'High',
    testType: 'Manual',
    isAutomated: true,
    components: ['Auth-Service'],
    fixVersions: ['v2.4.0'],
    lastXrayModified: '2026-10-12T08:30:00Z', // Recently updated in Jira DC!
    lastXrayAuthor: 'sarah.jenkins@company.internal',
    steps: [
      'Click "Forgot Password" on login screen',
      'Submit valid registered email',
      'Follow magic reset link in token inbox',
      'Enter new password meeting 12-char + special symbol policy',
      'Verify successful password update notification'
    ],
    xraySteps: [
      {
        id: 'xstep-108-1',
        index: 1,
        action: 'Click "Forgot Password" link on login view',
        data: 'Click [data-testid="forgot-password-link"]',
        result: 'Reset request form displayed'
      },
      {
        id: 'xstep-108-2',
        index: 2,
        action: 'Enter email and submit request',
        data: 'Email: developer@company.internal',
        result: 'Success confirmation dialog shown'
      },
      {
        id: 'xstep-108-3',
        index: 3,
        action: 'Open reset URL and input new compliant password',
        data: 'Password must be >= 12 chars with symbol (e.g. SuperSecret#2026!)',
        result: 'Password complexity meter shows 100% green'
      },
      {
        id: 'xstep-108-4',
        index: 4,
        action: 'Submit new password',
        data: 'Click "Reset Password"',
        result: 'Password updated and user redirected to login'
      }
    ]
  },
  {
    id: 'TEST-109',
    issueKey: 'TEST-109',
    summary: 'Update User Profile Contact Details',
    description: 'Modify user phone number and communication preferences in profile settings.',
    status: 'Skipped',
    priority: 'Medium',
    testType: 'Manual',
    isAutomated: false,
    components: ['Auth-Service'],
    fixVersions: ['v2.4.0'],
    steps: [
      'Navigate to account profile settings',
      'Edit mobile contact number',
      'Click save changes',
      'Verify toast notification and persisted value'
    ]
  },
  {
    id: 'TEST-110',
    issueKey: 'TEST-110',
    summary: 'Process Checkout Transaction with Credit Card',
    description: 'Execute end-to-end payment capture through sandbox gateway with 3D Secure verification.',
    status: 'Passed',
    priority: 'High',
    testType: 'Manual',
    isAutomated: true,
    components: ['Payment-Gateway'],
    fixVersions: ['v2.5.0'],
    steps: [
      'Proceed to checkout payment step',
      'Enter test Visa credit card details',
      'Submit payment authorization',
      'Verify order confirmation reference ID'
    ]
  }
];

// ============================================================================
// 3. Automated Test Code Definitions (Git Test Repository Specs)
// ============================================================================

export const mockAutomatedCodeDefinitions: Record<string, AutomatedCodeDefinition> = {
  'TEST-101': {
    id: 'code-101',
    testCaseKey: 'TEST-101',
    repository: 'dev.azure.com/enterprise-core/DigitalPlatform/_git/e2e-automation',
    branch: 'main',
    filePath: 'tests/e2e/auth/login.spec.ts',
    lineRange: { start: 18, end: 42 },
    framework: 'Playwright',
    testTitle: 'test("User Login Success with Valid Credentials", { tag: ["@TEST-101", "@auth"] })',
    annotations: ['@TEST-101', '@auth', '@smoke'],
    codeSteps: [
      {
        stepNumber: 1,
        description: 'Navigate to login portal',
        type: 'action',
        codeSnippet: 'await page.goto("/login");\nawait expect(page.locator("form#login-form")).toBeVisible();'
      },
      {
        stepNumber: 2,
        description: 'Fill in user credentials',
        type: 'action',
        codeSnippet: 'await page.fill("#username", process.env.TEST_USER_EMAIL);\nawait page.fill("#password", process.env.TEST_USER_PASSWORD);'
      },
      {
        stepNumber: 3,
        description: 'Submit credentials',
        type: 'action',
        codeSnippet: 'await page.click("button[type=\'submit\']");'
      },
      {
        stepNumber: 4,
        description: 'Assert redirection to dashboard',
        type: 'assertion',
        codeSnippet: 'await expect(page).toHaveURL(/.*dashboard/);\nawait expect(page.locator("[data-testid=\'user-avatar\']")).toBeVisible();'
      }
    ],
    rawCodeSnippet: `test('User Login Success with Valid Credentials', { tag: ['@TEST-101', '@auth'] }, async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('form#login-form')).toBeVisible();

  await page.fill('#username', process.env.TEST_USER_EMAIL!);
  await page.fill('#password', process.env.TEST_USER_PASSWORD!);
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/.*dashboard/);
  await expect(page.locator('[data-testid="user-avatar"]')).toBeVisible();
});`,
    lastCommitSha: '7f91c28b49e',
    lastCommitAuthor: 'alex.dev@company.internal',
    lastCommitDate: '2026-10-08T14:10:22Z',
    lastCommitMessage: 'feat(auth): migrate auth assertions to strict locator syntax'
  },

  'TEST-102': {
    id: 'code-102',
    testCaseKey: 'TEST-102',
    repository: 'dev.azure.com/enterprise-core/DigitalPlatform/_git/e2e-automation',
    branch: 'main',
    filePath: 'tests/e2e/auth/login-failure.spec.ts',
    lineRange: { start: 24, end: 58 },
    framework: 'Playwright',
    testTitle: 'test("User Login Failure & Captcha Lockout", { tag: ["@TEST-102", "@security"] })',
    annotations: ['@TEST-102', '@security'],
    codeSteps: [
      {
        stepNumber: 1,
        description: 'Navigate to login portal',
        type: 'action',
        codeSnippet: 'await page.goto("/login");'
      },
      {
        stepNumber: 2,
        description: 'Attempt 5 consecutive invalid logins',
        type: 'action',
        codeSnippet: 'for (let i = 0; i < 5; i++) {\n  await page.fill("#username", "locked.user@company.internal");\n  await page.fill("#password", `invalid-pass-${i}`);\n  await page.click("button[type=\'submit\']");\n}'
      },
      {
        stepNumber: 3,
        description: 'Verify Rate Limit & Captcha Challenge',
        type: 'assertion',
        codeSnippet: 'await expect(page.locator("[data-testid=\'recaptcha-challenge\']")).toBeVisible();\nawait expect(page.locator("[data-testid=\'lockout-timer\']")).toContainText("Locked for 15 minutes");'
      }
    ],
    rawCodeSnippet: `test('User Login Failure & Captcha Lockout', { tag: ['@TEST-102', '@security'] }, async ({ page }) => {
  await page.goto('/login');

  // Code was updated to test the new 5-attempt rate-limiting lockout
  for (let i = 0; i < 5; i++) {
    await page.fill('#username', 'locked.user@company.internal');
    await page.fill('#password', \`invalid-pass-\${i}\`);
    await page.click('button[type="submit"]');
  }

  // DISCREPANCY: Xray ticket expects simple .alert-danger text,
  // but code asserts against new Captcha modal & Lockout countdown!
  await expect(page.locator('[data-testid="recaptcha-challenge"]')).toBeVisible();
  await expect(page.locator('[data-testid="lockout-timer"]')).toContainText('Locked for 15 minutes');
});`,
    lastCommitSha: '3a18e0019dd',
    lastCommitAuthor: 'alex.dev@company.internal',
    lastCommitDate: '2026-10-11T16:04:18Z',
    lastCommitMessage: 'fix(e2e): account for security gateway v2 captcha rate limiting'
  },

  'TEST-104': {
    id: 'code-104',
    testCaseKey: 'TEST-104',
    repository: 'dev.azure.com/enterprise-core/DigitalPlatform/_git/e2e-automation',
    branch: 'main',
    filePath: 'tests/e2e/cart/add-to-cart.spec.ts',
    lineRange: { start: 12, end: 36 },
    framework: 'Playwright',
    testTitle: 'test("Add Product to Cart with Bulk Quantity", { tag: ["@TEST-104", "@cart"] })',
    annotations: ['@TEST-104', '@cart'],
    codeSteps: [
      {
        stepNumber: 1,
        description: 'Navigate to product catalog and select SKU',
        type: 'action',
        codeSnippet: 'await page.goto("/product/SKU-KB-99");'
      },
      {
        stepNumber: 2,
        description: 'Select bulk quantity of 5 (Xray specifies quantity 1)',
        type: 'action',
        codeSnippet: 'await page.selectOption("#quantity-picker", "5");\nawait page.click("#add-to-cart-cta");'
      },
      {
        stepNumber: 3,
        description: 'Verify bulk discount banner and badge count',
        type: 'assertion',
        codeSnippet: 'await expect(page.locator(".badge-count")).toHaveText("5");\nawait expect(page.locator(".bulk-discount-label")).toBeVisible();'
      }
    ],
    rawCodeSnippet: `test('Add Product to Cart with Bulk Quantity', { tag: ['@TEST-104', '@cart'] }, async ({ page }) => {
  await page.goto('/product/SKU-KB-99');
  // DISCREPANCY: Code tests quantity 5 for bulk tier; Xray step tests quantity 1
  await page.selectOption('#quantity-picker', '5');
  await page.click('#add-to-cart-cta');

  await expect(page.locator('.badge-count')).toHaveText('5');
  await expect(page.locator('.bulk-discount-label')).toBeVisible();
});`,
    lastCommitSha: '9b71f92e8c1',
    lastCommitAuthor: 'david.qa@company.internal',
    lastCommitDate: '2026-10-06T09:44:00Z',
    lastCommitMessage: 'test(cart): verify bulk pricing tier when adding 5 units'
  },

  'TEST-108': {
    id: 'code-108',
    testCaseKey: 'TEST-108',
    repository: 'dev.azure.com/enterprise-core/DigitalPlatform/_git/e2e-automation',
    branch: 'main',
    filePath: 'tests/e2e/auth/password-reset.spec.ts',
    lineRange: { start: 15, end: 40 },
    framework: 'Playwright',
    testTitle: 'test("Self-Service Password Reset", { tag: ["@TEST-108", "@auth"] })',
    annotations: ['@TEST-108', '@auth'],
    codeSteps: [
      {
        stepNumber: 1,
        description: 'Navigate to password reset portal',
        type: 'action',
        codeSnippet: 'await page.goto("/forgot-password");\nawait page.fill("#reset-email", "test@company.internal");\nawait page.click("#send-btn");'
      },
      {
        stepNumber: 2,
        description: 'Follow token link and input 8-character password',
        type: 'action',
        codeSnippet: '// OUTDATED CODE: uses 8-char password; Jira requirement now mandates 12 chars!\nawait page.goto("/reset-token?token=mockToken");\nawait page.fill("#new-password", "pass1234");\nawait page.click("#submit-password");'
      },
      {
        stepNumber: 3,
        description: 'Assert password changed',
        type: 'assertion',
        codeSnippet: '// FAILS IN ADO PIPELINE: Server rejects 8-char password!\nawait expect(page.locator(".success-toast")).toBeVisible();'
      }
    ],
    rawCodeSnippet: `test('Self-Service Password Reset', { tag: ['@TEST-108', '@auth'] }, async ({ page }) => {
  await page.goto('/forgot-password');
  await page.fill('#reset-email', 'test@company.internal');
  await page.click('#send-btn');

  await page.goto('/reset-token?token=mockToken');
  // CRITICAL SPEC DRIFT: Test code submits 8-char 'pass1234'.
  // Jira requirement REQ-1 was updated requiring >= 12 chars with special symbol.
  await page.fill('#new-password', 'pass1234');
  await page.click('#submit-password');

  await expect(page.locator('.success-toast')).toBeVisible();
});`,
    lastCommitSha: '4c20d887a12',
    lastCommitAuthor: 'tom.contractor@company.internal',
    lastCommitDate: '2026-08-20T11:00:00Z', // Ancient commit
    lastCommitMessage: 'test(auth): initial password reset test'
  }
};

// ============================================================================
// 4. Drift Assessments & Human Reconciliation Data
// ============================================================================

export const mockDriftAssessments: Record<string, DriftAssessment> = {
  'TEST-101': {
    status: 'in_sync',
    severity: 'none',
    hasDrift: false,
    summary: 'Automated test in git aligns with Jira DC / Xray steps 1:1.',
    items: [],
    lastAssessedAt: '2026-10-13T10:00:00Z'
  },

  'TEST-102': {
    status: 'critical_divergence',
    severity: 'high',
    hasDrift: true,
    summary: 'Codebase implementation has diverged from Jira DC / Xray definition. Automated test includes 5-attempt rate-limit loop and Captcha challenge not documented in Xray.',
    items: [
      {
        id: 'drift-102-1',
        type: 'step_content_mismatch',
        title: 'Step 4 Discrepancy: Captcha Challenge vs Error Banner',
        description: 'Xray manual test defines a simple .alert-danger banner check. Automated code tests for CAPTCHA challenge modal and lockout timer.',
        xrayValue: 'Step 4: Verify static error banner "Invalid username or password"',
        codeValue: 'Step 3 in code: Asserts [data-testid="recaptcha-challenge"] and "Locked for 15 minutes" timer',
        suggestedResolution: 'Accept Code as Truth: Update Xray test steps to document the new Captcha requirement implemented in Security Gateway v2.'
      },
      {
        id: 'drift-102-2',
        type: 'step_count_mismatch',
        title: 'Missing Loop Step in Xray Ticket',
        description: 'Code loops 5 times to trigger lockout; Xray step specifies a single invalid attempt.',
        xrayValue: '1 single login attempt',
        codeValue: '5 sequential login attempts with unique passwords',
        suggestedResolution: 'Add prerequisite or multi-attempt step into Xray test specification.'
      }
    ],
    lastAssessedAt: '2026-10-13T14:22:00Z'
  },

  'TEST-103': {
    status: 'code_missing',
    severity: 'medium',
    hasDrift: true,
    summary: 'Manual test defined in Jira DC Xray, but no automated test found referencing @TEST-103 in repository.',
    items: [
      {
        id: 'drift-103-1',
        type: 'orphaned_test',
        title: 'No Automation Implementation',
        description: 'Test exists in Xray Data Center with 2 manual steps. Git test repository scan found 0 matches for @TEST-103.',
        xrayValue: 'Xray issue TEST-103 (Manual)',
        codeValue: 'No code match in tests/**/*.spec.ts',
        suggestedResolution: 'Author automated Playwright spec or retain as intentional manual test.'
      }
    ],
    lastAssessedAt: '2026-10-13T11:00:00Z'
  },

  'TEST-104': {
    status: 'minor_drift',
    severity: 'low',
    hasDrift: true,
    summary: 'Minor data variation between Xray test parameters and code fixture.',
    items: [
      {
        id: 'drift-104-1',
        type: 'test_data_mismatch',
        title: 'Quantity Parameter Mismatch',
        description: 'Xray step 2 specifies default quantity 1. Code test sets quantity to 5 to trigger bulk tier.',
        xrayValue: 'Quantity: 1 unit',
        codeValue: 'Quantity: 5 units (tests bulk discount tier)',
        suggestedResolution: 'Acknowledge variation: Both tests are valid; Xray tests single unit, code covers bulk pricing.'
      }
    ],
    lastAssessedAt: '2026-10-13T12:15:00Z'
  },

  'TEST-108': {
    status: 'critical_divergence',
    severity: 'critical',
    hasDrift: true,
    summary: 'Code is out of date! Jira requirement REQ-1 and Xray ticket were updated with strict 12-character password policy, but code submits an 8-character password causing ADO pipeline failure.',
    items: [
      {
        id: 'drift-108-1',
        type: 'assertion_discrepancy',
        title: 'Code Uses Outdated Password Complexity Schema',
        description: 'Jira DC Requirement REQ-1 and Xray TEST-108 were updated on Oct 12 requiring >= 12 chars + special symbol. The Playwright code was last updated in August and submits "pass1234".',
        xrayValue: 'Password >= 12 chars with symbol (e.g. SuperSecret#2026!)',
        codeValue: 'await page.fill("#new-password", "pass1234")',
        suggestedResolution: 'Accept Jira/Xray as Truth: Dispatch Pull Request to update Playwright test code to submit compliant 12-char password.'
      }
    ],
    lastAssessedAt: '2026-10-13T15:10:00Z'
  }
};

// ============================================================================
// 5. Azure DevOps (ADO) CI/CD & Test Runs
// ============================================================================

export const mockCICDData: CICDData[] = [
  {
    id: 'ADO-RUN-101',
    testId: 'TEST-101',
    executionEnvironment: 'Azure DevOps Agent (Ubuntu 22.04 LTS)',
    artifactReferences: [
      'ado://artifacts/playwright-report/index.html',
      'ado://artifacts/traces/test-101.trace.zip'
    ],
    pipelineRun: 'ADO-E2E-Regression-Build-48291',
    triggerSource: 'Merge to Main (PR #142)',
    adoOrganization: 'enterprise-core',
    adoProject: 'DigitalPlatform',
    pipelineId: 902,
    pipelineName: 'ADO-E2E-Regression-Suite',
    runId: 48291,
    runUrl: 'https://dev.azure.com/enterprise-core/DigitalPlatform/_build/results?buildId=48291',
    durationSeconds: 14,
    agentPool: 'ado-linux-vmss-pool-01',
    testRunId: 104209,
    associatedXrayExecutionKey: 'EXEC-9021',
    timestamp: '2026-10-13T14:30:00Z'
  },
  {
    id: 'ADO-RUN-102',
    testId: 'TEST-102',
    executionEnvironment: 'Azure DevOps Agent (Ubuntu 22.04 LTS)',
    artifactReferences: [
      'ado://artifacts/failures/test-102-timeout-screenshot.png',
      'ado://artifacts/logs/run-48291.log'
    ],
    pipelineRun: 'ADO-E2E-Regression-Build-48291',
    triggerSource: 'Merge to Main (PR #142)',
    adoOrganization: 'enterprise-core',
    adoProject: 'DigitalPlatform',
    pipelineId: 902,
    pipelineName: 'ADO-E2E-Regression-Suite',
    runId: 48291,
    runUrl: 'https://dev.azure.com/enterprise-core/DigitalPlatform/_build/results?buildId=48291',
    durationSeconds: 31,
    agentPool: 'ado-linux-vmss-pool-01',
    testRunId: 104209,
    associatedXrayExecutionKey: 'EXEC-9021',
    timestamp: '2026-10-13T14:31:00Z'
  },
  {
    id: 'ADO-RUN-104',
    testId: 'TEST-104',
    executionEnvironment: 'Azure DevOps Agent (Ubuntu 22.04 LTS)',
    artifactReferences: [
      'ado://artifacts/playwright-report/index.html'
    ],
    pipelineRun: 'ADO-E2E-Regression-Build-48291',
    triggerSource: 'Merge to Main (PR #142)',
    adoOrganization: 'enterprise-core',
    adoProject: 'DigitalPlatform',
    pipelineId: 902,
    pipelineName: 'ADO-E2E-Regression-Suite',
    runId: 48291,
    runUrl: 'https://dev.azure.com/enterprise-core/DigitalPlatform/_build/results?buildId=48291',
    durationSeconds: 18,
    agentPool: 'ado-linux-vmss-pool-01',
    testRunId: 104209,
    associatedXrayExecutionKey: 'EXEC-9021',
    timestamp: '2026-10-13T14:32:00Z'
  },
  {
    id: 'ADO-RUN-108',
    testId: 'TEST-108',
    executionEnvironment: 'Azure DevOps Agent (Ubuntu 22.04 LTS)',
    artifactReferences: [
      'ado://artifacts/failures/test-108-assertion-failure.png',
      'ado://artifacts/traces/test-108.trace.zip'
    ],
    pipelineRun: 'ADO-E2E-Regression-Build-48291',
    triggerSource: 'Merge to Main (PR #142)',
    adoOrganization: 'enterprise-core',
    adoProject: 'DigitalPlatform',
    pipelineId: 902,
    pipelineName: 'ADO-E2E-Regression-Suite',
    runId: 48291,
    runUrl: 'https://dev.azure.com/enterprise-core/DigitalPlatform/_build/results?buildId=48291',
    durationSeconds: 22,
    agentPool: 'ado-linux-vmss-pool-01',
    testRunId: 104209,
    associatedXrayExecutionKey: 'EXEC-9021',
    timestamp: '2026-10-13T14:33:00Z'
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

// ============================================================================
// 6. Selective Field Ingestion Catalog
// ============================================================================

export const defaultFieldSelections: FieldSelectionItem[] = [
  // Jira DC Core Fields
  {
    id: 'jira_summary',
    source: 'jira_dc',
    label: 'Summary / Title',
    path: 'fields.summary',
    type: 'string',
    isRequired: true,
    isSelected: true,
    category: 'core',
    description: 'Primary title of the issue or requirement in Jira DC'
  },
  {
    id: 'jira_description',
    source: 'jira_dc',
    label: 'Description',
    path: 'fields.description',
    type: 'string',
    isRequired: false,
    isSelected: true,
    category: 'core',
    description: 'Detailed specification text'
  },
  {
    id: 'jira_priority',
    source: 'jira_dc',
    label: 'Priority',
    path: 'fields.priority.name',
    type: 'string',
    isRequired: false,
    isSelected: true,
    category: 'core',
    description: 'Jira issue priority (High, Medium, Low)'
  },
  {
    id: 'jira_components',
    source: 'jira_dc',
    label: 'Components',
    path: 'fields.components',
    type: 'array',
    isRequired: false,
    isSelected: true,
    category: 'metadata',
    description: 'Associated microservice or architectural components'
  },
  {
    id: 'jira_fixVersions',
    source: 'jira_dc',
    label: 'Fix Versions / Releases',
    path: 'fields.fixVersions',
    type: 'array',
    isRequired: false,
    isSelected: true,
    category: 'metadata',
    description: 'Target release milestones'
  },
  // Jira DC Custom Fields
  {
    id: 'jira_customfield_10014',
    source: 'jira_dc',
    label: 'Epic Link (customfield_10014)',
    path: 'fields.customfield_10014',
    type: 'string',
    isRequired: false,
    isSelected: true,
    category: 'custom_field',
    description: 'Parent Jira Epic key association'
  },
  {
    id: 'jira_customfield_10020',
    source: 'jira_dc',
    label: 'Acceptance Criteria (customfield_10020)',
    path: 'fields.customfield_10020',
    type: 'string',
    isRequired: false,
    isSelected: true,
    category: 'custom_field',
    description: 'Custom rich-text acceptance criteria field'
  },
  // Xray DC Raven Fields
  {
    id: 'xray_steps',
    source: 'xray_dc',
    label: 'Xray Manual Steps',
    path: 'raven.steps',
    type: 'array',
    isRequired: true,
    isSelected: true,
    category: 'test_step',
    description: 'Action, Data, and Expected Result step tables via /rest/raven/1.0'
  },
  {
    id: 'xray_last_modified',
    source: 'xray_dc',
    label: 'Xray Step Audit Metadata',
    path: 'raven.lastModified',
    type: 'date',
    isRequired: false,
    isSelected: true,
    category: 'metadata',
    description: 'Timestamp and author of last Xray specification update'
  },
  // Azure DevOps Pipeline Fields
  {
    id: 'ado_pipeline_run',
    source: 'ado',
    label: 'ADO Pipeline Run & Build ID',
    path: 'ado.build.buildNumber',
    type: 'string',
    isRequired: true,
    isSelected: true,
    category: 'execution',
    description: 'Azure DevOps build number and run identifier'
  },
  {
    id: 'ado_agent_pool',
    source: 'ado',
    label: 'ADO Agent Pool Environment',
    path: 'ado.agent.poolName',
    type: 'string',
    isRequired: false,
    isSelected: true,
    category: 'execution',
    description: 'Hosted or self-hosted VMSS agent pool name'
  },
  {
    id: 'ado_duration',
    source: 'ado',
    label: 'Execution Duration',
    path: 'ado.run.duration',
    type: 'number',
    isRequired: false,
    isSelected: true,
    category: 'execution',
    description: 'Run elapsed time in seconds'
  },
  {
    id: 'ado_artifacts',
    source: 'ado',
    label: 'Test Artifact Drop URIs',
    path: 'ado.build.artifacts',
    type: 'array',
    isRequired: false,
    isSelected: true,
    category: 'execution',
    description: 'S3 / ADO storage links to logs, TRX results, and traces'
  }
];

// ============================================================================
// 7. Configured Integration Harness Settings
// ============================================================================

export const defaultHarnessConfig: IntegrationHarnessConfig = {
  jiraDc: {
    baseUrl: 'https://jira-dc.internal.company.com',
    pat: 'Bearer ********************',
    projectKeys: ['AUTH', 'CART', 'SRCH', 'TEST'],
    jqlFilter: 'project in (AUTH, CART, SRCH) AND issuetype in (Story, Requirement, Epic)',
    version: 'Jira Data Center v9.4.12 LTS'
  },
  xrayDc: {
    enabled: true,
    ravenApiPath: '/rest/raven/1.0',
    stepFormat: 'manual_steps',
    testExecutionIssueType: 'Test Execution'
  },
  ado: {
    orgUrl: 'https://dev.azure.com/enterprise-core',
    project: 'DigitalPlatform',
    pat: 'ado-pat-token-****************',
    pipelineId: '902',
    agentPool: 'ado-linux-vmss-pool-01'
  },
  gitRepo: {
    repoUrl: 'https://dev.azure.com/enterprise-core/DigitalPlatform/_git/e2e-automation',
    branch: 'main',
    testFilePathPattern: 'tests/**/*.spec.ts',
    annotationPattern: '@TEST-\\d+'
  },
  fieldSelections: defaultFieldSelections
};

// ============================================================================
// 8. Integration Dashboard Cards
// ============================================================================

export const mockIntegrations: Integration[] = [
  {
    id: 'int-jira-dc',
    name: 'Jira Data Center',
    category: 'Requirements & Issues (Self-Hosted)',
    status: 'connected',
    endpoint: 'https://jira-dc.internal.company.com/rest/api/2',
    description: 'On-premise Jira Data Center cluster (v9.4 LTS) with Personal Access Token authentication',
    capabilities: ['JQL requirement sync', 'Custom field extraction', 'Issue linking', 'Two-way status updates']
  },
  {
    id: 'int-xray-dc',
    name: 'Xray Data Center',
    category: 'Test Management Plugin',
    status: 'connected',
    endpoint: 'https://jira-dc.internal.company.com/rest/raven/1.0',
    description: 'Xray Server/DC Raven API for manual step tables, test execution records, and preconditions',
    capabilities: ['Raven manual steps API', 'Test Execution importing', 'Cucumber/Gherkin support', 'Coverage matrix']
  },
  {
    id: 'int-ado',
    name: 'Azure DevOps (ADO)',
    category: 'CI/CD & Pipelines',
    status: 'connected',
    endpoint: 'https://dev.azure.com/enterprise-core/DigitalPlatform/_apis',
    description: 'Azure DevOps organization with hosted VMSS Linux agents for automated Playwright regression',
    capabilities: ['_apis/pipelines trigger', '_apis/test/runs parser', 'TRX artifact collection', 'Agent pool telemetry']
  },
  {
    id: 'int-git-repo',
    name: 'Test Code Repository',
    category: 'Version Control (Git)',
    status: 'connected',
    endpoint: 'dev.azure.com/enterprise-core/DigitalPlatform/_git/e2e-automation (branch: main)',
    description: 'Playwright test automation repository containing test specs tagged with @Xray annotations',
    capabilities: ['AST step extractor', '@Xray annotation parser', 'Git commit history diff', 'Automated PR creation']
  }
];
