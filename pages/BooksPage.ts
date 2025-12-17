import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { ROUTES, TIMEOUTS } from '@utils/constants';

/**
 * BooksPage - Page Object for Books Listing and Filtering
 * 
 * This page handles the main books catalog including:
 * - Book search functionality
 * - Category filtering
 * - Price range filtering
 * - Add to cart actions
 * - Book display and grid
 * 
 * IMPORTANT NOTES ON KNOWN DEFECTS:
 * - TC-006: Books are not displayed (API returns 500 error)
 * - TC-007: Price slider is not functional
 * - These defects are documented and tests will fail as expected
 * 
 * Test cases using this page:
 * - TC-004: Search and Filter Books by Category
 * - TC-006: Verify Books Displayed (Critical Defect)
 * - TC-007: Price Filter Slider Functionality (Defect)
 */
export class BooksPage extends BasePage {
  // ============================================
  // ELEMENT LOCATORS - FILTERS
  // ============================================
  
  // Category filter in left sidebar
  readonly categoryList: Locator;
  readonly categoryFilterTitle: Locator;
  readonly allCategoriesOption: Locator;
  
  // Price filter slider
  readonly priceFilterContainer: Locator;
  readonly priceSlider: Locator;
  readonly priceSliderHandle: Locator;
  readonly priceSliderLabel: Locator;
  readonly minPriceLabel: Locator;
  readonly maxPriceLabel: Locator;
  
  // ============================================
  // ELEMENT LOCATORS - SEARCH
  // ============================================
  
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly searchClearButton: Locator;
  readonly searchSuggestions: Locator;
  
  // ============================================
  // ELEMENT LOCATORS - BOOKS DISPLAY
  // ============================================
  
  // Book cards/items in the grid
  readonly bookCards: Locator;
  readonly bookTitles: Locator;
  readonly bookAuthors: Locator;
  readonly bookPrices: Locator;
  readonly bookCategories: Locator;
  
  // "No books found" message (appears due to TC-006 defect)
  readonly noBooksMessage: Locator;
  readonly emptyStateMessage: Locator;
  
  // Book actions
  readonly addToCartButtons: Locator;
  readonly addToWishlistButtons: Locator;
  
  // Book count/pagination
  readonly booksCountLabel: Locator;
  readonly paginationControls: Locator;
  
  // ============================================
  // ELEMENT LOCATORS - CART
  // ============================================
  
  readonly cartIcon: Locator;
  readonly cartBadge: Locator;
  readonly cartCount: Locator;

  constructor(page: Page) {
    super(page);
    
    // Category filter elements
    this.categoryList = page.locator('mat-list-item');
    this.categoryFilterTitle = page.locator('mat-card-title:has-text("Filter by Category")');
    this.allCategoriesOption = page.locator('mat-list-item:has-text("All Categories")');
    
    // Price filter elements
    this.priceFilterContainer = page.locator('mat-card').filter({ hasText: 'Price' });
    this.priceSlider = page.locator('mat-slider');
    this.priceSliderHandle = page.locator('.mat-slider-thumb, input[type="range"]');
    this.priceSliderLabel = page.locator('.mat-slider-thumb-label');
    this.minPriceLabel = page.locator('.price-min, .min-price');
    this.maxPriceLabel = page.locator('.price-max, .max-price');
    
    // Search elements
    this.searchInput = page.locator('input[type="search"], input[placeholder*="Search"]');
    this.searchButton = page.locator('button[aria-label="Search"], button:has(mat-icon:text("search"))');
    this.searchClearButton = page.locator('button[aria-label="Clear"], button:has(mat-icon:text("clear"))');
    this.searchSuggestions = page.locator('mat-option, .search-suggestion');
    
    // Book display elements
    this.bookCards = page.locator('app-book-card, .book-card, mat-card').filter({ has: page.locator('img') });
    this.bookTitles = page.locator('.book-title, mat-card-title');
    this.bookAuthors = page.locator('.book-author, .author-name');
    this.bookPrices = page.locator('.book-price, .price');
    this.bookCategories = page.locator('.book-category, .category');
    
    // Empty state (appears when no books found - TC-006 defect)
    this.noBooksMessage = page.locator('mat-card-content, .empty-state').filter({ hasText: /No books found|no results/i });
    this.emptyStateMessage = page.locator('.empty-state, .no-results');
    
    // Book action buttons
    this.addToCartButtons = page.locator('button').filter({ hasText: /Add to Cart|Add/i });
    this.addToWishlistButtons = page.locator('button').filter({ hasText: /Wishlist|Favorite/i });
    
    // Book count and pagination
    this.booksCountLabel = page.locator('.books-count, .result-count');
    this.paginationControls = page.locator('mat-paginator, .pagination');
    
    // Cart icon in navbar
    this.cartIcon = page.locator('mat-icon:has-text("shopping_cart")');
    this.cartBadge = page.locator('.mat-badge-content, .cart-badge');
    this.cartCount = page.locator('.cart-count');
  }

  // ============================================
  // NAVIGATION METHODS
  // ============================================

  /**
   * Navigates to the books listing page
   * Waits for page to load and initial content to render
   */
  async goto(): Promise<void> {
    await this.navigateTo(ROUTES.BOOKS);
    await this.waitForLoader();
    await this.waitForPageReady();
  }

  /**
   * Waits for the books page to be ready for interaction
   * Given TC-006 defect (no books display), we check for either:
   * - Books are displayed, OR
   * - "No books found" message appears
   */
  async waitForPageReady(): Promise<void> {
    // Wait for either books to load OR empty state message to appear
    await Promise.race([
      this.bookCards.first().waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM }).catch(() => {}),
      this.noBooksMessage.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM }).catch(() => {}),
    ]);
  }

  // ============================================
  // SEARCH METHODS
  // ============================================

  /**
   * Performs a search for books by title or author
   * 
   * Note: Due to TC-006 defect, this will likely return no results
   * regardless of search term because books aren't loading from the API
   * 
   * @param searchTerm - Text to search for
   * 
   * @example
   * ```typescript
   * await booksPage.goto();
   * await booksPage.searchBook('Harry Potter');
   * // Due to defect, this will show "No books found"
   * ```
   */
  async searchBook(searchTerm: string): Promise<void> {
    await this.searchInput.clear();
    await this.searchInput.fill(searchTerm);
    
    // BookCart requires pressing Enter to trigger search
    // Some apps use a search button, some use Enter key
    await this.page.keyboard.press('Enter');
    
    // Wait for search results to load
    await this.waitForLoader();
    await this.waitForPageReady();
  }

  /**
   * Clicks the search button (if available)
   * Some implementations have a button instead of/in addition to Enter key
   */
  async clickSearchButton(): Promise<void> {
    if (await this.searchButton.isVisible()) {
      await this.searchButton.click();
      await this.waitForLoader();
    }
  }

  /**
   * Clears the search input and resets results
   */
  async clearSearch(): Promise<void> {
    // Try clicking clear button if available
    if (await this.searchClearButton.isVisible()) {
      await this.searchClearButton.click();
    } else {
      // Otherwise, clear the input and press Enter
      await this.searchInput.clear();
      await this.page.keyboard.press('Enter');
    }
    
    await this.waitForLoader();
    await this.waitForPageReady();
  }

  /**
   * Gets the current value in the search input
   */
  async getSearchValue(): Promise<string> {
    return await this.searchInput.inputValue();
  }

  // ============================================
  // CATEGORY FILTER METHODS
  // ============================================

  /**
   * Selects a specific category from the filter list
   * 
   * Note: Due to TC-006 defect, category filtering won't show books
   * because the underlying API is returning 500 error
   * 
   * @param categoryName - Name of the category to select
   * 
   * @example
   * ```typescript
   * await booksPage.selectCategory('Fantasy');
   * // Due to defect, this will still show "No books found"
   * ```
   */
  async selectCategory(categoryName: string): Promise<void> {
    const categoryItem = this.categoryList.filter({ hasText: categoryName });
    await categoryItem.click();
    await this.waitForLoader();
    await this.waitForPageReady();
  }

  /**
   * Selects "All Categories" to reset category filter
   */
  async selectAllCategories(): Promise<void> {
    await this.allCategoriesOption.click();
    await this.waitForLoader();
    await this.waitForPageReady();
  }

  /**
   * Gets list of all available category names
   * Useful for data-driven testing
   */
  async getAvailableCategories(): Promise<string[]> {
    const categories: string[] = [];
    const count = await this.categoryList.count();
    
    for (let i = 0; i < count; i++) {
      const text = await this.categoryList.nth(i).textContent();
      if (text) {
        categories.push(text.trim());
      }
    }
    
    return categories;
  }

  /**
   * Verifies that expected categories are present
   * @param expectedCategories - Array of category names to verify
   */
  async verifyCategoriesPresent(expectedCategories: string[]): Promise<void> {
    for (const category of expectedCategories) {
      const categoryItem = this.categoryList.filter({ hasText: category });
      await expect(categoryItem).toBeVisible({ timeout: TIMEOUTS.SHORT });
    }
  }

  // ============================================
  // PRICE FILTER METHODS (TC-007 DEFECT)
  // ============================================

  /**
   * Attempts to adjust the price slider
   * 
   * IMPORTANT: This documents TC-007 defect where the slider is not functional
   * The slider displays erratic values and is not draggable
   * 
   * This method attempts various approaches to interact with the slider:
   * 1. Direct click on slider
   * 2. Drag slider handle
   * 3. Keyboard interaction
   * 
   * @param targetValue - Desired price value (likely won't work due to bug)
   */
  async adjustPriceSlider(targetValue: number): Promise<void> {
    // Attempt 1: Try clicking on the slider track
    try {
      const sliderBoundingBox = await this.priceSlider.boundingBox();
      if (sliderBoundingBox) {
        // Click at a position proportional to the target value
        // Assuming slider goes from 0 to 1000
        const percentage = targetValue / 1000;
        const xPosition = sliderBoundingBox.width * percentage;
        
        await this.priceSlider.click({
          position: { x: xPosition, y: sliderBoundingBox.height / 2 }
        });
        
        await this.waitForLoader();
      }
    } catch (error) {
      console.log('Could not interact with price slider via click:', error);
    }

    // Attempt 2: Try dragging the slider handle
    try {
      if (await this.priceSliderHandle.isVisible()) {
        const handle = this.priceSliderHandle;
        const boundingBox = await handle.boundingBox();
        
        if (boundingBox) {
          await handle.hover();
          await this.page.mouse.down();
          await this.page.mouse.move(boundingBox.x + 100, boundingBox.y);
          await this.page.mouse.up();
          
          await this.waitForLoader();
        }
      }
    } catch (error) {
      console.log('Could not interact with price slider via drag:', error);
    }

    // Attempt 3: If slider is an input[type="range"], try setting value directly
    try {
      const rangeInput = this.page.locator('input[type="range"]');
      if (await rangeInput.count() > 0) {
        await rangeInput.fill(targetValue.toString());
        await this.waitForLoader();
      }
    } catch (error) {
      console.log('Could not set slider value directly:', error);
    }
  }

  /**
   * Gets the current value displayed by the price slider
   * Due to TC-007 defect, this may return erratic values like 100, then 0
   */
  async getPriceSliderValue(): Promise<string | null> {
    try {
      if (await this.priceSliderLabel.isVisible()) {
        return await this.priceSliderLabel.textContent();
      }
      
      // Try getting value from input if label not available
      const rangeInput = this.page.locator('input[type="range"]');
      if (await rangeInput.count() > 0) {
        return await rangeInput.inputValue();
      }
      
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Verifies that price slider is visible
   * Even though it's broken, it should at least be displayed
   */
  async verifyPriceSliderVisible(): Promise<void> {
    await expect(this.priceFilterContainer).toBeVisible();
  }

  // ============================================
  // BOOKS DISPLAY METHODS
  // ============================================

  /**
   * Gets the count of books currently displayed
   * Due to TC-006 defect, this will return 0
   */
  async getBooksCount(): Promise<number> {
    return await this.bookCards.count();
  }

  /**
   * Verifies that books are displayed
   * This will FAIL due to TC-006 defect (no books load from API)
   */
  async verifyBooksAreDisplayed(): Promise<void> {
    const count = await this.getBooksCount();
    expect(count).toBeGreaterThan(0);
  }

  /**
   * Verifies that "No books found" message is displayed
   * This documents TC-006 defect - message appears even though books should exist
   */
  async verifyNoBooksMessage(): Promise<void> {
    await expect(this.noBooksMessage).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
  }

  /**
   * Checks if "No books found" message is displayed
   * Non-throwing version for conditional logic
   */
  async hasNoBooksMessage(): Promise<boolean> {
    try {
      await this.noBooksMessage.waitFor({ state: 'visible', timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets titles of all displayed books
   * Will return empty array due to TC-006 defect
   */
  async getBookTitles(): Promise<string[]> {
    const titles: string[] = [];
    const count = await this.bookTitles.count();
    
    for (let i = 0; i < count; i++) {
      const text = await this.bookTitles.nth(i).textContent();
      if (text) {
        titles.push(text.trim());
      }
    }
    
    return titles;
  }

  /**
   * Searches for a specific book by title and returns if found
   * @param title - Book title to search for
   * @returns true if book card with that title exists
   */
  async isBookDisplayed(title: string): Promise<boolean> {
    const bookCard = this.bookCards.filter({ hasText: title });
    return await bookCard.count() > 0;
  }

  // ============================================
  // ADD TO CART METHODS
  // ============================================

  /**
   * Adds a book to cart by its title
   * 
   * Note: Due to TC-006 defect (no books display), this will fail
   * because there are no "Add to Cart" buttons visible
   * 
   * @param bookTitle - Title of the book to add
   */
  async addBookToCartByTitle(bookTitle: string): Promise<void> {
    const bookCard = this.bookCards.filter({ hasText: bookTitle });
    const addButton = bookCard.locator('button').filter({ hasText: /Add to Cart|Add/i });
    
    await addButton.click();
    await this.waitForLoader();
  }

  /**
   * Adds the first available book to cart
   * Useful when you don't care which specific book, just need something in cart
   */
  async addFirstBookToCart(): Promise<void> {
    const firstAddButton = this.addToCartButtons.first();
    await firstAddButton.click();
    await this.waitForLoader();
  }

  /**
   * Verifies that "Add to Cart" buttons are visible
   * Will FAIL due to TC-006 defect (no books means no buttons)
   */
  async verifyAddToCartButtonsVisible(): Promise<void> {
    const count = await this.addToCartButtons.count();
    expect(count).toBeGreaterThan(0);
  }

  // ============================================
  // CART BADGE METHODS
  // ============================================

  /**
   * Gets the current cart count from the cart badge
   * @returns Number of items in cart, or 0 if badge not visible
   */
  async getCartCount(): Promise<number> {
    try {
      if (await this.cartBadge.isVisible()) {
        const text = await this.cartBadge.textContent();
        return text ? parseInt(text.trim()) : 0;
      }
      return 0;
    } catch {
      return 0;
    }
  }

  /**
   * Verifies cart count matches expected value
   * @param expectedCount - Expected number of items in cart
   */
  async verifyCartCount(expectedCount: number): Promise<void> {
    const actualCount = await this.getCartCount();
    expect(actualCount).toBe(expectedCount);
  }

  /**
   * Clicks the cart icon to navigate to cart page
   */
  async goToCart(): Promise<void> {
    await this.cartIcon.click();
    await this.waitForLoader();
  }

  // ============================================
  // HELPER METHODS FOR SPECIFIC TEST CASES
  // ============================================

  /**
   * TC-004: Test search and category filter
   * Combines search and category filtering to document expected vs actual behavior
   */
  async testSearchAndFilter(searchTerm: string, category: string): Promise<void> {
    // Test search
    await this.searchBook(searchTerm);
    const hasBooks = await this.getBooksCount() > 0;
    
    if (!hasBooks) {
      console.log(`DEFECT: Search for "${searchTerm}" returned no books (TC-006 related)`);
      await this.verifyNoBooksMessage();
    }
    
    // Clear search
    await this.clearSearch();
    
    // Test category filter
    await this.selectCategory(category);
    const hasBooksAfterFilter = await this.getBooksCount() > 0;
    
    if (!hasBooksAfterFilter) {
      console.log(`DEFECT: Category "${category}" shows no books (TC-006 related)`);
      await this.verifyNoBooksMessage();
    }
  }

  /**
   * TC-006: Document the critical defect where no books are displayed
   * This method performs comprehensive checks to document the issue
   */
  async documentNoBooksDefect(): Promise<void> {
    await this.goto();
    
    // Check if books are displayed
    const booksCount = await this.getBooksCount();
    console.log(`Books displayed: ${booksCount}`);
    
    // Check if "No books found" message appears
    const hasNoBookstMessage = await this.hasNoBooksMessage();
    console.log(`"No books found" message displayed: ${hasNoBookstMessage}`);
    
    // Try different categories
    const categories = await this.getAvailableCategories();
    console.log(`Available categories: ${categories.join(', ')}`);
    
    for (const category of categories.slice(0, 3)) {
      await this.selectCategory(category);
      const count = await this.getBooksCount();
      console.log(`Books in ${category}: ${count}`);
    }
    
    // Document that core functionality is broken
    await this.verifyNoBooksMessage();
  }

  /**
   * TC-007: Document the price slider defect
   * Attempts to use the slider and documents the erratic behavior
   */
  async documentPriceSliderDefect(): Promise<void> {
    await this.goto();
    
    // Verify slider is visible
    await this.verifyPriceSliderVisible();
    
    // Try to get initial value
    const initialValue = await this.getPriceSliderValue();
    console.log(`Initial price slider value: ${initialValue}`);
    
    // Attempt to adjust slider
    await this.adjustPriceSlider(500);
    
    // Check value after adjustment
    const newValue = await this.getPriceSliderValue();
    console.log(`Price slider value after adjustment: ${newValue}`);
    
    // Document that slider doesn't work as expected
    console.log('DEFECT: Price slider is not functional (TC-007)');
  }
}