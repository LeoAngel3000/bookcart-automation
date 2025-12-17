import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { ROUTES } from '@utils/constants';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginSubmitButton: Locator;
  readonly registerLink: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('input[formcontrolname="username"]');
    this.passwordInput = page.locator('input[formcontrolname="password"]');
    this.loginSubmitButton = page.locator('mat-card-actions button').filter({ hasText: 'Login' });
    this.registerLink = page.locator('button').filter({ hasText: 'Register' });
  }

  async goto() {
    await this.navigateTo(ROUTES.LOGIN);
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginSubmitButton.click();
    await this.waitForLoader();
  }
}