import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { ROUTES, ERROR_MESSAGES, TIMEOUTS } from '@utils/constants';

/**
 * LoginPage - Page Object for User Authentication
 * 
 * This class handles all interactions with the login page including:
 * - Successful login flows
 * - Failed login attempts
 * - Navigation to registration
 * - Error message validation
 * 
 * Test cases using this page:
 * - TC-005: Login with Invalid Credentials (documents error messaging bug)
 * - Multiple integration tests that need authenticated users
 */
export class LoginPage extends BasePage {
  // ============================================
  // ELEMENT LOCATORS
  // ============================================
  
  // Form input fields
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  
  // Action buttons and links
  readonly loginSubmitButton: Locator;
  readonly registerLink: Locator;
  
  // Error and validation messages
  readonly errorMessage: Locator;
  readonly usernameError: Locator;
  readonly passwordError: Locator;
  
  // Success indicators - elements that appear after successful login
  readonly logoutButton: Locator;
  readonly userProfileButton: Locator;
  readonly cartIcon: Locator;

  constructor(page: Page) {
    super(page);
    
    // Form inputs using Material UI form control names
    this.usernameInput = page.locator('input[formcontrolname="username"]');
    this.passwordInput = page.locator('input[formcontrolname="password"]');
    
    // Buttons and links
    // We use filter with hasText to be more specific and avoid ambiguity
    this.loginSubmitButton = page.locator('mat-card-actions button').filter({ hasText: 'Login' });
    this.registerLink = page.locator('button, a').filter({ hasText: 'Register' });
    
    // Error messages
    // Material UI uses mat-error class for validation errors
    this.errorMessage = page.locator('mat-error, .error-message');
    this.usernameError = page.locator('mat-error').filter({ has: this.usernameInput });
    this.passwordError = page.locator('mat-error').filter({ has: this.passwordInput });
    
    // Elements that indicate successful login
    this.logoutButton = page.locator('button:has-text("Logout")');
    this.userProfileButton = page.locator('[aria-label="User Profile"], button:has-text("Profile")');
    this.cartIcon = page.locator('mat-icon:has-text("shopping_cart")');
  }

  // ============================================
  // NAVIGATION METHODS
  // ============================================

  /**
   * Navigates directly to the login page
   * Waits for page to be fully loaded and interactive
   */
  async goto(): Promise<void> {
    await this.navigateTo(ROUTES.LOGIN);
    await this.waitForLoader();
    await this.waitForPageReady();
  }

  /**
   * Waits for the login page to be ready for user interaction
   * This means the form is visible and the submit button is enabled
   */
  async waitForPageReady(): Promise<void> {
    await this.loginSubmitButton.waitFor({ 
      state: 'visible', 
      timeout: TIMEOUTS.MEDIUM 
    });
  }

  // ============================================
  // FORM INTERACTION METHODS
  // ============================================

  /**
   * Fills the username field
   * Clears any existing value first to ensure clean state
   * 
   * @param username - Username to enter
   */
  async fillUsername(username: string): Promise<void> {
    await this.usernameInput.clear();
    await this.usernameInput.fill(username);
  }

  /**
   * Fills the password field
   * Clears any existing value first to ensure clean state
   * 
   * @param password - Password to enter
   */
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.clear();
    await this.passwordInput.fill(password);
  }

  /**
   * Clicks the Login button
   * Waits for any loading indicators to disappear after clicking
   */
  async clickLogin(): Promise<void> {
    await this.loginSubmitButton.click();
    await this.waitForLoader();
  }

  /**
   * Clicks the Register link to navigate to registration page
   */
  async clickRegisterLink(): Promise<void> {
    await this.registerLink.click();
    await this.waitForLoader();
  }

  // ============================================
  // HIGH-LEVEL ACTION METHODS
  // ============================================

  /**
   * Performs complete login flow with username and password
   * This is the main method used by most tests
   * 
   * Steps:
   * 1. Fill username field
   * 2. Fill password field
   * 3. Click login button
   * 4. Wait for navigation/loading to complete
   * 
   * @param username - Username for login
   * @param password - Password for login
   * 
   * @example
   * ```typescript
   * await loginPage.goto();
   * await loginPage.login('testuser', 'Test@123');
   * await loginPage.verifyLoginSuccess();
   * ```
   */
  async login(username: string, password: string): Promise<void> {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.clickLogin();
  }

  /**
   * Performs login with known valid credentials from test data
   * Useful for quick authenticated state setup
   * 
   * @param userType - Type of test user ('standard' by default)
   */
  async loginAsKnownUser(userType: 'standard' | 'admin' = 'standard'): Promise<void> {
    // Import test data here to avoid circular dependencies
    const { TEST_DATA } = require('@config/test-data');
    const user = TEST_DATA.users[userType];
    
    if (!user) {
      throw new Error(`Unknown user type: ${userType}`);
    }
    
    await this.login(user.username, user.password);
  }

  /**
   * Attempts login and explicitly waits for failure
   * Useful for negative testing scenarios like TC-005
   * 
   * @param username - Invalid username
   * @param password - Invalid password
   */
  async attemptFailedLogin(username: string, password: string): Promise<void> {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.clickLogin();
    
    // Wait a moment for error to appear (or not appear in case of TC-005 bug)
    await this.page.waitForTimeout(2000);
  }

  // ============================================
  // VERIFICATION METHODS
  // ============================================

  /**
   * Verifies that login was successful by checking for post-login elements
   * 
   * Checks performed:
   * - URL has changed from /login
   * - Logout button is visible (indicating authenticated state)
   * - Optional: Verify username appears in navbar
   * 
   * @param username - Optional username to verify appears in UI
   * 
   * @example
   * ```typescript
   * await loginPage.login('user', 'pass');
   * await loginPage.verifyLoginSuccess('user');
   * ```
   */
  async verifyLoginSuccess(username?: string): Promise<void> {
    // Verify URL changed away from login page
    await this.page.waitForURL((url) => !url.pathname.includes('/login'), {
      timeout: TIMEOUTS.MEDIUM,
    });

    // Verify logout button appears (strongest indicator of authenticated state)
    await expect(this.logoutButton).toBeVisible({ 
      timeout: TIMEOUTS.MEDIUM 
    });

    // If username provided, verify it appears in the UI
    if (username) {
      const usernameInNavbar = this.page.locator(`text=${username}`).first();
      await expect(usernameInNavbar).toBeVisible({ timeout: TIMEOUTS.SHORT });
    }
  }

  /**
   * Verifies that login failed and user remains on login page
   * 
   * Checks performed:
   * - Still on /login URL
   * - Login button still visible
   * - Logout button NOT visible
   * 
   * Used in TC-005 to verify login correctly fails with invalid credentials
   */
  async verifyLoginFailed(): Promise<void> {
    // Should still be on login page
    await expect(this.page).toHaveURL(/.*login/);
    
    // Login button should still be visible
    await expect(this.loginSubmitButton).toBeVisible();
    
    // User should NOT be logged in
    await expect(this.logoutButton).not.toBeVisible();
  }

  /**
   * Verifies that an error message is displayed
   * 
   * IMPORTANT NOTE: Due to TC-005 documented defect, this will fail
   * when testing BookCart because the app doesn't show error messages
   * for invalid login attempts
   * 
   * @param expectedMessage - Expected error text (default: standard invalid credentials message)
   */
  async verifyErrorMessage(expectedMessage: string = ERROR_MESSAGES.INVALID_CREDENTIALS): Promise<void> {
    // Wait for error message to appear
    await expect(this.errorMessage).toBeVisible({ 
      timeout: TIMEOUTS.SHORT 
    });
    
    // Verify error message contains expected text
    await expect(this.errorMessage).toContainText(expectedMessage);
  }

  /**
   * Checks if error message is displayed (non-throwing version)
   * Returns true if error is visible, false otherwise
   * 
   * This is useful for soft assertions or conditional logic
   * Particularly useful for TC-005 where we're documenting that
   * the error message does NOT appear (which is a bug)
   * 
   * @returns Promise<boolean> - true if error message is visible
   */
  async hasErrorMessage(): Promise<boolean> {
    try {
      await this.errorMessage.waitFor({ 
        state: 'visible', 
        timeout: 3000 
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Verifies that NO error messages are displayed
   * Useful for positive test scenarios
   */
  async verifyNoErrorMessages(): Promise<void> {
    await expect(this.errorMessage).not.toBeVisible();
  }

  /**
   * Verifies navigation to registration page was successful
   * Used when testing the "Register" link navigation
   */
  async verifyNavigatedToRegister(): Promise<void> {
    await expect(this.page).toHaveURL(/.*register/);
  }

  // ============================================
  // STATE CHECK METHODS
  // ============================================

  /**
   * Checks if the login button is enabled
   * Useful for form validation testing
   * 
   * @returns true if button can be clicked, false if disabled
   */
  async isLoginButtonEnabled(): Promise<boolean> {
    return await this.loginSubmitButton.isEnabled();
  }

  /**
   * Gets the current value from username input
   * Useful for verification after filling
   */
  async getUsernameValue(): Promise<string> {
    return await this.usernameInput.inputValue();
  }

  /**
   * Gets the current value from password input
   * Note: Password fields typically return empty string for security
   */
  async getPasswordValue(): Promise<string> {
    return await this.passwordInput.inputValue();
  }

  /**
   * Checks if user is currently on the login page
   * 
   * @returns true if URL contains '/login'
   */
  async isOnLoginPage(): Promise<boolean> {
    const url = this.page.url();
    return url.includes('/login');
  }

  // ============================================
  // HELPER METHODS FOR SPECIFIC TEST CASES
  // ============================================

  /**
   * TC-005: Tests login with invalid credentials and documents error messaging bug
   * 
   * Expected behavior: Error message should be displayed
   * Actual behavior: No error message appears (BUG)
   * 
   * This method performs the full test flow and returns whether error appeared
   * 
   * @param invalidUsername - Non-existent username
   * @param invalidPassword - Wrong password
   * @returns true if error message appeared, false if bug is present
   */
  async testInvalidLoginBug(invalidUsername: string, invalidPassword: string): Promise<boolean> {
    await this.goto();
    await this.attemptFailedLogin(invalidUsername, invalidPassword);
    
    // Check if error message appears
    const hasError = await this.hasErrorMessage();
    
    // Verify login failed regardless of error message
    await this.verifyLoginFailed();
    
    return hasError;
  }

  /**
   * Performs complete login flow from start to finish
   * Includes navigation, login action, and success verification
   * 
   * This is a convenience method that combines multiple steps
   * Perfect for tests that need authenticated state as setup
   * 
   * @param username - Username for login
   * @param password - Password for login
   */
  async performCompleteLogin(username: string, password: string): Promise<void> {
    await this.goto();
    await this.login(username, password);
    await this.verifyLoginSuccess(username);
  }

  /**
   * Quick method to get to authenticated state
   * Uses the known working test user from test data
   * 
   * This is faster than creating a new user and is perfect for
   * tests that need authentication as a prerequisite
   */
  async quickAuthenticatedState(): Promise<void> {
    await this.goto();
    await this.loginAsKnownUser('standard');
    await this.verifyLoginSuccess();
  }

  // ============================================
  // LOGOUT METHODS
  // ============================================

  /**
   * Performs logout if user is logged in
   * Useful for cleanup or testing logout functionality
   */
  async logout(): Promise<void> {
    // Check if logout button is visible (user is logged in)
    if (await this.logoutButton.isVisible()) {
      await this.logoutButton.click();
      await this.waitForLoader();
      
      // Verify logout was successful
      await expect(this.logoutButton).not.toBeVisible();
    }
  }

  /**
   * Verifies user is in logged out state
   * Checks that login button is visible and logout button is not
   */
  async verifyLoggedOut(): Promise<void> {
    await expect(this.loginSubmitButton).toBeVisible();
    await expect(this.logoutButton).not.toBeVisible();
  }
}