// We import 'test' from our fixture, not from @playwright/test
import { test, expect } from '@fixtures/test-fixtures';
import { generateTestUser } from '@utils/data-generator';
import { TEST_TAGS, HTTP_STATUS } from '@utils/constants';

test.describe('Refactored Integration Flow', () => {

  test(`TC-009 - Register via API and Login via UI ${TEST_TAGS.INTEGRATION}`, 
  async ({ bookApi, loginPage, page }) => { // <--- Fixtures inyectadas automáticamente
    
    const newUser = generateTestUser('fixt_test');

    // Step 1: API Setup
    const apiResponse = await bookApi.registerUser(newUser);
    expect(apiResponse.status()).toBe(HTTP_STATUS.OK);

    // Step 2: UI Verification
    await loginPage.goto();
    await loginPage.login(newUser.username, newUser.password);

    await expect(page.locator('button:has-text("Logout")')).toBeVisible();
  });
});