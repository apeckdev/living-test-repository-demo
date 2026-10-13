# Living Test Repository Demo

A dynamic, React-based web application demonstrating a "Living Test Repository" architecture. This demo showcases how fragmented engineering data—like business requirements, automated tests, manual test definitions, and CI/CD pipeline execution history—can be aggregated into a single, unified source of truth.

## Features

- **Data Aggregation Engine**: Simulates combining disjointed data from Requirements Registries, Test Case Management systems, and CI/CD tools into unified Test Objects. Interactive source cards reveal underlying toolchains (Jira, TestRail, Jenkins, GitHub Actions, etc.) on hover.
- **Dynamic Relational View**: Drill down into any unified test object to see exactly how requirements, test steps, properties, and execution history relate. Edits to descriptions and summaries buffer locally and dispatch webhooks cleanly when leaving the field.
- **Connected Integrations & Audit Stream**: A dedicated live event stream simulating outgoing webhooks and system actions, paired with an **Integrations** dashboard showing connection status, endpoints, and capabilities for Jira, TestRail, CI/CD (Jenkins & Azure DevOps), and GitHub, with target event filtering.
- **Test Automation Simulation**: 
  - Author tests with BDD-style steps to dynamically trigger automated PR generation.
  - Manually trigger CI/CD pipeline runs for automated tests directly from the UI and watch the execution results flow back into the platform in real-time.
- **Schema Extensibility**: Add simulated new global requirements to dynamically inject new required fields across all existing test schemas.

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4 & PostCSS
- **Icons**: Lucide React

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## Demo Script Highlights

- Mouse over the **Requirements**, **Existing Tests**, and **CI/CD Pipelines** cards to explore the supported toolchains, then click **Run Aggregation** to ingest data into the unified dashboard.
- Switch to the **Events** tab and click **Integrations** to inspect connected platforms (Jira, TestRail, Jenkins/ADO, GitHub), their endpoints, and active listeners, or filter the audit stream by integration.
- Open a test case to edit its **Status**, **Priority**, or **Description**, and observe how webhooks fire cleanly to external systems when you leave the field.
- Click **Simulate New Requirement** to see how a new security spec instantly modifies the global schema and adds a new `requiresAuthToken` field to every test.
- Create a **New Test Case** with steps like "Navigate to...", "Click...", and "Verify..." to trigger automated PR generation via the mock GitHub webhook.
- Click **Manually Trigger Run** on an automated test to watch a CI/CD pipeline spin up, fail/pass, and report artifact links back to the repository.
