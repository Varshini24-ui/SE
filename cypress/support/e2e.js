/**
 * Cypress E2E Support File
 * Runs before all tests
 */

import './commands';

// Disable uncaught exception handling for 3rd party errors
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore specific errors
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  return true;
});

// Before each test
beforeEach(() => {
  // Clear storage
  cy.clearLocalStorage();
  cy.clearSessionStorage();
  
  // Reset network
  cy.intercept('*', (req) => {
    req.continue();
  });
});

// After each test
afterEach(() => {
  // Screenshot on failure
  cy.screenshot({ capture: 'runner', onlyOnFailure: true });
});

// Global test setup
before(() => {
  // Setup global test data
  cy.window().then((win) => {
    win.localStorage.setItem('TEST_MODE', 'true');
  });
});

// Global test teardown
after(() => {
  // Cleanup global test data
  cy.clearLocalStorage();
  cy.clearSessionStorage();
});