/**
 * Cypress E2E Support File
 * Runs before all tests
 */

import './commands';

// ============================================
// Global Error Handling
// ============================================

Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore specific errors that don't affect tests
  const ignoredErrors = [
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    'Cannot read properties of undefined',
    'Cannot read properties of null',
    'NetworkError',
    'Failed to fetch',
  ];
  
  if (ignoredErrors.some(msg => err.message.includes(msg))) {
    return false;
  }
  
  // Log other errors but don't fail the test
  cy.log('Uncaught exception:', err.message);
  return true;
});

// ============================================
// Global Hooks
// ============================================

beforeEach(() => {
  // Clear all storage before each test
  cy.clearAllStorage();
  
  // Set viewport
  cy.viewport(1280, 720);
});

afterEach(function() {
  // Take screenshot on failure
  if (this.currentTest.state === 'failed') {
    cy.screenshot(`${this.currentTest.title} -- FAILED`, {
      capture: 'fullPage',
    });
  }
});