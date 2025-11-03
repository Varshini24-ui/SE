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
  if (err.message.includes('Cannot read')) {
    return false;
  }
  return true;
});

// Before each test
beforeEach(() => {
  // Clear storage
  cy.window().then((win) => {
    win.localStorage.clear();
    win.sessionStorage.clear();
  });
});

// After each test
afterEach(() => {
  // Screenshot on failure
  cy.screenshot({ capture: 'runner', onlyOnFailure: true });
});

// Global test setup
before(() => {
  cy.visit('http://localhost:3000');
});

// Global test teardown
after(() => {
  cy.window().then((win) => {
    win.localStorage.clear();
    win.sessionStorage.clear();
  });
});