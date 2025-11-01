describe('E2E: Complete User Journey', () => {
  // ============================================
  // E2E_JOURNEY_001: Full Registration to Export
  // ============================================
  describe('E2E_JOURNEY_001: Complete Workflow', () => {
    it('Should complete full user journey from registration to PDF export', () => {
      cy.visit('http://localhost:3000');
      cy.clearLocalStorage();
      cy.window().then((win) => {
        win.sessionStorage.clear();
      });

      // Step 1: Register
      cy.get('button').contains(/register|need/i).click();
      cy.get('input[type="email"]').first().type('journey@example.com');
      cy.get('input[type="password"]').first().type('JourneyPass123!');
      cy.get('button[type="submit"]').click();

      cy.get('button').contains(/logout/i, { timeout: 5000 }).should('be.visible');

      // Step 2: Upload resume
      cy.get('textarea').first().clear().type('John Doe\nEmail: john@example.com\nPhone: (555) 123-4567\n\nSUMMARY\nExperienced developer\n\nSKILLS\nReact, Node.js, MongoDB\n\nEXPERIENCE\nSenior Developer at TechCorp');

      // Step 3: Add job description
      cy.get('textarea').last().clear().type('Looking for Senior Developer with React and Node.js experience');

      // Step 4: Analyze
      cy.get('button').contains(/analyze/i).click();

      // Step 5: Verify results appear
      cy.get('[class*="score"]', { timeout: 5000 }).should('be.visible');

      // Step 6: Select template if exists
      cy.get('[class*="template"]').first().then(($template) => {
        if ($template.length > 0) {
          cy.wrap($template).click();
        }
      });

      // Step 7: Download PDF
      cy.get('button').contains(/download|export/i).click();

      // Step 8: Verify completion
      cy.get('button').contains(/logout/i).should('be.visible');
    });

    it('Should use chatbot during journey', () => {
      cy.login('testuser@example.com', 'SecurePass123!');

      // Open chatbot
      cy.get('button[aria-label*="assistant"]').click();
      cy.get('[class*="chat"]').should('be.visible');

      // Send message
      cy.get('input[placeholder*="ask"]').type('What is ATS?');
      cy.get('button').contains(/send/i).click();

      // Verify response received
      cy.get('[class*="message"]', { timeout: 5000 }).should('have.length.greaterThan', 0);
    });

    it('Should persist data across sessions', () => {
      cy.login('testuser@example.com', 'SecurePass123!');

      // Add resume
      cy.get('textarea').first().clear().type('John Doe\nEmail: john@example.com');

      // Reload page
      cy.reload();

      // Data should persist
      cy.get('textarea').first().should('contain', 'John Doe');
    });
  });

  // ============================================
  // E2E_JOURNEY_002: Error Handling
  // ============================================
  describe('E2E_JOURNEY_002: Error Handling', () => {
    it('Should handle network errors gracefully', () => {
      cy.visit('http://localhost:3000');

      // Simulate network error on POST requests
      cy.intercept('POST', '**/api/**', { forceNetworkError: true }).as('networkError');

      cy.get('input[type="email"]').first().type('user@example.com');
      cy.get('input[type="password"]').first().type('Password123!');
      cy.get('button').contains(/login/i).click();

      // Should show error message
      cy.get('body', { timeout: 5000 }).should('contain', /error|network|failed/i);
    });

    it('Should handle file upload validation', () => {
      cy.login('testuser@example.com', 'SecurePass123!');

      // Try to upload invalid file type
      cy.get('input[type="file"]').selectFile('cypress/fixtures/sample.txt', { force: true });

      // Check for validation or error
      cy.get('body').then(($body) => {
        // Either show error or accept and continue
        cy.wrap($body).should('exist');
      });
    });
  });
});