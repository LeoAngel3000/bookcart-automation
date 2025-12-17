import { test as base } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import { RegisterPage } from '@pages/RegisterPage';
import { BooksPage } from '@pages/BooksPage';
import { BookCartAPI } from '@api/BookCartAPI';

/**
 * Custom Fixtures
 * This file extends the base Playwright test to include our Page Objects
 * and API clients as injectable dependencies.
 */

// Define the types for our fixtures
type MyFixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  booksPage: BooksPage;
  bookApi: BookCartAPI;
};

// Extend the base test
export const test = base.extend<MyFixtures>({
  // Initialize LoginPage
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  // Initialize RegisterPage
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },

  // Initialize BooksPage
  booksPage: async ({ page }, use) => {
    await use(new BooksPage(page));
  },

  // Initialize API Client
  bookApi: async ({ request }, use) => {
    await use(new BookCartAPI(request));
  },
});

export { expect } from '@playwright/test';