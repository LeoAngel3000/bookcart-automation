# BookCart Automation Framework - iDelsoft SDET Assignment

This repository contains a professional end-to-end automation framework built with **Playwright** and **TypeScript** for the BookCart application. It is designed following industry standards for scalability, maintainability, and reliability.

## 🏗️ Architecture & Patterns

The framework implements the following patterns:
- **Page Object Model (POM):** Encapsulates page logic and selectors to promote code reuse.
- **Custom Fixtures:** Simplifies test setup by injecting Page Objects and API clients directly into tests.
- **Data-Driven Testing:** Uses a custom data generator to ensure unique test data and prevent collisions.
- **Environment Management:** Configurable environments (Base URL, API endpoints) via configuration files and environment variables.
- **API Wrapper:** Centralized API logic for backend validation and fast test data setup.

## 📁 Project Structure

```text
idelsoft-bookcart-automation/
├── tests/              # Test specifications (UI, API, Integration)
├── pages/              # Page Object Model classes
├── api/                # API clients and request helpers
├── fixtures/           # Playwright custom fixtures
├── utils/              # Shared utilities (Data generators, Constants)
├── config/             # Environment & Static test data settings
└── .github/workflows/  # CI/CD Pipeline (GitHub Actions)

🚀 Getting Started
Prerequisites

    Node.js: v18.0.0 or higher

    npm: v9.0.0 or higher

Installation

    Clone the repository to your local machine.

    Install the project dependencies:
    Bash

npm install

Install the required Playwright browsers and system dependencies:
Bash

    npx playwright install --with-deps

🧪 Running Tests

The framework includes several pre-configured npm scripts in package.json to streamline execution:
Command	Description
npm run test	Runs all tests across all configured projects.
npm run test:ui	Runs only UI-related tests using Chromium.
npm run test:api	Executes API validation tests.
npm run test:smoke	Runs critical path smoke tests for quick validation.
npm run test:defects	Runs tests documenting known application bugs.
npm run test:debug	Opens the Playwright Inspector for step-by-step debugging.
npm run report	Serves the last generated HTML report.
🛠️ CI/CD Integration

This project is ready for Continuous Integration using GitHub Actions.

    Workflow: Defined in .github/workflows/playwright.yml.

    Triggers: Automatically runs on every push or pull_request to the main or master branches.

    Artifacts: Upon completion (or failure), the HTML test report is uploaded as a GitHub artifact and kept for 30 days for debugging purposes.

🐞 Known Defects Documentation

A core requirement of this assignment was identifying and documenting existing bugs. This framework uses Playwright's test.fail() to track these issues without breaking the pipeline:

    TC-005: Login failure — The application does not display an error message when invalid credentials are provided.

    TC-006 & TC-008: API Critical Failure — The /api/Book endpoint returns a 500 Internal Server Error, resulting in an empty book catalog in the UI.

    TC-007: UI Component Issue — The price range slider filter is unresponsive to user interaction.

Author: Leonardo Ángel Cárrega Role: SDET Candidate