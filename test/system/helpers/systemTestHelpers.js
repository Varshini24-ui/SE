/**
 * System Test Helper Functions
 * Utilities for setting up and managing system tests
 */

import config from '../config/systemTestConfig';

/**
 * Setup function to run before all system tests
 */
export const setupSystemTest = async () => {
  // Clear browser storage
  if (typeof window !== 'undefined') {
    window.localStorage.clear();
    window.sessionStorage.clear();
  }

  // Reset any global state
  global.testStartTime = Date.now();

  // Setup mock API if needed
  setupMockApis();

  console.log('System test environment initialized');
};

/**
 * Cleanup function to run after all system tests
 */
export const cleanupSystemTest = async () => {
  // Clear all storage
  if (typeof window !== 'undefined') {
    window.localStorage.clear();
    window.sessionStorage.clear();
  }

  // Clear any test data
  clearTestData();

  // Reset mocks
  jest.clearAllMocks();

  console.log('System test environment cleaned up');
};

/**
 * Create a test file for upload testing
 */
export const createTestFile = (filename, mimeType, size = 1024) => {
  const content = 'x'.repeat(size);
  return new File([content], filename, { type: mimeType });
};

/**
 * Wait for a specific condition with timeout
 */
export const waitForCondition = async (condition, timeout = 5000, interval = 100) => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error('Condition not met within timeout');
};

/**
 * Simulate file upload
 */
export const simulateFileUpload = (fileInput, file) => {
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  fileInput.files = dataTransfer.files;
  
  // Trigger change event
  const event = new Event('change', { bubbles: true });
  fileInput.dispatchEvent(event);
};

/**
 * Setup mock API responses
 */
const setupMockApis = () => {
  // Mock fetch if needed
  if (typeof window !== 'undefined' && !window.fetch) {
    global.fetch = jest.fn();
  }
};

/**
 * Clear test data from storage
 */
const clearTestData = () => {
  if (typeof window !== 'undefined') {
    // Clear indexed DB if used
    if (window.indexedDB) {
      window.indexedDB.databases().then(databases => {
        databases.forEach(db => {
          if (db.name.includes('test')) {
            window.indexedDB.deleteDatabase(db.name);
          }
        });
      });
    }
  }
};

/**
 * Generate random test data
 */
export const generateTestData = {
  email: () => `test${Date.now()}@example.com`,
  password: () => `TestPass${Date.now()}!`,
  name: () => `Test User ${Date.now()}`,
  jobDescription: () => `Test job description with required skills: React, Node.js, JavaScript. ${Date.now()}`
};

/**
 * Retry a function with exponential backoff
 */
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Take screenshot (for visual regression testing)
 */
export const takeScreenshot = async (name) => {
  if (typeof window !== 'undefined' && window.html2canvas) {
    const canvas = await window.html2canvas(document.body);
    return canvas.toDataURL();
  }
  return null;
};

/**
 * Measure performance metrics
 */
export const measurePerformance = (label) => {
  if (typeof window !== 'undefined' && window.performance) {
    const measure = window.performance.measure(label);
    return measure.duration;
  }
  return 0;
};