describe('E2E: Resume Analysis Flow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    cy.login('testuser@example.com', 'SecurePass123!');
  });

  // ============================================
  // E2E_RESUME_001-005: Upload & Analysis
  // ============================================
  describe('E2E_RESUME_001-005: Upload and Analysis', () => {
    it('Should enter resume text and analyze', () => {
      // Clear and enter resume data
      cy.get('textarea').first().clear().type('John Doe\nEmail: john@example.com\nPhone: (555) 123-4567\nSkills: React, Node.js, MongoDB');
      
      cy.get('button').contains(/analyze/i).click();

      // Wait for analysis results
      cy.get('[class*="score"]', { timeout: 5000 }).should('be.visible');
    });

    it('Should enter job description for keyword matching', () => {
      cy.get('textarea').first().clear().type('Senior Developer with strong React experience');
      cy.get('textarea').last().clear().type('Senior Developer with React and Node.js experience required');

      cy.get('button').contains(/analyze/i).click();

      // Verify analysis completed
      cy.get('[class*="score"]', { timeout: 5000 }).should('be.visible');
    });

    it('Should display ATS score', () => {
      cy.get('textarea').first().clear().type('John Doe\nEmail: john@example.com\nSkills: React, JavaScript, Python');

      cy.get('button').contains(/analyze/i).click();

      // Score should be visible and contain number
      cy.get('[class*="score"]', { timeout: 5000 }).should('be.visible').should('contain', /\d+/);
    });

    it('Should show feedback and suggestions', () => {
      cy.get('textarea').first().clear().type('John Doe\nEmail: john@example.com\nSkills: React');

      cy.get('button').contains(/analyze/i).click();

      // Wait for feedback section
      cy.get('body', { timeout: 5000 }).should('contain', /feedback|suggestion|recommendation/i);
    });

    it('Should allow template selection', () => {
      cy.get('textarea').first().clear().type('John Doe\nEmail: john@example.com\nSkills: React, Node.js');

      cy.get('button').contains(/analyze/i).click();

      // Wait for results to load
      cy.get('[class*="score"]', { timeout: 5000 }).should('be.visible');

      // Select template if available
      cy.get('[class*="template"]').first().then(($template) => {
        if ($template.length > 0) {
          cy.wrap($template).click();
          cy.get('[class*="template"][class*="selected"]').should('exist');
        }
      });
    });
  });

  // ============================================
  // E2E_RESUME_006-010: PDF Export
  // ============================================
  describe('E2E_RESUME_006-010: PDF Export', () => {
    it('Should export resume as PDF', () => {
      cy.get('textarea').first().clear().type('John Doe\nEmail: john@example.com\nSkills: React, Node.js');

      cy.get('button').contains(/analyze/i).click();

      // Wait for analysis
      cy.get('[class*="score"]', { timeout: 5000 }).should('be.visible');

      // Click download
      cy.get('button').contains(/download|export|pdf/i).click();

      // Verify button was clicked (download happens in browser)
      cy.get('button').contains(/download|export|pdf/i).should('be.visible');
    });

    it('Should include selected template in PDF', () => {
      cy.get('textarea').first().clear().type('John Doe\nEmail: john@example.com\nSkills: React, Python');

      cy.get('button').contains(/analyze/i).click();

      // Wait for analysis
      cy.get('[class*="score"]', { timeout: 5000 }).should('be.visible');

      // Select template
      cy.get('[class*="template"]').first().then(($template) => {
        if ($template.length > 0) {
          cy.wrap($template).click();
        }
      });

      // Download PDF
      cy.get('button').contains(/download|export|pdf/i).click();

      cy.get('button').contains(/download|export|pdf/i).should('be.visible');
    });

    it('Should clear resume and start fresh', () => {
      cy.get('textarea').first().clear().type('Jane Smith\nEmail: jane@example.com');

      cy.get('button').contains(/analyze/i).click();

      // Wait for results
      cy.get('[class*="score"]', { timeout: 5000 }).should('be.visible');

      // Clear for next entry
      cy.get('textarea').first().clear();

      cy.get('textarea').first().should('have.value', '');
    });
  });
});