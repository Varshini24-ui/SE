/**
 * Custom Cypress commands for testing
 */

// Login command
Cypress.Commands.add('login', (email, password) => {
  cy.visit('http://localhost:3000');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button').contains(/login/i).click();
  cy.get('button').contains(/logout|analyze/i).should('be.visible');
});

// Register command
Cypress.Commands.add('register', (email, password) => {
  cy.visit('http://localhost:3000');
  cy.get('button').contains(/register|need/i).click();
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.get('button').contains(/logout/i).should('be.visible');
});

// Upload resume command
Cypress.Commands.add('uploadResume', (filePath) => {
  cy.get('input[type="file"]').selectFile(filePath);
  cy.get('[class*="error"]').should('not.exist');
});

// Analyze resume command
Cypress.Commands.add('analyzeResume', (resumeText, jobDescription = '') => {
  if (resumeText) {
    cy.get('textarea').first().type(resumeText);
  }
  
  if (jobDescription) {
    cy.get('textarea').last().type(jobDescription);
  }
  
  cy.get('button').contains(/analyze/i).click();
  cy.get('[class*="score"]').should('be.visible');
});

// Download PDF command
Cypress.Commands.add('downloadPDF', () => {
  cy.get('button').contains(/download|export|pdf/i).click();
  // Wait for download to complete
  cy.readFile('cypress/downloads/').should('exist');
});

// Open chatbot command
Cypress.Commands.add('openChatbot', () => {
  cy.get('[aria-label*="assistant"]').click();
  cy.get('[class*="chat"]').should('be.visible');
});

// Send chatbot message command
Cypress.Commands.add('sendChatMessage', (message) => {
  cy.get('input[placeholder*="ask"]').type(message);
  cy.get('button').contains(/send/i).click();
  cy.get('[class*="message"]').should('contain', message);
});

// Select template command
Cypress.Commands.add('selectTemplate', (templateName) => {
  cy.get('[class*="template"]').contains(templateName).click();
  cy.get('[class*="template"][class*="selected"]').should('contain', templateName);
});

// Logout command
Cypress.Commands.add('logout', () => {
  cy.get('button').contains(/logout/i).click();
  cy.get('input[type="email"]').should('be.visible');
});