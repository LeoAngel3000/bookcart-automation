import { test as base, Page } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import { RegisterPage } from '@pages/RegisterPage';
import { BooksPage } from '@pages/BooksPage';
import { BookCartAPI } from '@api/BookCartAPI';
import { generateTestUser, TestUser } from '@utils/data-generator';

/**
 * Custom Test Fixtures for BookCart Automation
 * 
 * Fixtures are one of Playwright's most powerful features. They allow you to:
 * - Automatically set up test prerequisites
 * - Share setup logic across multiple tests
 * - Keep tests clean and focused on what they're testing
 * - Ensure proper cleanup after tests
 * 
 * Think of fixtures as "magic parameters" that Playwright injects into your tests.
 * When you write: test('my test', async ({ authenticatedPage }) => { ... })
 * Playwright automatically runs the fixture function, does all the setup,
 * and gives you the ready-to-use result.
 * 
 * This is much better than manually doing setup in beforeEach hooks because:
 * - Tests only pay the cost of fixtures they actually use
 * - Fixtures can depend on other fixtures
 * - Setup logic is reusable across test files
 * - Tests are more readable
 */

/**
 * Interface defining all our custom fixtures
 * These types tell TypeScript what fixtures are available and what they return
 */
type BookCartFixtures = {
  // Page Object fixtures - Pre-initialized page objects ready to use
  loginPage: LoginPage;
  registerPage: RegisterPage;
  booksPage: BooksPage;
  
  // API fixture - Pre-initialized API client
  bookApi: BookCartAPI;
  
  // Data fixtures - Pre-generated test data
  testUser: TestUser;
  uniqueUsername: string;
  
  // State fixtures - Pages in specific states
  authenticatedPage: Page;
  authenticatedApi: BookCartAPI;
};

/**
 * Extend Playwright's base test with our custom fixtures
 * This creates a new 'test' object that includes all fixtures
 */
export const test = base.extend<BookCartFixtures>({
  
  // ============================================
  // PAGE OBJECT FIXTURES
  // ============================================
  
  /**
   * LoginPage fixture
   * Provides a pre-initialized LoginPage object
   * 
   * Usage in test:
   * test('login test', async ({ loginPage }) => {
   *   await loginPage.goto();
   *   await loginPage.login('user', 'pass');
   * });
   */
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
    // Cleanup happens automatically after test
  },

  /**
   * RegisterPage fixture
   * Provides a pre-initialized RegisterPage object
   */
  registerPage: async ({ page }, use) => {
    const registerPage = new RegisterPage(page);
    await use(registerPage);
  },

  /**
   * BooksPage fixture
   * Provides a pre-initialized BooksPage object
   */
  booksPage: async ({ page }, use) => {
    const booksPage = new BooksPage(page);
    await use(booksPage);
  },

  // ============================================
  // API FIXTURES
  // ============================================

  /**
   * BookCartAPI fixture
   * Provides a pre-initialized API client
   * 
   * Usage in test:
   * test('api test', async ({ bookApi }) => {
   *   const response = await bookApi.getAllBooks();
   *   expect(response.status()).toBe(200);
   * });
   */
  bookApi: async ({ request }, use) => {
    const api = new BookCartAPI(request);
    await use(api);
    // Cleanup: clear any stored token
    api.clearAuthToken();
  },

  // ============================================
  // DATA GENERATION FIXTURES
  // ============================================

  /**
   * TestUser fixture
   * Automatically generates a unique test user for each test
   * 
   * This is incredibly useful because every test that needs a user
   * gets a fresh, unique one automatically. No more username conflicts!
   * 
   * Usage in test:
   * test('registration test', async ({ testUser, registerPage }) => {
   *   await registerPage.goto();
   *   await registerPage.registerUser(testUser);
   *   // testUser is guaranteed to be unique
   * });
   */
  testUser: async ({}, use) => {
    const user = generateTestUser('fixture');
    await use(user);
    // No cleanup needed - user data is just in memory
  },

  /**
   * UniqueUsername fixture
   * Generates just a unique username string
   * Useful when you only need a username, not full user data
   * 
   * Usage in test:
   * test('username validation', async ({ uniqueUsername, bookApi }) => {
   *   const response = await bookApi.validateUsername(uniqueUsername);
   *   expect(response.status()).toBe(200);
   * });
   */
  uniqueUsername: async ({}, use) => {
    const username = `fixture_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    await use(username);
  },

  // ============================================
  // AUTHENTICATED STATE FIXTURES
  // ============================================

  /**
   * AuthenticatedPage fixture
   * 
   * This is a SUPER POWERFUL fixture that gives you a page that's already
   * logged in and ready to use. This is perfect for tests that need to test
   * functionality that requires authentication but don't care about testing
   * the login process itself.
   * 
   * How it works:
   * 1. Creates a new unique test user via API
   * 2. Logs in that user via API to get a token
   * 3. Injects the token into the browser's localStorage
   * 4. Navigates to the home page
   * 5. Returns the page, which is now authenticated
   * 
   * This is much faster than logging in through the UI every time!
   * 
   * Usage in test:
   * test('test cart functionality', async ({ authenticatedPage }) => {
   *   // authenticatedPage is already logged in!
   *   await authenticatedPage.goto('/cart');
   *   // Test cart functionality without worrying about login
   * });
   */
  authenticatedPage: async ({ page, request }, use) => {
    // Step 1: Create a new user via API
    const api = new BookCartAPI(request);
    const testUser = generateTestUser('auth');
    
    const { registerResponse, token } = await api.registerAndLogin(testUser);
    
    // Verify user was created successfully
    if (!registerResponse.ok() || !token) {
      throw new Error(`Failed to create authenticated user: ${registerResponse.status()}`);
    }

    // Step 2: Inject authentication into the browser
    // We navigate to the site first so we're on the correct domain
    await page.goto('/');
    
    // Inject the token into localStorage
    // BookCart stores authentication in localStorage under 'currentUser'
    await page.evaluate((userData) => {
      localStorage.setItem('currentUser', JSON.stringify(userData));
    }, {
      token: token,
      username: testUser.username,
      _userId: 1, // You might need to extract actual userId from register response
    });

    // Step 3: Reload page so the app picks up the authentication
    await page.reload();

    // Now the page is fully authenticated and ready to use!
    await use(page);

    // Cleanup: logout or clear localStorage
    await page.evaluate(() => {
      localStorage.removeItem('currentUser');
    });
  },

  /**
   * AuthenticatedApi fixture
   * 
   * Similar to authenticatedPage, but for API calls.
   * This gives you an API client that's already authenticated with a valid token.
   * 
   * Usage in test:
   * test('test authenticated API endpoint', async ({ authenticatedApi }) => {
   *   // authenticatedApi already has a valid token
   *   const response = await authenticatedApi.createOrder({ ... });
   *   expect(response.status()).toBe(201);
   * });
   */
  authenticatedApi: async ({ request }, use) => {
    const api = new BookCartAPI(request);
    const testUser = generateTestUser('api_auth');
    
    // Register and login to get token
    const { registerResponse, token } = await api.registerAndLogin(testUser);
    
    if (!registerResponse.ok() || !token) {
      throw new Error(`Failed to authenticate API: ${registerResponse.status()}`);
    }

    // Token is already set in the API client by registerAndLogin
    // Now the API client is ready for authenticated requests
    await use(api);

    // Cleanup
    api.clearAuthToken();
  },
});

/**
 * Re-export expect from Playwright so tests can import both from one place
 * 
 * Usage in test file:
 * import { test, expect } from '@fixtures/test-fixtures';
 * 
 * Instead of:
 * import { test } from '@fixtures/test-fixtures';
 * import { expect } from '@playwright/test';
 */
export { expect } from '@playwright/test';

/**
 * USAGE EXAMPLES:
 * 
 * Example 1: Simple test using page object fixture
 * ================================================
 * test('user can navigate to login', async ({ loginPage }) => {
 *   await loginPage.goto();
 *   await expect(loginPage.page).toHaveURL(/login/);
 * });
 * 
 * 
 * Example 2: Test using unique test data fixture
 * ================================================
 * test('user can register', async ({ registerPage, testUser }) => {
 *   await registerPage.goto();
 *   await registerPage.registerUser(testUser);
 *   // testUser is automatically unique for this test run
 * });
 * 
 * 
 * Example 3: Test using authenticated page fixture
 * ================================================
 * test('authenticated user can view orders', async ({ authenticatedPage }) => {
 *   // No need to login manually - page is already authenticated!
 *   await authenticatedPage.goto('/my-orders');
 *   await expect(authenticatedPage.locator('h1')).toContainText('My Orders');
 * });
 * 
 * 
 * Example 4: Integration test using multiple fixtures
 * =====================================================
 * test('create user via API and verify in UI', async ({ 
 *   bookApi, 
 *   testUser, 
 *   loginPage 
 * }) => {
 *   // Use API to create user
 *   const response = await bookApi.registerUser(testUser);
 *   expect(response.status()).toBe(201);
 *   
 *   // Use UI to login as that user
 *   await loginPage.goto();
 *   await loginPage.login(testUser.username, testUser.password);
 *   
 *   // Verify login worked
 *   await expect(loginPage.page.locator('button:has-text("Logout")')).toBeVisible();
 * });
 * 
 * 
 * Example 5: API test with authenticated client
 * ==============================================
 * test('authenticated user can create order', async ({ authenticatedApi }) => {
 *   const orderData = { userId: 1, items: [...] };
 *   const response = await authenticatedApi.createOrder(orderData);
 *   expect(response.status()).toBe(201);
 * });
 */