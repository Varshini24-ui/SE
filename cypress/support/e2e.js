// Import commands.js using ES2015 syntax:
import './commands';

// Handle uncaught exceptions from the application
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  console.error('Uncaught exception:', err.message);
  
  // Don't fail tests on uncaught exceptions from app
  return false;
});