import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { ROUTES } from '@utils/constants';
import { TestUser } from '@utils/data-generator';

/**
 * RegisterPage - Handles all interactions within the User Registration screen.
 * Extends BasePage to leverage common navigation and loading utilities.
 */
export class RegisterPage extends BasePage {
  // Form input locators
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  
  // Selection locators
  readonly genderRadio: (gender: string) => Locator;
  readonly registerSubmitButton: Locator;

  constructor(page: Page) {
    super(page);
    // Selectors using Material UI form control names
    this.firstNameInput = page.locator('input[formcontrolname="firstname"]');
    this.lastNameInput = page.locator('input[formcontrolname="lastname"]');
    this.usernameInput = page.locator('input[formcontrolname="username"]');
    this.passwordInput = page.locator('input[formcontrolname="password"]');
    this.confirmPasswordInput = page.locator('input[formcontrolname="confirmPassword"]');
    
    // Dynamic locator for gender radio buttons
    this.genderRadio = (gender: string) => page.locator(`mat-radio-button[value="${gender}"]`);
    
    // Register action button
    this.registerSubmitButton = page.locator('mat-card-actions button').filter({ hasText: 'Register' });
  }

  /**
   * Navigates directly to the registration page
   */
  async goto() {
    await this.navigateTo(ROUTES.REGISTER);
    await this.waitForLoader();
  }

  /**
   * Performs the complete registration flow using a TestUser object
   * @param user Object containing all necessary user registration data
   */
  async registerUser(user: TestUser) {
    await this.firstNameInput.fill(user.firstName);
    await this.lastNameInput.fill(user.lastName);
    await this.usernameInput.fill(user.username);
    await this.passwordInput.fill(user.password);
    await this.confirmPasswordInput.fill(user.password);
    
    // Select gender (Male/Female)
    await this.genderRadio(user.gender).click();
    
    // Click register and wait for potential redirection or loader
    await this.registerSubmitButton.click();
    await this.waitForLoader();
  }
}