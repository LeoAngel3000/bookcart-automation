/**
 * Global Project Constants
 * * This file centralizes all constant values used across the framework,
 * following the DRY (Don't Repeat Yourself) principle.
 * * Benefits:
 * - Easy maintenance: change a value in a single place.
 * - Typo prevention: using constants reduces string-related errors.
 * - Documentation: descriptive names document the purpose of each value.
 * - Type safety: TypeScript ensures correct value usage.
 */

/**
 * BookCart Application URLs
 * These can be overridden via environment variables
 */
export const URLS = {
  BASE_URL: process.env.BASE_URL || 'https://bookcart.azurewebsites.net',
  API_URL: process.env.API_URL || 'https://bookcart.azurewebsites.net/api',
  SWAGGER_URL: 'https://bookcart.azurewebsites.net/swagger/index.html',
} as const;

/**
 * Application Routes (Relative to BASE_URL)
 * Used to avoid hardcoding strings within test files
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  BOOKS: '/books',
  CART: '/cart',
  CHECKOUT: '/checkout',
  MY_ORDERS: '/my-orders',
} as const;

/**
 * API Endpoints (Relative to API_URL)
 * Centralized for easy endpoint management
 */
export const API_ENDPOINTS = {
  // User endpoints
  LOGIN: '/User/login',
  REGISTER: '/User',
  VALIDATE_USERNAME: '/User/validateUserName',
  
  // Book endpoints
  GET_BOOKS: '/Book',
  GET_BOOK_BY_ID: (id: number) => `/Book/${id}`,
  GET_SIMILAR_BOOKS: (id: number) => `/Book/GetSimilarBooks/${id}`,
  
  // Category endpoints
  GET_CATEGORIES: '/Category',
  
  // Cart endpoints
  ADD_TO_CART: '/ShoppingCart/AddToCart',
  GET_CART: '/ShoppingCart',
  CLEAR_CART: '/ShoppingCart/ClearCart',
  
  // Order endpoints
  CREATE_ORDER: '/Order',
  GET_ORDERS: '/Order',
} as const;

/**
 * Timeouts in milliseconds
 * Different actions require different wait times
 */
export const TIMEOUTS = {
  // Short timeouts for fast-appearing elements
  SHORT: 3000,           // 3 seconds - for simple elements
  MEDIUM: 10000,         // 10 seconds - for most actions
  LONG: 30000,           // 30 seconds - for slow navigations
  API_REQUEST: 15000,    // 15 seconds - for API requests
  
  // Specific timeouts for special cases
  ANIMATION: 1000,       // 1 second - waiting for UI animations
  DEBOUNCE: 300,         // 300ms - waiting for debounced search triggers
} as const;

/**
 * Expected Application Error Messages
 * Useful for validating correct error feedback
 */
export const ERROR_MESSAGES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'Username or Password is incorrect',
  USERNAME_NOT_AVAILABLE: 'User Name is not available',
  
  // Validation errors
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email',
  PASSWORD_MISMATCH: 'Passwords do not match',
  
  // API errors
  UNAUTHORIZED: 'Unauthorized',
  NOT_FOUND: 'Not Found',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
} as const;

/**
 * Expected Success Messages
 */
export const SUCCESS_MESSAGES = {
  REGISTRATION_SUCCESS: 'Registration successful',
  LOGIN_SUCCESS: 'Login successful',
  BOOK_ADDED_TO_CART: 'Book added to cart',
  ORDER_PLACED: 'Order placed successfully',
} as const;

/**
 * Common CSS Selectors
 * NOTE: In a standard POM, most selectors live within Page Classes.
 * These are reserved for truly global elements (navbar, footer, etc.)
 */
export const COMMON_SELECTORS = {
  // Navigation
  NAVBAR: 'mat-toolbar',
  LOGIN_BUTTON: 'button:has-text("Login")',
  LOGOUT_BUTTON: 'button:has-text("Logout")',
  CART_ICON: 'mat-icon:has-text("shopping_cart")',
  
  // Common Form Elements
  SUBMIT_BUTTON: 'button[type="submit"]',
  CANCEL_BUTTON: 'button:has-text("Cancel")',
  
  // Messages and Notifications
  SNACKBAR: '.mat-snack-bar-container',
  ERROR_MESSAGE: '.mat-error',
  
  // Spinners and Loading indicators
  SPINNER: 'mat-spinner',
  PROGRESS_BAR: 'mat-progress-bar',
} as const;

/**
 * Known Test Data
 * Specific data required for certain test scenarios
 */
export const TEST_DATA = {
  // Existing test user in BookCart system
  EXISTING_USER: {
    username: 'ortom',
    password: 'pass1234',
  },
  
  // Known book categories
  KNOWN_CATEGORIES: [
    'Biography',
    'Fantasy',
    'Mystery',
    'Romance',
    'Fiction',
  ],
  
  // Search terms expected to find results
  // NOTE: BookCart currently has issues; these tests may fail
  SEARCH_TERMS: {
    HARRY: 'Harry',
    POTTER: 'Potter',
    HP: 'HP',
  },
} as const;

/**
 * Reporting and Logging Configuration
 */
export const REPORTING = {
  SCREENSHOT_ON_FAILURE: true,
  VIDEO_ON_FAILURE: true,
  TRACE_ON_RETRY: true,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
} as const;

/**
 * Browser Configuration
 */
export const BROWSER_CONFIG = {
  HEADLESS: process.env.HEADLESS !== 'false',  // Run headless by default
  VIEWPORT: {
    WIDTH: 1920,
    HEIGHT: 1080,
  },
  USER_AGENT: 'BookCart Automation Tests',
} as const;

/**
 * Expected HTTP Status Codes
 * Useful for API testing assertions
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Tags for Conditional Test Execution
 * Matches grep patterns in playwright.config.ts
 */
export const TEST_TAGS = {
  UI: '@ui',
  API: '@api',
  INTEGRATION: '@integration',
  SMOKE: '@smoke',
  REGRESSION: '@regression',
  DEFECT: '@defect',
  BLOCKED: '@blocked',
} as const;

/**
 * Retry Configuration for specific actions
 * Inherently flaky actions may require localized retries
 */
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,  // 1 second between retries
} as const;

/**
 * Utility Regex Patterns for Validation
 */
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&*!]).{6,}$/,
  JWT_TOKEN: /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/,
} as const;