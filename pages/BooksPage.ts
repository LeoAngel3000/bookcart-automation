import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { ROUTES, TIMEOUTS } from '@utils/constants';

export class BooksPage extends BasePage {
  // Selectors by category and filters
  readonly categoryList: Locator;
  readonly priceSlider: Locator;
  readonly priceSliderHandle: Locator;
  readonly searchInput: Locator;
  readonly searchOptions: Locator;

  // Content selectors
  readonly bookCards: Locator;
  readonly noBooksMessage: Locator;
  readonly addToCartButtons: Locator;

  constructor(page: Page) {
    super(page);
    // filters (Sidebar)
    this.categoryList = page.locator('mat-list-item');
    this.priceSlider = page.locator('mat-slider');
    this.priceSliderHandle = page.locator('.mat-slider-thumb');
    
    // search
    this.searchInput = page.locator('input[type="search"]');
    this.searchOptions = page.locator('mat-option');

    // Books grid
    this.bookCards = page.locator('app-book-card');
    this.noBooksMessage = page.locator('mat-card-content').filter({ hasText: 'No books found' });
    this.addToCartButtons = page.locator('button').filter({ hasText: 'Add to Cart' });
  }

  async goto() {
    await this.navigateTo(ROUTES.BOOKS);
    await this.waitForLoader();
  }

  /**
   * Search a book by title using the search input
   */
  async searchBook(title: string) {
    await this.searchInput.fill(title);
    // BookCart requires pressing Enter to trigger the search
    await this.page.keyboard.press('Enter');
    await this.waitForLoader();
  }

  /**
   * Select a book category from the sidebar
   */
  async selectCategory(category: string) {
    await this.categoryList.filter({ hasText: category }).click();
    await this.waitForLoader();
  }

  /**
   * Method to attempt moving the price slider (Documenting TC-007)
   */
  async adjustPriceSlider(targetValue: number) {
    // Note: The BookCart slider is problematic. We try to move it via bounding box.
    const sliderBoundingBox = await this.priceSlider.boundingBox();
    if (sliderBoundingBox) {
      await this.priceSlider.click({
        position: { x: sliderBoundingBox.width / 2, y: sliderBoundingBox.height / 2 }
      });
    }
  }
}