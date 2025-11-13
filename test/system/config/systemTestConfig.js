/**
 * System Test Configuration
 * Central configuration for all system tests
 */

module.exports = {
  // Application URLs
  baseUrl: process.env.REACT_APP_BASE_URL || 'http://localhost:3000',
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000',

  // Test timeouts (in milliseconds)
  timeouts: {
    default: 30000,
    pageLoad: 10000,
    apiResponse: 5000,
    fileUpload: 15000,
    analysis: 20000
  },

  // Test user credentials
  testUsers: {
    validUser: {
      email: 'testuser@example.com',
      password: 'TestPassword123!',
      name: 'Test User'
    },
    adminUser: {
      email: 'admin@example.com',
      password: 'AdminPassword123!',
      name: 'Admin User'
    }
  },

  // File paths
  testDataPaths: {
    resumes: './test/system/data/testResumes',
    jobDescriptions: './test/system/data/testJobDescriptions'
  },

  // Expected results thresholds
  thresholds: {
    minResumeScore: 0,
    maxResumeScore: 100,
    analysisTimeout: 15000
  },

  // Browser/viewport settings
  viewport: {
    width: 1280,
    height: 720
  },

  // Feature flags
  features: {
    enableChatbot: true,
    enableAuth: true,
    enableResumeStore: true
  },

  // Retry configuration
  retry: {
    maxRetries: 3,
    retryDelay: 1000
  }
};