import { Page, Locator, expect } from '@playwright/test';
import { TIMEOUTS, URLS } from '@utils/constants';

/**
 * BasePage - Main parent class for all Page Objects
 * Provides common functionality, shared locators, and helper methods.
 */
export class BasePage {
  readonly page: Page;
  readonly snackbar: Locator;
  readonly spinner: Locator;

  constructor(page: Page) {
    this.page = page;
    // Common elements across the application (Material UI)
    this.snackbar = page.locator('.mat-snack-bar-container');
    this.spinner = page.locator('mat-spinner');
  }

  /**
   * Navigates to a specific path relative to the Base URL
   */
  async navigateTo(path: string = '') {
    await this.page.goto(path);
  }

  /**
   * Waits for the global loading spinner to disappear
   */
  async waitForLoader() {
    if (await this.spinner.isVisible()) {
      await this.spinner.waitFor({ state: 'hidden', timeout: TIMEOUTS.MEDIUM });
    }
  }

  /**
   * Verifies if a snackbar message is displayed with specific text
   */
  async verifySnackbarMessage(message: string) {
    await expect(this.snackbar).toContainText(message, { timeout: TIMEOUTS.MEDIUM });
  }
}