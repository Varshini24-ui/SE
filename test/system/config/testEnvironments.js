/**
 * Test Environment Configurations
 * Manage different test environments (dev, staging, production-like)
 */

const environments = {
  development: {
    name: 'development',
    baseUrl: 'http://localhost:3000',
    apiUrl: 'http://localhost:5000',
    database: 'test_db_dev',
    logLevel: 'debug'
  },

  staging: {
    name: 'staging',
    baseUrl: 'https://staging.resumeanalyzer.com',
    apiUrl: 'https://api-staging.resumeanalyzer.com',
    database: 'test_db_staging',
    logLevel: 'info'
  },

  ci: {
    name: 'ci',
    baseUrl: 'http://localhost:3000',
    apiUrl: 'http://localhost:5000',
    database: 'test_db_ci',
    logLevel: 'error',
    headless: true
  }
};

const currentEnv = process.env.TEST_ENV || 'development';

module.exports = {
  current: environments[currentEnv],
  all: environments,
  
  getEnvironment: (envName) => {
    return environments[envName] || environments.development;
  },

  isCI: () => {
    return process.env.CI === 'true' || currentEnv === 'ci';
  }
};