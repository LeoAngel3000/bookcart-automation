/**
 * Static Test Data
 * Reusable data that remains constant across test executions.
 */

export const TEST_DATA = {
  // Existing users for smoke/regression tests
  users: {
    standard: {
      username: 'ortom',
      password: 'pass1234',
      firstName: 'Ortom',
      lastName: 'User'
    },
    // Adding an invalid user for negative testing (TC-005)
    invalid: {
      username: 'non_existent_user',
      password: 'wrong_password'
    }
  },

  // Fixed application data
  categories: [
    'Biography',
    'Fiction',
    'Mystery',
    'Fantasy',
    'Romance'
  ],

  // Expected error messages from the application
  errorMessages: {
    loginFailed: 'Username or Password is incorrect',
    userExists: 'User Name is not available'
  }
};