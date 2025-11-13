/**
 * Custom Cypress Commands for Resume Analyzer Application
 */

// ============================================
// Authentication Commands
// ============================================

/**
 * Login command - handles both already logged in and fresh login scenarios
 */
Cypress.Commands.add('login', (email = 'testuser@example.com', password = 'SecurePass123!') => {
  cy.visit('/');
  cy.wait(1000);
  
  // Check if already logged in
  cy.get('body').then(($body) => {
    if ($body.find('button:contains("Logout")').length > 0) {
      cy.log('Already logged in');
      return;
    }
    
    // Click login button
    cy.contains('button', /login|sign in/i, { timeout: 5000 })
      .should('be.visible')
      .click();
    
    // Fill in credentials
    cy.get('input[type="email"]').clear().type(email);
    cy.get('input[type="password"]').clear().type(password);
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Wait for successful login - logout button appears
    cy.contains('button', /logout/i, { timeout: 10000 }).should('be.visible');
    cy.log(`Logged in as ${email}`);
  });
});

/**
 * Register a new user
 */
Cypress.Commands.add('register', (email, password) => {
  cy.visit('/');
  cy.wait(1000);
  
  // Clear storage first
  cy.clearLocalStorage();
  cy.clearCookies();
  
  // Click register/need account button
  cy.contains('button', /register|need/i, { timeout: 5000 })
    .should('be.visible')
    .click();
  
  // Fill in registration form
  cy.get('input[type="email"]').first().clear().type(email);
  cy.get('input[type="password"]').first().clear().type(password);
  
  // Submit registration
  cy.get('button[type="submit"]').click();
  
  // Wait for successful registration
  cy.contains('button', /logout/i, { timeout: 10000 }).should('be.visible');
  cy.log(`Registered new user: ${email}`);
});

/**
 * Logout command
 */
Cypress.Commands.add('logout', () => {
  cy.contains('button', /logout/i, { timeout: 5000 }).should('be.visible').click();
  cy.contains('button', /login|register/i, { timeout: 5000 }).should('be.visible');
  cy.log('Logged out successfully');
});

// ============================================
// Resume Analysis Commands
// ============================================

/**
 * Fill resume content
 */
Cypress.Commands.add('fillResume', (resumeText) => {
  cy.get('textarea').first().clear().type(resumeText, { delay: 0 });
});

/**
 * Fill job description
 */
Cypress.Commands.add('fillJobDescription', (jdText) => {
  cy.get('textarea').last().clear().type(jdText, { delay: 0 });
});

/**
 * Analyze resume
 */
Cypress.Commands.add('analyzeResume', () => {
  cy.contains('button', /analyze resume/i).should('be.visible').click();
  
  // Wait for analysis to complete - score should appear
  cy.get('[class*="score"]', { timeout: 10000 }).should('be.visible');
});

/**
 * Complete resume analysis flow
 */
Cypress.Commands.add('completeResumeAnalysis', (resumeText, jobDescription = '') => {
  cy.fillResume(resumeText);
  
  if (jobDescription) {
    cy.fillJobDescription(jobDescription);
  }
  
  cy.analyzeResume();
});

/**
 * Select a template
 */
Cypress.Commands.add('selectTemplate', (templateName) => {
  cy.contains('[class*="template"]', templateName, { timeout: 5000 })
    .should('be.visible')
    .click();
  
  cy.get('[class*="template"][class*="selected"]').should('exist');
});

/**
 * Download PDF
 */
Cypress.Commands.add('downloadPDF', () => {
  cy.contains('button', /download|export|pdf/i)
    .should('be.visible')
    .click();
  
  // Verify download button is clickable (actual download happens in browser)
  cy.wait(1000);
});

// ============================================
// Utility Commands
// ============================================

/**
 * Clear all storage
 */
Cypress.Commands.add('clearAllStorage', () => {
  cy.clearLocalStorage();
  cy.clearCookies();
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
});

/**
 * Wait for app to be ready
 */
Cypress.Commands.add('waitForApp', () => {
  cy.get('body', { timeout: 10000 }).should('exist');
  cy.wait(500);
});