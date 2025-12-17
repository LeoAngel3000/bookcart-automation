/**
 * Data Generator - Unique and realistic test data generator
 * * This module provides functions to generate test data required for our tests,
 * such as unique usernames, emails, passwords, and more.
 * * Uniqueness is crucial in testing because:
 * - It prevents test failures due to attempts to create an existing user.
 * - It allows running the same tests multiple times without data collisions.
 * - In shared environments, multiple testers can execute suites simultaneously.
 */

/**
 * Generates a unique username using a timestamp and a random string.
 * * Format: prefix_timestamp_random
 * Example: "testuser_1703012345678_a3f"
 * * @param prefix - Prefix to identify the test type (default: 'autotest')
 * @returns A guaranteed unique username
 */
export function generateUniqueUsername(prefix: string = 'autotest'): string {
  const timestamp = Date.now(); // Milliseconds since 1970 - always unique
  const random = Math.random().toString(36).substring(2, 5); // 3 random characters
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Generates a unique email based on a username.
 * * @param username - Base username for the email
 * @param domain - Email domain (default: 'test.com')
 * @returns A unique email address
 */
export function generateUniqueEmail(username?: string, domain: string = 'test.com'): string {
  const user = username || generateUniqueUsername();
  return `${user}@${domain}`;
}

/**
 * Generates a valid password according to BookCart's business rules.
 * * BookCart requires:
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * - Minimum length of 6 characters
 * * @param length - Password length (default: 10)
 * @returns A password that meets all validation requirements
 */
export function generateValidPassword(length: number = 10): string {
  // Define character sets required
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '@#$%&*!';
  
  // Ensure at least one character from each required set
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the remaining length with random characters from all sets
  const allChars = uppercase + lowercase + numbers + special;
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the characters so they don't always start in the same order
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Generates a full set of test user data
 * * @param prefix - Prefix for the username
 * @returns An object containing all user data fields
 */
export interface TestUser {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  gender: 'Male' | 'Female';
}

export function generateTestUser(prefix: string = 'test'): TestUser {
  const username = generateUniqueUsername(prefix);
  
  return {
    firstName: 'Test',
    lastName: 'User',
    username: username,
    email: generateUniqueEmail(username),
    password: generateValidPassword(),
    gender: Math.random() > 0.5 ? 'Male' : 'Female'
  };
}

/**
 * Generates a random string of a specific length.
 * Useful for boundary testing in text fields.
 * * @param length - Desired length
 * @param charset - Character set to use (default: alphanumeric)
 * @returns A random string
 */
export function generateRandomString(
  length: number, 
  charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset[Math.floor(Math.random() * charset.length)];
  }
  return result;
}

/**
 * Generates a random number between min and max (inclusive).
 * * @param min - Minimum value
 * @param max - Maximum value
 * @returns A random number within the range
 */
export function generateRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random price for testing purposes.
 * * @param min - Minimum price (default: 10)
 * @param max - Maximum price (default: 500)
 * @returns A price rounded to 2 decimal places
 */
export function generateRandomPrice(min: number = 10, max: number = 500): number {
  const price = Math.random() * (max - min) + min;
  return Math.round(price * 100) / 100; // Round to 2 decimals
}

/**
 * Suspends execution for a specific duration.
 * * NOTE: Generally, you should rely on Playwright's auto-waiting features
 * instead of sleep(). Use this only when a fixed wait is strictly necessary,
 * such as waiting for specific UI animations to complete.
 * * @param ms - Milliseconds to wait
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Formats a date for logging purposes.
 * * @param date - Date to format (default: now)
 * @returns A human-readable timestamp string
 */
export function formatDateForLog(date: Date = new Date()): string {
  return date.toISOString().replace('T', ' ').split('.')[0];
}

/**
 * Sanitizes a string for use in filenames.
 * Removes characters that are not safe for filesystem paths.
 * * @param str - String to sanitize
 * @returns A filesystem-safe string
 */
export function sanitizeForFilename(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9-_]/g, '_') // Replace special characters with underscores
    .replace(/_+/g, '_') // Replace multiple consecutive underscores with a single one
    .replace(/^_|_$/g, ''); // Remove leading and trailing underscores
}