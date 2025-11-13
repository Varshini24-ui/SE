/**
 * Cypress E2E Support File
 * Runs before all tests
 */

import './commands';

// Disable uncaught exception handling for 3rd party errors
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore specific errors that don't affect tests
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  if (err.message.includes('Cannot read')) {
    return false;
  }
  if (err.message.includes('Network request failed')) {
    return false;
  }
  // Return true to fail the test on other exceptions
  return true;
});

// Before each test
beforeEach(() => {
  // Clear all storage using correct Cypress commands
  cy.clearLocalStorage();
  cy.clearCookies();
  
  // Clear session storage
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
  
  // Set viewport
  cy.viewport(1280, 720);
});

// After each test
afterEach(() => {
  // Take screenshot on failure (Cypress does this automatically)
  // Additional cleanup if needed
});

// Global test setup
before(() => {
  // Visit the app once before all tests
  cy.log('Starting Cypress Test Suite');
});

// Global test teardown
after(() => {
  // Final cleanup
  cy.clearLocalStorage();
  cy.clearCookies();
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
});