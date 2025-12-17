/**
 * Environment Configuration
 * This file manages different environment settings (Dev, QA, Staging, Prod).
 * It uses environment variables to switch between them.
 */

export interface EnvironmentConfig {
  baseUrl: string;
  apiUrl: string;
  timeout: number;
}

const environments: Record<string, EnvironmentConfig> = {
  production: {
    baseUrl: 'https://bookcart.azurewebsites.net',
    apiUrl: 'https://bookcart.azurewebsites.net/api',
    timeout: 30000,
  },
  // You can add more environments here in the future
  staging: {
    baseUrl: 'https://staging.bookcart.azurewebsites.net',
    apiUrl: 'https://staging.bookcart.azurewebsites.net/api',
    timeout: 30000,
  }
};

// Default to production if no ENV is provided
const currentEnv = process.env.ENV || 'production';

export const ENV = environments[currentEnv] || environments.production;