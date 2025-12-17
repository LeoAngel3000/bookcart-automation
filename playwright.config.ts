import { defineConfig, devices } from '@playwright/test';
import { ENV } from './config/environments';
/**
 * Comprehensive Playwright configuration for the BookCart project
 * * This configuration includes:
 * - Tag support (@ui, @api, @smoke, @regression, etc.)
 * - Environment configuration (configurable base URL)
 * - Multiple projects for different execution scopes
 * - Detailed HTML reporting
 * - CI/CD specific settings
 */

export default defineConfig({
  // Directory where tests are located
  testDir: './tests',
  
  /**
   * Run tests in parallel for speed
   * Tests in different files run in parallel automatically
   * Tests within the same file run sequentially by default
   */
  fullyParallel: true,
  
  /**
   * Fail the build if test.only is found in source code
   * This prevents accidental commits of focused tests that would
   * skip the rest of the suite
   */
  forbidOnly: !!process.env.CI,
  
  /**
   * Retries on failure
   * On CI: Retry 2 times to handle network flakiness
   * Locally: 0 retries to see failures immediately for debugging
   */
  retries: process.env.CI ? 2 : 0,
  
  /**
   * Workers (parallel processes)
   * On CI: Use 1 worker for stability and resource limits
   * Locally: Use default (based on available CPU cores)
   */
  workers: process.env.CI ? 1 : undefined,
  
  /**
   * Reporter configuration
   * - html: Generates navigable visual report in 'playwright-report/'
   * - list: Shows execution progress in console
   * - json: Generates JSON results for post-processing (CI only)
   */
  reporter: [
    ['html', { open: 'never' }],  // Do not open automatically, just generate
    ['list'],  // Show in console
    ...(process.env.CI ? [['json', { outputFile: 'test-results.json' }]] : [])
  ],
  
  /**
   * Global configuration for all tests
   * These values can be overridden in specific projects
   */
  use: {
    /**
     * Base URL for navigation
     * Allows using page.goto('/') instead of full URL
     * Facilitates switching between environments (QA, staging, prod)
     */
    baseURL: ENV.baseUrl,    
    /**
     * Trace: Detailed execution recording
     * 'on-first-retry': Only records when a test fails and is retried
     * Generates a .zip with screenshots, DOM snapshots, and network logs
     * useful for debugging in Playwright Trace Viewer
     */
    trace: 'on-first-retry',
    
    /**
     * Screenshot strategy
     * 'only-on-failure': Captures screen only when a test fails
     * Useful for quick visual debugging
     */
    screenshot: 'only-on-failure',
    
    /**
     * Video recording strategy
     * 'retain-on-failure': Only saves video if the test failed
     * Saves storage space by discarding successful run videos
     */
    video: 'retain-on-failure',
    
    /**
     * Navigation timeout
     * Maximum time to wait for page loads
     * 30s is reasonable for BookCart which can be slow
     */
    navigationTimeout: 30000,
    
    /**
     * Action timeout
     * Maximum time to wait for an element to be clickable/visible
     * 10s covers most interaction scenarios
     */
    actionTimeout: 10000,
  },
  
  /**
   * Global test timeout
   * Maximum duration for a single test
   * 60s is reasonable for complex E2E workflows
   * API tests should finish much faster (5-10s)
   */
  timeout: 60000,
  
  /**
   * Expect assertion timeout
   * Time to wait in assertions (e.g., await expect(element).toBeVisible())
   */
  expect: {
    timeout: 5000
  },
  
  /**
   * Projects: Different configurations for test execution
   * Each project can have its own config and run in different browsers
   * Tags (@ui, @api, @smoke) are configured using grep
   */
  projects: [
    /**
     * Project: Chromium Setup
     * Runs only tests marked with @setup
     * Used for data preparation before main tests
     * teardown: 'chromium-cleanup' triggers cleanup after main tests
     */
    {
      name: 'chromium-setup',
      testMatch: /.*\.setup\.ts/,
      teardown: 'chromium-cleanup',
    },
    
    /**
     * Project: Chromium Cleanup
     * Runs cleanup tests after all main tests finish
     */
    {
      name: 'chromium-cleanup',
      testMatch: /.*\.teardown\.ts/,
    },
    
    /**
     * Project: UI Tests on Chromium (Chrome)
     * Runs tests marked with @ui
     */
    {
      name: 'chromium-ui',
      use: { 
        ...devices['Desktop Chrome'],
      },
      grep: /@ui/,  // Only runs tests containing @ui in title
      dependencies: ['chromium-setup'],  // Waits for setup to complete
    },
    
    /**
     * Project: API Tests
     * API tests do not require a browser window, only request context
     */
    {
      name: 'api-tests',
      use: {
        // No browser view needed for API tests
      },
      grep: /@api/,  // Only runs tests containing @api
    },
    
    /**
     * Project: Integration Tests
     * Combined API and UI flows, requires full browser
     */
    {
      name: 'integration-tests',
      use: { 
        ...devices['Desktop Chrome'],
      },
      grep: /@integration/,
      dependencies: ['chromium-setup'],
    },
    
    /**
     * Project: Smoke Tests
     * Critical path tests for quick validation
     * Suitable for execution before deployments or on PRs
     */
    {
      name: 'smoke-tests',
      use: { 
        ...devices['Desktop Chrome'],
      },
      grep: /@smoke/,
      dependencies: ['chromium-setup'],
    },
    
    /**
     * Project: Defect Documentation
     * Tests documenting real-world bugs
     * These are expected to fail or use soft assertions
     * Separated to prevent breaking the main build pipeline
     */
    {
      name: 'defect-documentation',
      use: { 
        ...devices['Desktop Chrome'],
      },
      grep: /@defect/,
      dependencies: ['chromium-setup'],
    },
    
    /**
     * Optional Project: Firefox
     * Uncomment for cross-browser testing
     */
    // {
    //   name: 'firefox-ui',
    //   use: { 
    //     ...devices['Desktop Firefox'],
    //   },
    //   grep: /@ui/,
    //   dependencies: ['chromium-setup'],
    // },
    
    /**
     * Optional Project: WebKit (Safari)
     * Uncomment for Safari testing
     */
    // {
    //   name: 'webkit-ui',
    //   use: { 
    //     ...devices['Desktop Safari'],
    //   },
    //   grep: /@ui/,
    //   dependencies: ['chromium-setup'],
    // },
  ],
  
  /**
   * Output directory configuration
   * Location for reports, traces, and video artifacts
   */
  outputDir: 'test-results/',
});

/**
 * Useful commands for running tests with this configuration:
 * * # Run all tests
 * npx playwright test
 * * # Run only UI tests
 * npx playwright test --project=chromium-ui
 * * # Run only API tests
 * npx playwright test --project=api-tests
 * * # Run only smoke tests
 * npx playwright test --project=smoke-tests
 * * # Run tests documenting known defects
 * npx playwright test --project=defect-documentation
 * * # Run tests by grep (filter by title)
 * npx playwright test --grep "login"
 * * # Run a specific file
 * npx playwright test tests/ui/auth.spec.ts
 * * # Run in debug mode (step-by-step)
 * npx playwright test --debug
 * * # View the generated HTML report
 * npx playwright show-report
 * * # Run with a different Base URL (e.g., localhost)
 * BASE_URL=http://localhost:3000 npx playwright test
 */