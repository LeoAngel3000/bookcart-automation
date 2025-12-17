import { test, expect } from '@playwright/test';
import { BookCartAPI } from '@api/BookCartAPI';
import { TEST_TAGS, HTTP_STATUS } from '@utils/constants';

test.describe('Books API Implementation & Defects', () => {
  
  test(`TC-008 - GET /Book should return all books ${TEST_TAGS.API} ${TEST_TAGS.DEFECT}`, async ({ request }) => {
    const bookApi = new BookCartAPI(request);

    // Documenting the defect: The API currently fails with 500 Internal Server Error
    // This is why books are not visible in the UI (TC-006)
    test.fail(true, 'The API endpoint /api/Book is currently returning 500 Error');

    const response = await bookApi.getAllBooks();
    
    // This assertion will fail until the developers fix the API
    expect(response.status()).toBe(HTTP_STATUS.OK);
    
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });
});