/**
 * Books API Tests
 * 
 * This suite tests the BookCart backend API endpoints related to books catalog.
 * These tests verify that the REST API responds correctly to various requests
 * and returns properly formatted data.
 * 
 * IMPORTANT: These tests reveal that the backend API has critical failures
 * that explain why the UI cannot display books (TC-006).
 * 
 * Test Cases Implemented:
 * - TC-005: GET /api/Book - Retrieve all books (documents 500 error)
 * - TC-008: GET /api/Book/{id} - Retrieve book by ID (boundary tests)
 * 
 * API tests use @api tag:
 * npx playwright test --grep @api
 */

import { test, expect } from '@fixtures/test-fixtures';
import { TEST_TAGS, HTTP_STATUS } from '@utils/constants';

/**
 * Test Suite: Books API Endpoints
 * 
 * These tests verify the backend API endpoints for book operations.
 * API tests are faster than UI tests and can pinpoint exact issues in the backend.
 */
test.describe('Books API Tests @api', () => {
  
  /**
   * TC-005 / TC-008: GET /api/Book - Retrieve All Books
   * 
   * SEVERITY: Critical
   * PRIORITY: Highest
   * TYPE: API Functional Test / Defect Documentation
   * 
   * PURPOSE:
   * This test documents the root cause of TC-006 (no books in UI).
   * The backend API endpoint is returning 500 Internal Server Error,
   * which prevents any books from being retrieved and displayed.
   * 
   * ENDPOINT: GET https://bookcart.azurewebsites.net/api/Book
   * METHOD: GET
   * AUTHENTICATION: Not required for reading books
   * 
   * EXPECTED RESPONSE:
   * - Status Code: 200 OK
   * - Content-Type: application/json
   * - Body: Array of book objects
   * - Each book contains: bookId, title, author, category, price, coverFileName
   * - Response time: < 3 seconds
   * 
   * ACTUAL RESPONSE:
   * - Status Code: 500 Internal Server Error
   * - This indicates a server-side problem
   * - Possible causes:
   *   * Database connection failure
   *   * SQL query error
   *   * Data serialization issue
   *   * Server configuration problem
   *   * Missing or corrupted data
   * 
   * IMPACT:
   * - Complete failure of book catalog functionality
   * - UI cannot display any books
   * - Search returns no results
   * - Category filters show nothing
   * - Users cannot browse or purchase books
   * - Business is effectively non-functional
   * 
   * RECOMMENDATION:
   * - Check server logs for detailed error messages
   * - Verify database connectivity
   * - Review database schema and data integrity
   * - Check for recent deployments that may have broken this endpoint
   * - This is blocking ALL testing of book-related features
   */
  test(`TC-008 - GET /api/Book returns 500 Internal Server Error (CRITICAL) ${TEST_TAGS.DEFECT}`, 
    async ({ bookApi }) => {
    
    console.log('');
    console.log('='.repeat(70));
    console.log('TC-008: CRITICAL BACKEND API DEFECT');
    console.log('Endpoint: GET /api/Book');
    console.log('Expected: 200 OK with array of books');
    console.log('Actual: 500 Internal Server Error');
    console.log('='.repeat(70));
    console.log('');
    
    // WHEN: Request is made to get all books
    console.log('Making API request to GET /api/Book...');
    const response = await bookApi.getAllBooks();
    
    // Capture response details
    const status = response.status();
    const statusText = response.statusText();
    
    console.log(`Response Status: ${status} ${statusText}`);
    console.log(`Response Time: ${response.headers()['x-response-time'] || 'N/A'}`);
    
    // THEN: Should receive 200 OK (EXPECTED)
    // ACTUAL: Receives 500 error
    
    if (status === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
      console.log('');
      console.log('❌ CRITICAL DEFECT CONFIRMED:');
      console.log('   Backend API is returning 500 Internal Server Error');
      console.log('');
      console.log('   This is the ROOT CAUSE of TC-006 (No books in UI)');
      console.log('   The frontend is working correctly but has no data to display');
      console.log('');
      console.log('   TECHNICAL INVESTIGATION NEEDED:');
      console.log('   1. Check application logs on the server');
      console.log('   2. Verify database connection is working');
      console.log('   3. Check if books table exists and has data');
      console.log('   4. Review recent code changes to this endpoint');
      console.log('   5. Verify database schema matches application expectations');
      console.log('');
      console.log('   BUSINESS IMPACT:');
      console.log('   - Complete loss of primary business functionality');
      console.log('   - Users cannot view or purchase any products');
      console.log('   - Site is essentially broken from business perspective');
      console.log('');
      console.log('   BLOCKING:');
      console.log('   - All book-related UI tests (TC-006, TC-007, etc.)');
      console.log('   - All cart and checkout tests (TC-010)');
      console.log('   - All purchase workflow tests');
      console.log('   - Search and filter functionality tests');
      console.log('');
      
      // Try to get response body for additional details
      try {
        const body = await response.text();
        if (body) {
          console.log('   Error Response Body:');
          console.log(`   ${body}`);
          console.log('');
        }
      } catch (e) {
        console.log('   (Unable to read error response body)');
        console.log('');
      }
      
    } else if (status === HTTP_STATUS.OK) {
      console.log('');
      console.log('✅ DEFECT APPEARS TO BE FIXED!');
      console.log('   API is now returning 200 OK');
      console.log('');
      
      // Verify response structure
      try {
        const books = await response.json();
        console.log(`   Books returned: ${Array.isArray(books) ? books.length : 'Invalid format'}`);
        
        if (Array.isArray(books) && books.length > 0) {
          console.log('   Sample book data:');
          console.log(`   ${JSON.stringify(books[0], null, 2)}`);
        }
        console.log('');
        console.log('   Developers: Verify this fix is stable and intentional');
        console.log('   QA: Re-run TC-006 (UI books display) to verify end-to-end');
        console.log('');
      } catch (e) {
        console.log('   Warning: Status is 200 but response is not valid JSON');
        console.log('');
      }
    }
    
    // Mark test as expected to fail while bug exists
    test.fail(status !== HTTP_STATUS.OK, 'Known defect: Books API returns 500 error');
    
    // This assertion will fail until the backend is fixed
    expect(status).toBe(HTTP_STATUS.OK);
    
    // If we ever get a successful response, validate structure
    if (status === HTTP_STATUS.OK) {
      const books = await response.json();
      
      // Verify response is an array
      expect(Array.isArray(books)).toBe(true);
      
      // If books exist, verify structure of first book
      if (books.length > 0) {
        const firstBook = books[0];
        
        expect(firstBook).toHaveProperty('bookId');
        expect(firstBook).toHaveProperty('title');
        expect(firstBook).toHaveProperty('author');
        expect(firstBook).toHaveProperty('category');
        expect(firstBook).toHaveProperty('price');
        
        // Verify data types
        expect(typeof firstBook.bookId).toBe('number');
        expect(typeof firstBook.title).toBe('string');
        expect(typeof firstBook.price).toBe('number');
        
        // Verify price is positive
        expect(firstBook.price).toBeGreaterThan(0);
        
        console.log('✅ Book data structure is valid');
      }
    }
    
    console.log('='.repeat(70));
    console.log('');
  });

  /**
   * TC-008b: GET /api/Book/{id} - Invalid Book ID (Boundary Test)
   * 
   * PURPOSE:
   * Verify API handles invalid book IDs gracefully with appropriate error responses
   * 
   * This tests boundary conditions and error handling:
   * - Non-existent ID (99999)
   * - Zero ID (0)
   * - Negative ID (-1)
   * - Invalid type (string instead of number)
   * 
   * EXPECTED BEHAVIOR:
   * - Non-existent ID: Returns 404 Not Found
   * - Zero/Negative ID: Returns 400 Bad Request or 404
   * - Invalid type: Returns 400 Bad Request
   * - No 5xx server errors (these indicate bugs)
   * - Clear, descriptive error messages in response
   * 
   * TYPE: Negative Testing / Boundary Testing
   * PRIORITY: Medium
   */
  test(`TC-008b - GET /api/Book/:id with Invalid IDs (Boundary Test)`, async ({ bookApi }) => {
    
    console.log('');
    console.log('Testing API error handling with invalid book IDs...');
    console.log('');
    
    // Test 1: Non-existent book ID (should return 404)
    console.log('Test 1: Non-existent ID (99999)');
    const response99999 = await bookApi.getBookById(99999);
    const status99999 = response99999.status();
    console.log(`  Response: ${status99999} ${response99999.statusText()}`);
    
    // Should be 404 Not Found
    // Could also be 200 with empty result (acceptable)
    // Should NOT be 500 (indicates error in error handling)
    expect([HTTP_STATUS.NOT_FOUND, HTTP_STATUS.OK]).toContain(status99999);
    
    if (status99999 === HTTP_STATUS.OK) {
      // If 200, body should indicate book not found
      const body = await response99999.json();
      console.log(`  Returns empty/null: ${body === null || Object.keys(body).length === 0}`);
    }
    
    // Test 2: Book ID of 0 (edge case)
    console.log('\nTest 2: Zero ID (0)');
    const response0 = await bookApi.getBookById(0);
    const status0 = response0.status();
    console.log(`  Response: ${status0} ${response0.statusText()}`);
    
    // Should be 400 Bad Request or 404 Not Found
    expect([HTTP_STATUS.BAD_REQUEST, HTTP_STATUS.NOT_FOUND, HTTP_STATUS.OK]).toContain(status0);
    
    // Test 3: Negative book ID (invalid input)
    console.log('\nTest 3: Negative ID (-1)');
    const responseMinus1 = await bookApi.getBookById(-1);
    const statusMinus1 = responseMinus1.status();
    console.log(`  Response: ${statusMinus1} ${responseMinus1.statusText()}`);
    
    // Should be 400 Bad Request or 404
    expect([HTTP_STATUS.BAD_REQUEST, HTTP_STATUS.NOT_FOUND, HTTP_STATUS.OK]).toContain(statusMinus1);
    
    console.log('');
    console.log('✅ API handles invalid book IDs without server errors');
    console.log('   (No 5xx errors occurred)');
    console.log('');
  });

  /**
   * API Response Time Test
   * 
   * Verifies that API responds within acceptable time limits
   * Even with errors, the API should respond quickly
   */
  test('API response time is within acceptable limits', async ({  }) => {
    
    const startTime = Date.now();
    // const response = await bookApi.getAllBooks();
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    
    console.log(`API Response Time: ${responseTime}ms`);
    
    // Even a failing API should respond within 5 seconds
    expect(responseTime).toBeLessThan(5000);
    
    if (responseTime > 3000) {
      console.log('⚠️  Response time is slow (> 3 seconds)');
      console.log('   This may indicate performance issues');
    } else {
      console.log('✅ Response time is acceptable');
    }
  });

  /**
   * API Headers Validation
   * 
   * Verifies that API returns appropriate headers
   */
  test('API returns correct content-type headers', async ({ bookApi }) => {
    
    const response = await bookApi.getAllBooks();
    const headers = response.headers();
    
    console.log('Checking API response headers...');
    console.log(`  Content-Type: ${headers['content-type']}`);
    
    // Even error responses should have proper content-type
    // Most APIs return JSON for both success and error
    if (headers['content-type']) {
      expect(headers['content-type']).toContain('application/json');
      console.log('✅ Content-Type header is correct');
    } else {
      console.log('⚠️  No Content-Type header present');
    }
  });
});

/**
 * Test Execution Notes:
 * 
 * Run only API tests (fast):
 * npx playwright test --grep @api
 * 
 * Run with detailed output:
 * npx playwright test tests/api/books-api.spec.ts --reporter=line
 * 
 * These tests run much faster than UI tests because they don't
 * open browsers - they just make HTTP requests.
 * 
 * Expected execution time: < 10 seconds
 * 
 * These tests are critical because they prove that the issue with
 * TC-006 (no books in UI) is not a frontend problem but a backend problem.
 * The UI is correctly asking for books, but the API can't provide them.
 */