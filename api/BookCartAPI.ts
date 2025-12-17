import { APIRequestContext, APIResponse } from '@playwright/test';
import { API_ENDPOINTS, HTTP_STATUS } from '@utils/constants';
import { TestUser } from '@utils/data-generator';

/**
 * BookCartAPI Client
 * 
 * This class encapsulates all API interactions with BookCart backend.
 * It provides a clean interface for making API calls from tests while
 * handling common concerns like error handling, logging, and data formatting.
 * 
 * Benefits of this approach:
 * - Centralized API logic: All API calls in one place
 * - Reusability: Methods can be used across multiple tests
 * - Maintainability: If API changes, update only this file
 * - Type safety: TypeScript ensures correct data types
 * - Testability: Can mock this class in unit tests
 * 
 * @example
 * ```typescript
 * const api = new BookCartAPI(request);
 * const response = await api.login({ username: 'user', password: 'pass' });
 * expect(response.status()).toBe(200);
 * ```
 */
export class BookCartAPI {
  private request: APIRequestContext;
  private authToken: string | null = null;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  /**
   * Sets the authentication token for subsequent requests
   * This is useful when you need to make authenticated API calls
   * 
   * @param token - JWT token obtained from login
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Clears the stored authentication token
   */
  clearAuthToken(): void {
    this.authToken = null;
  }

  /**
   * Returns headers object with authentication if token is set
   * @private
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Logs API request details (useful for debugging)
   * In a real project, you might want to use a proper logging library
   * @private
   */
  private logRequest(method: string, endpoint: string, data?: any): void {
    console.log(`[API ${method}] ${endpoint}`);
    if (data) {
      console.log('Request data:', JSON.stringify(data, null, 2));
    }
  }

  /**
   * Logs API response details
   * @private
   */
  private async logResponse(response: APIResponse): Promise<void> {
    console.log(`[API Response] Status: ${response.status()}`);
    try {
      const body = await response.json();
      console.log('Response body:', JSON.stringify(body, null, 2));
    } catch (e) {
      // Response might not be JSON, that's okay
      console.log('Response is not JSON or is empty');
    }
  }

  // ============================================
  // USER / AUTHENTICATION ENDPOINTS
  // ============================================

  /**
   * Performs a login request via API
   * 
   * This is useful for:
   * - TC-006: Testing API login endpoint directly
   * - Setting up authenticated state before UI tests
   * - Integration tests that need a logged-in user
   * 
   * @param user - Object containing username and password
   * @returns API Response with token and userId if successful
   * 
   * @example
   * ```typescript
   * const response = await api.login({ 
   *   username: 'testuser', 
   *   password: 'Test@123' 
   * });
   * const data = await response.json();
   * const token = data.token;
   * ```
   */
  async login(user: Pick<TestUser, 'username' | 'password'>): Promise<APIResponse> {
    this.logRequest('POST', API_ENDPOINTS.LOGIN, user);
    
    const response = await this.request.post(API_ENDPOINTS.LOGIN, {
      data: {
        username: user.username,
        password: user.password,
      },
      headers: this.getHeaders(),
    });

    await this.logResponse(response);

    // If login successful, store the token automatically
    if (response.status() === HTTP_STATUS.OK) {
      try {
        const data = await response.json();
        if (data.token) {
          this.setAuthToken(data.token);
        }
      } catch (e) {
        console.warn('Could not extract token from login response');
      }
    }

    return response;
  }

  /**
   * Registers a new user via API
   * 
   * This is useful for:
   * - TC-009: Creating users via API for integration tests
   * - Setting up test data before UI tests
   * - Testing registration endpoint directly
   * 
   * Note: BookCart API expects specific field names (userName vs username)
   * This method handles the mapping automatically
   * 
   * @param user - TestUser object with all registration data
   * @returns API Response with userId if successful
   * 
   * @example
   * ```typescript
   * const user = generateTestUser();
   * const response = await api.registerUser(user);
   * expect(response.status()).toBe(201);
   * ```
   */
  async registerUser(user: TestUser): Promise<APIResponse> {
    this.logRequest('POST', API_ENDPOINTS.REGISTER, user);

    const response = await this.request.post(API_ENDPOINTS.REGISTER, {
      data: {
        userId: 0, // API expects 0 for new users
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.username, // Note: API uses 'userName' not 'username'
        password: user.password,
        confirmPassword: user.password, // Match password
        gender: user.gender,
      },
      headers: this.getHeaders(),
    });

    await this.logResponse(response);
    return response;
  }

  /**
   * Validates if a username is available
   * 
   * This endpoint checks if a username is already taken.
   * Useful for testing username validation logic.
   * 
   * @param username - Username to check
   * @returns API Response indicating if username is available
   */
  async validateUsername(username: string): Promise<APIResponse> {
    this.logRequest('POST', API_ENDPOINTS.VALIDATE_USERNAME, { username });

    const response = await this.request.post(API_ENDPOINTS.VALIDATE_USERNAME, {
      data: { userName: username },
      headers: this.getHeaders(),
    });

    await this.logResponse(response);
    return response;
  }

  // ============================================
  // BOOK ENDPOINTS
  // ============================================

  /**
   * Fetches all books from the catalog
   * 
   * This is useful for:
   * - TC-005: Testing the GET /Book endpoint
   * - TC-008: Documenting the 500 error defect
   * - Verifying book data structure and content
   * 
   * Note: Currently this endpoint returns 500 error in BookCart
   * Tests using this should be marked with @defect tag
   * 
   * @returns API Response with array of books if successful
   * 
   * @example
   * ```typescript
   * const response = await api.getAllBooks();
   * if (response.ok()) {
   *   const books = await response.json();
   *   console.log(`Found ${books.length} books`);
   * }
   * ```
   */
  async getAllBooks(): Promise<APIResponse> {
    this.logRequest('GET', API_ENDPOINTS.GET_BOOKS);

    const response = await this.request.get(API_ENDPOINTS.GET_BOOKS, {
      headers: this.getHeaders(),
    });

    await this.logResponse(response);
    return response;
  }

  /**
   * Fetches a specific book by ID
   * 
   * This is useful for:
   * - TC-008: Testing boundary conditions with invalid IDs
   * - Verifying individual book details
   * - Testing 404 responses
   * 
   * @param bookId - ID of the book to retrieve
   * @returns API Response with book object if found
   * 
   * @example
   * ```typescript
   * // Test with valid ID
   * const response = await api.getBookById(1);
   * 
   * // Test with invalid ID (boundary test)
   * const response404 = await api.getBookById(99999);
   * expect(response404.status()).toBe(404);
   * ```
   */
  async getBookById(bookId: number): Promise<APIResponse> {
    const endpoint = API_ENDPOINTS.GET_BOOK_BY_ID(bookId);
    this.logRequest('GET', endpoint);

    const response = await this.request.get(endpoint, {
      headers: this.getHeaders(),
    });

    await this.logResponse(response);
    return response;
  }

  /**
   * Fetches books similar to a given book
   * 
   * @param bookId - ID of the book to find similar books for
   * @returns API Response with array of similar books
   */
  async getSimilarBooks(bookId: number): Promise<APIResponse> {
    const endpoint = API_ENDPOINTS.GET_SIMILAR_BOOKS(bookId);
    this.logRequest('GET', endpoint);

    const response = await this.request.get(endpoint, {
      headers: this.getHeaders(),
    });

    await this.logResponse(response);
    return response;
  }

  // ============================================
  // CATEGORY ENDPOINTS
  // ============================================

  /**
   * Fetches all book categories
   * 
   * @returns API Response with array of categories
   */
  async getCategories(): Promise<APIResponse> {
    this.logRequest('GET', API_ENDPOINTS.GET_CATEGORIES);

    const response = await this.request.get(API_ENDPOINTS.GET_CATEGORIES, {
      headers: this.getHeaders(),
    });

    await this.logResponse(response);
    return response;
  }

  // ============================================
  // SHOPPING CART ENDPOINTS
  // ============================================

  /**
   * Adds a book to the shopping cart
   * Requires authentication
   * 
   * @param bookId - ID of the book to add
   * @param userId - ID of the user
   * @returns API Response
   */
  async addToCart(bookId: number, userId: number): Promise<APIResponse> {
    this.logRequest('POST', API_ENDPOINTS.ADD_TO_CART, { bookId, userId });

    const response = await this.request.post(API_ENDPOINTS.ADD_TO_CART, {
      data: {
        bookId,
        userId,
      },
      headers: this.getHeaders(),
    });

    await this.logResponse(response);
    return response;
  }

  /**
   * Retrieves the shopping cart for a user
   * Requires authentication
   * 
   * @param userId - ID of the user
   * @returns API Response with cart contents
   */
  async getCart(userId: number): Promise<APIResponse> {
    const endpoint = `${API_ENDPOINTS.GET_CART}/${userId}`;
    this.logRequest('GET', endpoint);

    const response = await this.request.get(endpoint, {
      headers: this.getHeaders(),
    });

    await this.logResponse(response);
    return response;
  }

  /**
   * Clears all items from the shopping cart
   * Requires authentication
   * 
   * @param userId - ID of the user
   * @returns API Response
   */
  async clearCart(userId: number): Promise<APIResponse> {
    const endpoint = `${API_ENDPOINTS.CLEAR_CART}/${userId}`;
    this.logRequest('DELETE', endpoint);

    const response = await this.request.delete(endpoint, {
      headers: this.getHeaders(),
    });

    await this.logResponse(response);
    return response;
  }

  // ============================================
  // ORDER ENDPOINTS
  // ============================================

  /**
   * Creates a new order
   * Requires authentication
   * 
   * This is useful for:
   * - TC-007: Testing order creation with invalid token (negative test)
   * - E2E tests that need to verify order placement
   * 
   * @param orderData - Order details
   * @returns API Response with order confirmation
   * 
   * @example
   * ```typescript
   * // Test with invalid token (TC-007)
   * api.setAuthToken('InvalidTokenXYZ123');
   * const response = await api.createOrder({ userId: 1, items: [] });
   * expect(response.status()).toBe(401);
   * ```
   */
  async createOrder(orderData: any): Promise<APIResponse> {
    this.logRequest('POST', API_ENDPOINTS.CREATE_ORDER, orderData);

    const response = await this.request.post(API_ENDPOINTS.CREATE_ORDER, {
      data: orderData,
      headers: this.getHeaders(),
    });

    await this.logResponse(response);
    return response;
  }

  /**
   * Retrieves all orders for a user
   * Requires authentication
   * 
   * @param userId - ID of the user
   * @returns API Response with array of orders
   */
  async getOrders(userId: number): Promise<APIResponse> {
    const endpoint = `${API_ENDPOINTS.GET_ORDERS}/${userId}`;
    this.logRequest('GET', endpoint);

    const response = await this.request.get(endpoint, {
      headers: this.getHeaders(),
    });

    await this.logResponse(response);
    return response;
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Performs complete login flow and returns token
   * This is a convenience method that combines login + token extraction
   * 
   * @param user - User credentials
   * @returns Token string if login successful, null otherwise
   * 
   * @example
   * ```typescript
   * const token = await api.loginAndGetToken({ 
   *   username: 'user', 
   *   password: 'pass' 
   * });
   * if (token) {
   *   // Use token for authenticated requests
   * }
   * ```
   */
  async loginAndGetToken(user: Pick<TestUser, 'username' | 'password'>): Promise<string | null> {
    const response = await this.login(user);
    
    if (response.status() === HTTP_STATUS.OK) {
      try {
        const data = await response.json();
        return data.token || null;
      } catch (e) {
        console.error('Failed to extract token from response:', e);
        return null;
      }
    }
    
    return null;
  }

  /**
   * Registers a user and automatically logs them in
   * Returns both the registration response and the login token
   * 
   * This is useful for tests that need a fresh authenticated user
   * 
   * @param user - User data
   * @returns Object with registration response and login token
   * 
   * @example
   * ```typescript
   * const user = generateTestUser();
   * const { registerResponse, token } = await api.registerAndLogin(user);
   * 
   * expect(registerResponse.status()).toBe(201);
   * expect(token).toBeTruthy();
   * // Now you can make authenticated requests
   * ```
   */
  async registerAndLogin(user: TestUser): Promise<{ 
    registerResponse: APIResponse; 
    token: string | null;
  }> {
    const registerResponse = await this.registerUser(user);
    
    let token: string | null = null;
    if (registerResponse.ok()) {
      token = await this.loginAndGetToken({
        username: user.username,
        password: user.password,
      });
    }

    return { registerResponse, token };
  }

  /**
   * Checks if the API is healthy and responding
   * Useful for smoke tests or setup validation
   * 
   * @returns true if API responds with 200 or 500 (server is alive), false otherwise
   */
  async isApiHealthy(): Promise<boolean> {
    try {
      const response = await this.getAllBooks();
      // Even 500 means the server is responding, just has an error
      // Complete failure to connect would throw an exception
      return response.status() >= 200 && response.status() < 600;
    } catch (e) {
      console.error('API health check failed:', e);
      return false;
    }
  }
}
