/**
 * Authentication Tests - UI
 * 
 * This test suite covers user authentication flows including:
 * - Login with valid and invalid credentials
 * - Registration navigation
 * - Error message validation
 * 
 * Test Cases Implemented:
 * - TC-005: Login with Invalid Credentials (documents error messaging bug)
 * - Additional smoke tests for navigation
 */

import { test, expect } from '@fixtures/test-fixtures';
import { TEST_DATA } from '@config/test-data';
import { TEST_TAGS } from '@utils/constants';

/**
 * Test Suite: Authentication and Login
 * 
 * These tests verify the authentication mechanisms of BookCart
 * including both successful and failed login attempts
 */
test.describe('Authentication Tests @ui', () => {
  
  /**
   * TC-005: Login with Invalid Credentials
   * 
   * Purpose: Documents a critical UX defect where the application
   * fails to display any error message when login fails
   * 
   * Priority: High
   * Type: Negative Test / Defect Documentation
   * Tags: @ui @defect @regression
   * 
   * EXPECTED BEHAVIOR:
   * - User enters invalid credentials
   * - User clicks Login button
   * - System displays clear error message: "Username or Password is incorrect"
   * - Login form remains visible
   * - User stays on login page
   * 
   * ACTUAL BEHAVIOR (DEFECT):
   * - User enters invalid credentials
   * - User clicks Login button
   * - NO error message appears
   * - Nothing happens - silent failure
   * - Poor user experience - user doesn't know why login failed
   * 
   * This test documents the defect for tracking and verification
   * when the bug is fixed in the future.
   */
  test(`TC-005 - Login with Invalid Credentials (Error Message Bug) ${TEST_TAGS.DEFECT} ${TEST_TAGS.REGRESSION}`, 
    async ({ loginPage }) => {
    
    // GIVEN: User is on the login page
    await loginPage.goto();
    
    // WHEN: User attempts to login with invalid credentials
    const invalidUser = TEST_DATA.users.invalid;
    await loginPage.login(invalidUser.username, invalidUser.password);
    
    // THEN: Login should fail (this works correctly)
    await loginPage.verifyLoginFailed();
    
    // AND: Error message should be displayed (THIS IS THE BUG)
    const hasErrorMessage = await loginPage.hasErrorMessage();
    
    if (!hasErrorMessage) {
      // Document the defect in test output
      console.log('❌ DEFECT CONFIRMED (TC-005): No error message displayed for invalid login');
      console.log('   Expected: Error message "Username or Password is incorrect"');
      console.log('   Actual: No error message - silent failure');
      console.log('   Impact: Poor UX - users don\'t understand why login failed');
    } else {
      console.log('✅ DEFECT FIXED: Error message is now displayed correctly');
    }
    
    // Use soft expect to document bug without failing entire suite
    // When bug is fixed, this will pass
    expect.soft(hasErrorMessage).toBe(true);
  });

  /**
   * Navigation to Register Page
   * 
   * Purpose: Verifies that users can navigate from login to registration
   * This is a smoke test ensuring basic navigation works
   * 
   * Priority: High (blocks registration flow)
   * Type: Smoke Test / Functional
   * Tags: @ui @smoke
   */
  test(`User can navigate from Login to Register page ${TEST_TAGS.SMOKE}`, 
    async ({ loginPage }) => {
    
    // GIVEN: User is on the login page
    await loginPage.goto();
    await expect(loginPage.page).toHaveURL(/.*login/);
    
    // WHEN: User clicks the "Register" link
    await loginPage.clickRegisterLink();
    
    // THEN: User should be redirected to registration page
    await loginPage.verifyNavigatedToRegister();
    
    console.log('✅ Navigation from Login to Register works correctly');
  });

  /**
   * Successful Login with Valid Credentials
   * 
   * Purpose: Verifies that users can successfully login with correct credentials
   * Uses a known test user that exists in the system
   * 
   * Priority: Critical (blocks all authenticated features)
   * Type: Positive Test / Smoke
   * Tags: @ui @smoke @regression
   */
  test(`User can successfully login with valid credentials ${TEST_TAGS.SMOKE} ${TEST_TAGS.REGRESSION}`, 
    async ({ loginPage }) => {
    
    // GIVEN: User is on the login page
    await loginPage.goto();
    
    // WHEN: User logs in with valid credentials
    const validUser = TEST_DATA.users.standard;
    await loginPage.login(validUser.username, validUser.password);
    
    // THEN: User should be logged in successfully
    await loginPage.verifyLoginSuccess(validUser.username);
    
    // AND: User should be redirected away from login page
    await expect(loginPage.page).not.toHaveURL(/.*login/);
    
    console.log(`✅ Login successful for user: ${validUser.username}`);
  });

  /**
   * Login Button State Validation
   * 
   * Purpose: Verifies that login button is enabled when form is ready
   * This is a UI validation test
   * 
   * Priority: Low
   * Type: UI Validation
   * Tags: @ui
   */
  test('Login button is enabled on page load', async ({ loginPage }) => {
    
    // GIVEN: User navigates to login page
    await loginPage.goto();
    
    // THEN: Login button should be enabled and clickable
    const isEnabled = await loginPage.isLoginButtonEnabled();
    expect(isEnabled).toBe(true);
    
    // AND: Login button should be visible
    await expect(loginPage.loginSubmitButton).toBeVisible();
    
    console.log('✅ Login button is properly enabled and ready for interaction');
  });

  /**
   * Case Sensitivity Test for Username
   * 
   * Purpose: Documents that usernames are case-insensitive
   * This is important for user experience
   * 
   * Priority: Medium
   * Type: Functional Validation
   * Tags: @ui @regression
   * 
   * Related to: TC-004 case sensitivity verification
   */
  test(`Username login is case-insensitive ${TEST_TAGS.REGRESSION}`, async ({ loginPage }) => {
    
    const user = TEST_DATA.users.standard;
    
    // Test 1: Login with lowercase username
    // GIVEN: User is on login page
    await loginPage.goto();
    
    // WHEN: User logs in with lowercase username
    await loginPage.login(user.username.toLowerCase(), user.password);
    
    // THEN: Login should succeed
    await loginPage.verifyLoginSuccess();
    console.log(`✅ Login successful with lowercase: ${user.username.toLowerCase()}`);
    
    // Logout for next test
    await loginPage.logout();
    
    // Test 2: Login with uppercase username
    // GIVEN: User is on login page
    await loginPage.goto();
    
    // WHEN: User logs in with uppercase username
    await loginPage.login(user.username.toUpperCase(), user.password);
    
    // THEN: Login should succeed
    await loginPage.verifyLoginSuccess();
    console.log(`✅ Login successful with uppercase: ${user.username.toUpperCase()}`);
    
    console.log('✅ Confirmed: Usernames are case-insensitive (good UX)');
  });

  /**
   * Empty Credentials Validation
   * 
   * Purpose: Verifies system behavior when submitting empty credentials
   * 
   * Priority: Medium
   * Type: Negative Test / Validation
   * Tags: @ui
   */
  test('Login fails gracefully with empty credentials', async ({ loginPage }) => {
    
    // GIVEN: User is on login page
    await loginPage.goto();
    
    // WHEN: User attempts to login with empty fields
    await loginPage.login('', '');
    
    // THEN: User should remain on login page
    await loginPage.verifyLoginFailed();
    
    // AND: Login button should still be visible
    await expect(loginPage.loginSubmitButton).toBeVisible();
    
    console.log('✅ Empty credentials are handled correctly');
  });

  /**
   * Logout Functionality
   * 
   * Purpose: Verifies that logged-in users can successfully logout
   * 
   * Priority: High
   * Type: Functional
   * Tags: @ui @smoke
   */
  test(`User can logout successfully ${TEST_TAGS.SMOKE}`, async ({ loginPage }) => {
    
    // GIVEN: User is logged in
    await loginPage.performCompleteLogin(
      TEST_DATA.users.standard.username,
      TEST_DATA.users.standard.password
    );
    
    // WHEN: User clicks logout button
    await loginPage.logout();
    
    // THEN: User should be logged out
    await loginPage.verifyLoggedOut();
    
    // AND: Login elements should be visible again
    await expect(loginPage.loginSubmitButton).toBeVisible();
    
    console.log('✅ Logout functionality works correctly');
  });
});

/**
 * Test Execution Instructions:
 * 
 * Run all auth tests:
 * npx playwright test tests/ui/auth.spec.ts
 * 
 * Run only smoke tests:
 * npx playwright test --grep @smoke
 * 
 * Run only defect documentation tests:
 * npx playwright test --grep @defect
 * 
 * Run in headed mode (see browser):
 * npx playwright test tests/ui/auth.spec.ts --headed
 * 
 * Run in debug mode (step through):
 * npx playwright test tests/ui/auth.spec.ts --debug
 */