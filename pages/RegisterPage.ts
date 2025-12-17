import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { ROUTES, ERROR_MESSAGES, TIMEOUTS } from '@utils/constants';
import { TestUser } from '@utils/data-generator';

/**
 * RegisterPage - Page Object for User Registration
 * 
 * This class encapsulates all interactions with the registration page.
 * It follows the Page Object Model (POM) pattern which provides:
 * - Centralized element selectors
 * - Reusable action methods
 * - Better maintainability (if UI changes, update only this class)
 * - More readable tests (business logic vs technical implementation)
 * 
 * Test cases using this page:
 * - TC-001: Successful User Registration with Valid Data
 * - TC-002: User Registration Validation - Duplicate Username
 * - TC-003: User Registration - Missing Gender Selection
 */
export class RegisterPage extends BasePage {
  // ============================================
  // ELEMENT LOCATORS
  // ============================================
  
  // Form input fields
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  
  // Gender selection (radio buttons in Material UI)
  readonly genderRadio: (gender: string) => Locator;
  readonly maleRadio: Locator;
  readonly femaleRadio: Locator;
  
  // Action buttons
  readonly registerSubmitButton: Locator;
  readonly loginLink: Locator;
  
  // Validation and error messages
  readonly usernameError: Locator;
  readonly passwordError: Locator;
  readonly confirmPasswordError: Locator;
  readonly formErrors: Locator;
  
  // Success indicators
  readonly logoutButton: Locator; // Appears after successful registration

  constructor(page: Page) {
    super(page);
    
    // Form inputs - using Material UI formControlName attributes
    this.firstNameInput = page.locator('input[formcontrolname="firstname"]');
    this.lastNameInput = page.locator('input[formcontrolname="lastname"]');
    this.usernameInput = page.locator('input[formcontrolname="username"]');
    this.passwordInput = page.locator('input[formcontrolname="password"]');
    this.confirmPasswordInput = page.locator('input[formcontrolname="confirmPassword"]');
    
    // Gender radio buttons
    this.genderRadio = (gender: string) => page.locator(`mat-radio-button[value="${gender}"]`);
    this.maleRadio = this.genderRadio('Male');
    this.femaleRadio = this.genderRadio('Female');
    
    // Buttons
    this.registerSubmitButton = page.locator('mat-card-actions button').filter({ hasText: 'Register' });
    this.loginLink = page.locator('a:has-text("Login")');
    
    // Error message locators
    this.usernameError = page.locator('mat-error').filter({ has: this.usernameInput });
    this.passwordError = page.locator('mat-error').filter({ has: this.passwordInput });
    this.confirmPasswordError = page.locator('mat-error').filter({ has: this.confirmPasswordInput });
    this.formErrors = page.locator('mat-error');
    
    // Success indicators
    this.logoutButton = page.locator('button:has-text("Logout")');
  }

  // ============================================
  // NAVIGATION METHODS
  // ============================================

  /**
   * Navigates directly to the registration page
   * Waits for page to load completely
   */
  async goto(): Promise<void> {
    await this.navigateTo(ROUTES.REGISTER);
    await this.waitForLoader();
    await this.waitForPageReady();
  }

  /**
   * Waits for registration page to be ready for interaction
   * Useful after navigation or dynamic content loading
   */
  async waitForPageReady(): Promise<void> {
    await this.registerSubmitButton.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });
  }

  // ============================================
  // FORM FILLING METHODS
  // ============================================

  /**
   * Fills the first name field
   * @param firstName - First name to enter
   */
  async fillFirstName(firstName: string): Promise<void> {
    await this.firstNameInput.clear();
    await this.firstNameInput.fill(firstName);
  }

  /**
   * Fills the last name field
   * @param lastName - Last name to enter
   */
  async fillLastName(lastName: string): Promise<void> {
    await this.lastNameInput.clear();
    await this.lastNameInput.fill(lastName);
  }

  /**
   * Fills the username field
   * @param username - Username to enter
   */
  async fillUsername(username: string): Promise<void> {
    await this.usernameInput.clear();
    await this.usernameInput.fill(username);
    // Trigger blur event to activate validation
    await this.usernameInput.blur();
  }

  /**
   * Fills the password field
   * @param password - Password to enter
   */
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.clear();
    await this.passwordInput.fill(password);
  }

  /**
   * Fills the confirm password field
   * @param password - Password to confirm
   */
  async fillConfirmPassword(password: string): Promise<void> {
    await this.confirmPasswordInput.clear();
    await this.confirmPasswordInput.fill(password);
  }

  /**
   * Selects gender by clicking the appropriate radio button
   * @param gender - 'Male' or 'Female'
   */
  async selectGender(gender: 'Male' | 'Female'): Promise<void> {
    await this.genderRadio(gender).click();
  }

  // ============================================
  // HIGH-LEVEL ACTION METHODS
  // ============================================

  /**
   * Performs complete registration flow with all fields filled
   * This is the main method for TC-001: Successful Registration
   * 
   * @param user - TestUser object with all registration data
   * 
   * @example
   * ```typescript
   * const user = generateTestUser();
   * await registerPage.goto();
   * await registerPage.registerUser(user);
   * await registerPage.verifyRegistrationSuccess();
   * ```
   */
  async registerUser(user: TestUser): Promise<void> {
    await this.fillFirstName(user.firstName);
    await this.fillLastName(user.lastName);
    await this.fillUsername(user.username);
    await this.fillPassword(user.password);
    await this.fillConfirmPassword(user.password);
    await this.selectGender(user.gender);
    
    await this.clickRegister();
  }

  /**
   * Performs registration WITHOUT selecting gender
   * Useful for TC-003: Testing missing gender validation
   * 
   * @param user - TestUser object
   */
  async registerUserWithoutGender(user: TestUser): Promise<void> {
    await this.fillFirstName(user.firstName);
    await this.fillLastName(user.lastName);
    await this.fillUsername(user.username);
    await this.fillPassword(user.password);
    await this.fillConfirmPassword(user.password);
    // Intentionally skip gender selection
    
    await this.clickRegister();
  }

  /**
   * Performs partial registration with only username
   * Useful for testing username validation in isolation
   * Used in TC-002: Duplicate Username validation
   * 
   * @param username - Username to test
   * @param password - Password to use (default: 'Test@123')
   */
  async registerWithUsername(username: string, password: string = 'Test@123'): Promise<void> {
    await this.fillFirstName('Test');
    await this.fillLastName('User');
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.fillConfirmPassword(password);
    await this.selectGender('Male');
    
    await this.clickRegister();
  }

  /**
   * Clicks the Register button and waits for response
   * Separated into its own method for better test control
   */
  async clickRegister(): Promise<void> {
    await this.registerSubmitButton.click();
    await this.waitForLoader();
  }

  /**
   * Clicks the Login link to navigate to login page
   */
  async clickLoginLink(): Promise<void> {
    await this.loginLink.click();
    await this.waitForLoader();
  }

  // ============================================
  // VALIDATION AND VERIFICATION METHODS
  // ============================================

  /**
   * Verifies that registration was successful
   * Checks for:
   * - Logout button is visible (user is logged in)
   * - URL changed from /register
   * - Username appears in the navbar
   * 
   * Used in TC-001
   */
  async verifyRegistrationSuccess(username?: string): Promise<void> {
    // Wait for navigation away from register page
    await this.page.waitForURL((url) => !url.pathname.includes('/register'), {
      timeout: TIMEOUTS.MEDIUM,
    });

    // Verify logout button appears (indicates user is logged in)
    await expect(this.logoutButton).toBeVisible({ timeout: TIMEOUTS.MEDIUM });

    // If username provided, verify it appears in navbar
    if (username) {
      const usernameDisplay = this.page.locator(`text=${username}`);
      await expect(usernameDisplay).toBeVisible();
    }
  }

  /**
   * Verifies that username validation error is shown
   * Used in TC-002: Duplicate Username test
   * 
   * @param expectedMessage - Expected error message
   */
  async verifyUsernameError(expectedMessage: string = ERROR_MESSAGES.USERNAME_NOT_AVAILABLE): Promise<void> {
    // Wait for error to appear
    await expect(this.usernameError).toBeVisible({ timeout: TIMEOUTS.SHORT });
    
    // Verify error message text
    await expect(this.usernameError).toContainText(expectedMessage);
    
    // Verify username field has error styling (red border)
    await expect(this.usernameInput).toHaveClass(/mat-form-field-invalid|ng-invalid/);
  }

  /**
   * Verifies that registration failed and user remains on register page
   * Used in negative test cases like TC-003
   */
  async verifyRegistrationFailed(): Promise<void> {
    // Should still be on register page
    await expect(this.page).toHaveURL(/.*register/);
    
    // Register button should still be visible
    await expect(this.registerSubmitButton).toBeVisible();
    
    // Logout button should NOT be visible
    await expect(this.logoutButton).not.toBeVisible();
  }

  /**
   * Checks if username field has an error state
   * Returns true if error is present, false otherwise
   * 
   * This is useful for soft assertions or conditional logic
   */
  async hasUsernameError(): Promise<boolean> {
    try {
      await this.usernameError.waitFor({ state: 'visible', timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Verifies that no error messages are displayed
   * Useful for positive test cases
   */
  async verifyNoErrors(): Promise<void> {
    // Check that no mat-error elements are visible
    const errorCount = await this.formErrors.count();
    expect(errorCount).toBe(0);
  }

  /**
   * Gets the current value of the username input
   * Useful for verification after filling
   */
  async getUsernameValue(): Promise<string> {
    return await this.usernameInput.inputValue();
  }

  /**
   * Verifies that the username input field has a red border/error state
   * This is visual validation that complements error message validation
   * 
   * Used in TC-002 to verify visual feedback for duplicate username
   */
  async verifyUsernameFieldHasErrorStyling(): Promise<void> {
    // Material UI adds 'ng-invalid' or specific error classes
    const classList = await this.usernameInput.getAttribute('class');
    expect(classList).toMatch(/ng-invalid|mat-form-field-invalid/);
  }

  // ============================================
  // STATE CHECK METHODS
  // ============================================

  /**
   * Checks if the Register button is enabled
   * Useful for validating form validation logic
   * 
   * @returns true if button is enabled, false if disabled
   */
  async isRegisterButtonEnabled(): Promise<boolean> {
    return await this.registerSubmitButton.isEnabled();
  }

  /**
   * Checks if gender is selected
   * 
   * @returns true if any gender radio button is checked
   */
  async isGenderSelected(): Promise<boolean> {
    const maleChecked = await this.maleRadio.isChecked();
    const femaleChecked = await this.femaleRadio.isChecked();
    return maleChecked || femaleChecked;
  }

  /**
   * Gets which gender is currently selected
   * 
   * @returns 'Male', 'Female', or null if none selected
   */
  async getSelectedGender(): Promise<'Male' | 'Female' | null> {
    if (await this.maleRadio.isChecked()) return 'Male';
    if (await this.femaleRadio.isChecked()) return 'Female';
    return null;
  }

  // ============================================
  // HELPER METHODS FOR SPECIFIC TEST CASES
  // ============================================

  /**
   * TC-001: Complete happy path registration
   * This method combines all steps needed for a successful registration test
   */
  async performSuccessfulRegistration(user: TestUser): Promise<void> {
    await this.goto();
    await this.registerUser(user);
    await this.verifyRegistrationSuccess(user.username);
  }

  /**
   * TC-002: Test duplicate username scenario
   * Assumes a user with the given username already exists
   */
  async testDuplicateUsername(existingUsername: string): Promise<void> {
    const testUser: TestUser = {
      firstName: 'Test',
      lastName: 'User',
      username: existingUsername,
      email: `${existingUsername}@test.com`,
      password: 'Test@123',
      gender: 'Male',
    };

    await this.goto();
    await this.registerUser(testUser);
    await this.verifyUsernameError();
    await this.verifyUsernameFieldHasErrorStyling();
    await this.verifyRegistrationFailed();
  }

  /**
   * TC-003: Test registration without gender selection
   * Documents defect where no error is shown
   */
  async testRegistrationWithoutGender(user: TestUser): Promise<void> {
    await this.goto();
    await this.registerUserWithoutGender(user);
    
    // According to TC-003, this SHOULD show an error but doesn't (defect)
    // Test will document this behavior
    await this.verifyRegistrationFailed();
  }
}