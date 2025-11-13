/**
 * Custom Cypress Commands for Resume Analyzer
 * Complete File - Replace your existing commands.js with this
 */

// ====================
// LOGIN COMMAND
// ====================
Cypress.Commands.add('loginUser', (email, password) => {
  cy.visit('/');
  cy.wait(1000); // Wait for app to initialize
  
  // Check if already logged in
  cy.get('body').then(($body) => {
    if ($body.text().includes('Logout')) {
      cy.log('User already logged in');
      return;
    }
    
    // Perform login
    cy.get('input[type="email"]', { timeout: 5000 }).should('be.visible').clear().type(email);
    cy.get('input[type="password"]', { timeout: 5000 }).should('be.visible').clear().type(password);
    cy.get('button[type="submit"]').click();
    
    // Wait for successful login
    cy.contains('button', /logout/i, { timeout: 10000 }).should('be.visible');
    cy.log(`Successfully logged in as ${email}`);
  });
});

// ====================
// LOGOUT COMMAND
// ====================
Cypress.Commands.add('logoutUser', () => {
  cy.get('button.logout-btn', { timeout: 5000 }).should('be.visible').click();
  cy.get('.auth-card', { timeout: 5000 }).should('be.visible');
  cy.log('Successfully logged out');
});

// ====================
// REGISTER COMMAND
// ====================
Cypress.Commands.add('registerUser', (email, password) => {
  cy.visit('/');
  cy.wait(1000);
  
  // Click register/need account button
  cy.contains('button', /register|need|sign up/i, { timeout: 5000 }).click();
  
  // Fill registration form
  cy.get('input[type="email"]', { timeout: 5000 }).should('be.visible').clear().type(email);
  cy.get('input[type="password"]', { timeout: 5000 }).should('be.visible').clear().type(password);
  cy.get('button[type="submit"]').click();
  
  // Wait for successful registration
  cy.contains('button', /logout/i, { timeout: 10000 }).should('be.visible');
  cy.log(`Successfully registered as ${email}`);
});

// ====================
// ANALYZE RESUME COMMAND
// ====================
Cypress.Commands.add('analyzeResume', (resumeText, jdText = '') => {
  cy.get('textarea').first().should('be.visible').clear().type(resumeText, { delay: 0 });
  
  if (jdText) {
    cy.get('textarea').last().should('be.visible').clear().type(jdText, { delay: 0 });
  }
  
  cy.get('button').contains(/analyze/i).should('not.be.disabled').click();
  cy.get('.ats-analysis-card', { timeout: 10000 }).should('be.visible');
  cy.log('Resume analyzed successfully');
});

// ====================
// SELECT TEMPLATE COMMAND
// ====================
Cypress.Commands.add('selectTemplate', (templateName) => {
  cy.get('.template-card').contains(templateName, { timeout: 5000 }).click();
  cy.get('.template-card.selected').should('contain', templateName);
  cy.log(`Template "${templateName}" selected`);
});

// ====================
// CLEAR APP DATA COMMAND
// ====================
Cypress.Commands.add('clearAppData', () => {
  cy.clearLocalStorage();
  cy.clearCookies();
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
  cy.log('All app data cleared');
});

// ====================
// WAIT FOR APP LOAD
// ====================
Cypress.Commands.add('waitForAppLoad', () => {
  cy.get('.hero', { timeout: 10000 }).should('be.visible');
  cy.log('App loaded successfully');
});

// ====================
// VIEWPORT ASSERTION (for checking if element is visible in viewport)
// ====================
Cypress.Commands.add('isInViewport', { prevSubject: true }, (subject) => {
  const rect = subject[0].getBoundingClientRect();
  
  expect(rect.top).to.be.lessThan(window.innerHeight);
  expect(rect.bottom).to.be.greaterThan(0);
  expect(rect.left).to.be.lessThan(window.innerWidth);
  expect(rect.right).to.be.greaterThan(0);
  
  return subject;
});

// ====================
// CHAI ASSERTION FOR IN VIEWPORT
// ====================
chai.Assertion.addMethod('inViewport', function() {
  const subject = this._obj[0];
  const rect = subject.getBoundingClientRect();
  
  this.assert(
    rect.top < window.innerHeight && rect.bottom > 0 &&
    rect.left < window.innerWidth && rect.right > 0,
    'expected element to be in viewport',
    'expected element not to be in viewport'
  );
});