/**
 * Custom Cypress Commands
 */

// Login command
Cypress.Commands.add('loginUser', (email, password) => {
  cy.visit('/');
  
  // Wait for page to load completely
  cy.get('body', { timeout: 10000 }).should('exist');
  
  // Check if we're already logged in
  cy.get('body').then(($body) => {
    if ($body.text().includes('Logout')) {
      // Already logged in
      return;
    }
    
    // If not logged in, look for login button or navigate to login
    cy.contains('button', /login|sign in/i, { timeout: 5000 }).click({ force: true });
    
    // Fill in email
    cy.get('input[type="email"]').type(email);
    
    // Fill in password
    cy.get('input[type="password"]').type(password);
    
    // Click login/submit button
    cy.get('button[type="submit"]').click();
    
    // Wait for redirect and logout button to appear
    cy.contains('button', /logout/i, { timeout: 10000 }).should('be.visible');
  });
});

// Logout command
Cypress.Commands.add('logoutUser', () => {
  cy.contains('button', /logout/i).click();
  cy.url().should('not.include', '/dashboard');
});

// Register command
Cypress.Commands.add('registerUser', (email, password) => {
  cy.visit('/');
  cy.contains('button', /register|sign up/i, { timeout: 5000 }).click({ force: true });
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.contains('button', /logout/i, { timeout: 10000 }).should('be.visible');
});

// Analyze resume command
Cypress.Commands.add('analyzeResume', (resumeText) => {
  cy.get('textarea').first().type(resumeText);
  cy.contains('button', /analyze|submit/i).click();
  cy.contains('button', /logout|analyze/i, { timeout: 10000 }).should('be.visible');
});