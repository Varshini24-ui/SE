describe('E2E: Complete User Journey', () => {
  // ============================================
  // E2E_JOURNEY_001: Full Registration to Export
  // ============================================
  describe('E2E_JOURNEY_001: Complete Workflow', () => {
    it('Should complete full user journey from registration to PDF export', () => {
      cy.visit('http://localhost:3000');
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      // Step 1: Register
      cy.get('button').contains(/register|need/i).click();
      cy.get('input[type="email"]').type('journey@example.com');
      cy.get('input[type="password"]').type('JourneyPass123!');
      cy.get('button[type="submit"]').click();

      cy.get('button').contains(/logout/i).should('be.visible');

      // Step 2: Select job role
      cy.get('select').first().select('Software Engineer');

      // Step 3: Upload resume
      cy.get('textarea').first().type('John Doe\nEmail: john@example.com\nPhone: (555) 123-4567\n\nSUMMARY\nExperienced developer\n\nSKILLS\nReact, Node.js, MongoDB\n\nEXPERIENCE\nSenior Developer at TechCorp (2020-2023)\n- Led development team\n\nEDUCATION\nB.S. Computer Science (2018)');

      // Step 4: Add job description
      cy.get('textarea').last().type('Looking for Senior Developer with React and Node.js experience');

      // Step 5: Analyze
      cy.get('button').contains(/analyze/i).click();

      // Step 6: Verify results
      cy.get('[class*="score"]').should('be.visible');
      cy.get('[class*="feedback"]').should('be.visible');

      // Step 7: Select template
      cy.get('[class*="template"]').first().click();

      // Step 8: Download PDF
      cy.get('button').contains(/download|export/i).click();

      // Step 9: Verify completion
      cy.get('button').contains(/logout/i).should('be.visible');
    });

    it('Should use chatbot during journey', () => {
      cy.login('testuser@example.com', 'SecurePass123!');

      // Open chatbot
      cy.get('[aria-label*="assistant"]').click();

      // Send message
      cy.get('input[placeholder*="ask"]').type('What is ATS?');
      cy.get('button').contains(/send/i).click();

      // Verify response
      cy.get('[class*="message"]').should('contain', /ATS|applicant/i);
    });

    it('Should persist data across sessions', () => {
      cy.login('testuser@example.com', 'SecurePass123!');

      // Add resume
      cy.get('textarea').first().type('John Doe\nEmail: john@example.com');

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

      // Simulate network error
      cy.intercept('POST', '**', { forceNetworkError: true });

      cy.get('input[type="email"]').type('user@example.com');
      cy.get('input[type="password"]').type('Password123!');
      cy.get('button').contains(/login/i).click();

      cy.get('[class*="error"]').should('contain', /network|error/i);
    });

    it('Should handle invalid file upload', () => {
      cy.login('testuser@example.com', 'SecurePass123!');

      // Create invalid file
      cy.get('input[type="file"]').selectFile('cypress/fixtures/invalid-file.exe', { force: true });

      cy.get('[class*="error"]').should('contain', /invalid|unsupported/i);
    });
  });
});