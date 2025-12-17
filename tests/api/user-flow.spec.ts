import { test, expect } from '@playwright/test';
import { BookCartAPI } from '@api/BookCartAPI';
import { LoginPage } from '@pages/LoginPage';
import { generateTestUser } from '@utils/data-generator';
import { TEST_TAGS, HTTP_STATUS } from '@utils/constants';


test.describe('API + UI Integration Flow', () => {

  test(`TC-009 - Register via API and Login via UI ${TEST_TAGS.INTEGRATION}`, async ({ request, page }) => {
    const bookApi = new BookCartAPI(request);
    const loginPage = new LoginPage(page);
    const newUser = generateTestUser('int_test');

    // Step 1: Create user through API (Setup)
    const apiResponse = await bookApi.registerUser(newUser);
    expect(apiResponse.status()).toBe(HTTP_STATUS.OK);

    // Step 2: Verify user can login through the UI
    await loginPage.goto();
    await loginPage.login(newUser.username, newUser.password);

    // Final Verification: User should be logged in
    await expect(page.locator('button:has-text("Logout")')).toBeVisible();
  });
});