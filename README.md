# Living Test Repository Demo

A dynamic, React-based web application demonstrating a "Living Test Repository" architecture. This demo showcases how fragmented engineering data—like business requirements, automated tests, manual test definitions, and CI/CD pipeline execution history—can be aggregated into a single, unified source of truth.

## Features

- **Data Aggregation Engine**: Simulates combining disjointed data from Requirements Registries, Test Case Management systems, and CI/CD tools into unified Test Objects.
- **Dynamic Relational View**: Drill down into any unified test object to see exactly how requirements, test steps, properties, and execution history relate.
- **Webhook & Audit Stream**: A dedicated live event stream simulating outgoing webhooks and system actions (e.g., syncing updates back to Jira, Azure DevOps, TestRail, and GitHub).
- **Test Automation Simulation**: 
  - Author tests with BDD-style steps to dynamically trigger automated PR generation.
  - Manually trigger CI/CD pipeline runs for automated tests directly from the UI and watch the execution results flow back into the platform in real-time.
- **Schema Extensibility**: Add simulated new global requirements to dynamically inject new required fields across all existing test schemas.

## Tech Stack

- **Framework**: React 18 with TypeScript
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

- Click **Aggregate Data** to ingest the mock data sources and build the unified dashboard.
- Open a test case to edit its **Status**, **Priority**, or **Description**, and watch the **Events** tab to see simulated webhooks firing to external systems.
- Click **Simulate New Requirement** to see how a new security spec instantly modifies the global schema and adds a new `requiresAuthToken` field to every test.
- Create a **New Test Case** with steps like "Navigate to...", "Click...", and "Verify..." to trigger automated PR generation via the mock GitHub webhook.
- Click **Trigger Run** on an automated test to watch a CI/CD pipeline spin up, fail/pass, and report artifact links back to the repository.
