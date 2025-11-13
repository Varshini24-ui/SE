// Store registered user credentials for reuse across tests
let registeredUser = null;

// Custom command to register a new user and store credentials
Cypress.Commands.add('registerNewUser', () => {
  const timestamp = Date.now();
  const userData = {
    username: `TestUser${timestamp}`,
    email: `test${timestamp}@example.com`,
    password: 'TestPassword123!',
    contact: '5551234567'
  };
  
  cy.visit('/');
  cy.waitForAppLoad();
  
  cy.contains('button', /register|need|sign up/i).should('be.visible').click();
  cy.get('input[type="text"][placeholder*="Username"]').clear().type(userData.username);
  cy.get('input[type="email"]').clear().type(userData.email);
  cy.get('input[type="tel"][placeholder*="Contact"]').clear().type(userData.contact);
  cy.get('input[type="password"]').clear().type(userData.password);
  cy.get('button[type="submit"]').click();
  
  cy.contains('button', /logout/i, { timeout: 15000 }).should('be.visible');
  
  // Store credentials globally for reuse
  registeredUser = userData;
  
  // Wait for the app to fully load after registration
  cy.wait(2000);
  
  return cy.wrap(userData);
});

// Custom command to login with registered user
Cypress.Commands.add('loginWithRegisteredUser', () => {
  if (!registeredUser) {
    throw new Error('No registered user found. Call cy.registerNewUser() first.');
  }
  
  cy.visit('/');
  cy.waitForAppLoad();
  cy.get('input[type="email"]').clear().type(registeredUser.email);
  cy.get('input[type="password"]').clear().type(registeredUser.password);
  cy.get('button[type="submit"]').click();
  cy.contains('button', /logout/i, { timeout: 15000 }).should('be.visible');
  
  // Wait for the app to fully load after login
  cy.wait(2000);
  
  return cy.wrap(registeredUser);
});

// Custom command to login user with specific credentials
Cypress.Commands.add('loginUser', (email, password) => {
  cy.visit('/');
  cy.waitForAppLoad();
  cy.get('input[type="email"]').clear().type(email);
  cy.get('input[type="password"]').clear().type(password);
  cy.get('button[type="submit"]').click();
  cy.contains('button', /logout/i, { timeout: 15000 }).should('be.visible');
  
  // Wait for the app to fully load
  cy.wait(2000);
});

// Custom command to get registered user credentials
Cypress.Commands.add('getRegisteredUser', () => {
  return cy.wrap(registeredUser);
});

// Custom command to clear all app data
Cypress.Commands.add('clearAppData', () => {
  cy.window().then((win) => {
    win.localStorage.clear();
    win.sessionStorage.clear();
  });
  registeredUser = null;
});

// Custom command to wait for app to load
Cypress.Commands.add('waitForAppLoad', () => {
  cy.get('.hero', { timeout: 10000 }).should('be.visible');
  cy.get('.title-small').should('contain', 'Dynamic Resume Analyzer');
});

// FIXED: Custom command to safely logout
Cypress.Commands.add('safeLogout', () => {
  cy.window().then((win) => {
    const logoutButton = win.document.querySelector('button.logout-btn');
    if (logoutButton) {
      cy.get('button.logout-btn').first().click();
      cy.wait(1000);
      cy.url().should('include', '/');
    }
  });
});

// Custom command to type in resume textarea with proper waiting
Cypress.Commands.add('typeInResume', (text) => {
  // Wait for React to fully render
  cy.wait(1000);
  
  // Get the first textarea (resume input)
  cy.get('textarea').first().should('be.visible');
  
  // Clear any existing content
  cy.get('textarea').first().clear({ force: true });
  
  // Wait for clear to complete
  cy.wait(1000);
  
  // Type the new content
  cy.get('textarea').first().type(text, { 
    delay: 10,  // Slower typing to avoid overwhelming React
    force: true 
  });
  
  // Wait for React state to update
  cy.wait(1500);
});

// Custom command to type in JD textarea
Cypress.Commands.add('typeInJD', (text) => {
  // Wait for React to fully render
  cy.wait(1000);
  
  // Get the last textarea (JD input)
  cy.get('textarea').last().should('be.visible');
  
  // Clear any existing content
  cy.get('textarea').last().clear({ force: true });
  
  // Wait for clear to complete
  cy.wait(1000);
  
  // Type the new content
  cy.get('textarea').last().type(text, { 
    delay: 10, 
    force: true 
  });
  
  // Wait for React state to update
  cy.wait(1500);
});

// Custom command to check if element is in viewport
Cypress.Commands.add('isInViewport', { prevSubject: true }, (subject) => {
  const rect = subject[0].getBoundingClientRect();
  expect(rect.top).to.be.lessThan(window.innerHeight);
  expect(rect.bottom).to.be.greaterThan(0);
  return subject;
});

// Assertion for viewport visibility
chai.Assertion.addMethod('inViewport', function () {
  const subject = this._obj;
  const rect = subject[0].getBoundingClientRect();
  
  this.assert(
    rect.top < window.innerHeight && rect.bottom > 0,
    'expected element to be in viewport',
    'expected element not to be in viewport'
  );
});