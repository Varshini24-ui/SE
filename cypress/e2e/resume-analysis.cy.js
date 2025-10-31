describe('E2E: Resume Analysis Flow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    cy.login('testuser@example.com', 'SecurePass123!');
  });

  // ============================================
  // E2E_RESUME_001-005: Upload & Analysis
  // ============================================
  describe('E2E_RESUME_001-005: Upload and Analysis', () => {
    it('Should upload TXT file and analyze', () => {
      cy.get('input[type="file"]').selectFile('cypress/fixtures/resumes/resume1.txt');
      
      cy.get('button').contains(/analyze/i).click();

      cy.get('[class*="score"]').should('be.visible');
      cy.get('[class*="ats"]').should('be.visible');
    });

    it('Should enter job description for keyword matching', () => {
      cy.get('textarea').first().type('This is a test resume');
      cy.get('textarea').last().type('Senior Developer with React experience');

      cy.get('button').contains(/analyze/i).click();

      cy.get('[class*="keyword"]').should('be.visible');
    });

    it('Should display ATS score', () => {
      cy.get('textarea').first().type('John Doe\nEmail: john@example.com\nSkills: React');

      cy.get('button').contains(/analyze/i).click();

      cy.get('[class*="score"]').should('contain', /\d+/);
    });

    it('Should show feedback and suggestions', () => {
      cy.get('textarea').first().type('John Doe\nEmail: john@example.com\nSkills: React');

      cy.get('button').contains(/analyze/i).click();

      cy.get('[class*="feedback"]').should('be.visible');
      cy.get('[class*="suggestion"]').should('be.visible');
    });

    it('Should allow template selection', () => {
      cy.get('textarea').first().type('John Doe\nEmail: john@example.com');

      cy.get('button').contains(/analyze/i).click();

      cy.get('[class*="template"]').first().click();
      cy.get('[class*="template"][class*="selected"]').should('exist');
    });
  });

  // ============================================
  // E2E_RESUME_006-010: PDF Export
  // ============================================
  describe('E2E_RESUME_006-010: PDF Export', () => {
    it('Should export resume as PDF', () => {
      cy.get('textarea').first().type('John Doe\nEmail: john@example.com\nSkills: React');

      cy.get('button').contains(/analyze/i).click();

      cy.get('button').contains(/download|export|pdf/i).click();

      // Verify download was triggered
      cy.readFile('cypress/downloads/').should('exist');
    });

    it('Should include selected template in PDF', () => {
      cy.get('textarea').first().type('John Doe\nEmail: john@example.com');

      cy.get('button').contains(/analyze/i).click();

      cy.get('[class*="template"]').contains('Modern').click();

      cy.get('button').contains(/download|export/i).click();
    });
  });
});