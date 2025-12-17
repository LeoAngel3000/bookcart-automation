import { test, expect } from '@playwright/test';
import { BooksPage } from '@pages/BooksPage';
import { TEST_TAGS } from '@utils/constants';

test.describe('Known UI Defects Documentation', () => {
  
  test.beforeEach(async ({ page }) => {
    const booksPage = new BooksPage(page);
    await booksPage.goto();
  });

  test(`TC-006 - Verify Books Displayed (Critical Defect) ${TEST_TAGS.UI} ${TEST_TAGS.DEFECT}`, async ({ page }) => {
    const booksPage = new BooksPage(page);

    // Documenting the defect: The application currently shows "No books found" due to API 500 error
    test.fail(true, 'Application currently shows "No books found" due to API 500 error');

    // There must be at least one book displayed
    const count = await booksPage.bookCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test(`TC-007 - Price Filter Slider Functionality ${TEST_TAGS.UI} ${TEST_TAGS.DEFECT}`, async ({ page }) => {
    const booksPage = new BooksPage(page);

    // Slider is not working as expected, documenting the defect
    await booksPage.adjustPriceSlider(100);
    
    // No books found message is expected due to slider defect
    await expect(booksPage.noBooksMessage).not.toBeVisible();
  });
});