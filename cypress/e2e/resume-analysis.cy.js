describe('E2E: Resume Analysis Flow', () => {
  before(() => {
    cy.clearAppData();
    cy.registerNewUser();
  });

  beforeEach(() => {
    cy.loginWithRegisteredUser();
  });

  afterEach(() => {
    // FIXED: Direct logout without safeLogout
    cy.window().then((win) => {
      const logoutBtn = win.document.querySelector('button.logout-btn');
      if (logoutBtn) {
        cy.get('button.logout-btn').first().click();
        cy.wait(1000);
      }
    });
  });

  after(() => {
    cy.clearAppData();
  });

  describe('E2E_RESUME_001: Resume Input', () => {
    it('Should display resume input textarea', () => {
      cy.get('textarea').first().should('be.visible');
      cy.get('textarea').first()
        .invoke('attr', 'placeholder')
        .should('match', /resume/i);
    });

    it('Should enter resume text', () => {
      const resumeText = 'John Doe\nEmail: john@example.com\nPhone: (555) 123-4567\n\nSummary\nExperienced developer\n\nSkills\nReact, Node.js, MongoDB\n\nExperience\nSenior Developer at TechCorp\n\nEducation\nBS Computer Science';
      
      cy.typeInResume(resumeText);
      cy.get('textarea').first().should('contain.value', 'John Doe');
    });

    it('Should handle large resume text', () => {
      const largeResume = 'John Doe\n' + 'Skills: React, Node.js\n'.repeat(30);
      
      cy.typeInResume(largeResume);
      cy.get('textarea').first().should('not.be.empty');
    });

    it('Should upload TXT file successfully', () => {
      const fileContent = 'John Smith\nEmail: john.smith@email.com\nPhone: (555) 123-4567\n\nSummary\nExperienced developer\n\nSkills\nReact, Node.js, MongoDB\n\nExperience\nSenior Developer';
      
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(fileContent),
        fileName: 'resume.txt',
        mimeType: 'text/plain',
      }, { force: true });
      
      cy.wait(2000);
      cy.get('textarea').first().should('not.be.empty');
    });

    it('Should show warning for PDF files', () => {
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('dummy pdf content'),
        fileName: 'resume.pdf',
        mimeType: 'application/pdf',
      }, { force: true });
      
      cy.get('.file-error', { timeout: 5000 }).should('be.visible');
      cy.wait(1000);
      cy.get('textarea').first().should('not.be.empty');
    });

    it('Should validate file size limit (2MB)', () => {
      const largeContent = 'x'.repeat(3 * 1024 * 1024);
      
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(largeContent),
        fileName: 'large.txt',
        mimeType: 'text/plain',
      }, { force: true });
      
      cy.get('.file-error', { timeout: 5000 }).should('contain', 'large');
    });

    it('Should clear previous content when new file is uploaded', () => {
      cy.typeInResume('Old content');
      
      const newFileContent = 'New resume content from file upload';
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(newFileContent),
        fileName: 'resume.txt',
        mimeType: 'text/plain',
      }, { force: true });
      
      cy.wait(2000);
      cy.get('textarea').first().should('not.contain.value', 'Old content');
    });
  });

  describe('E2E_RESUME_002: Job Description Input', () => {
    it('Should display job description textarea', () => {
      cy.get('textarea').last().should('be.visible');
      cy.get('textarea').last()
        .invoke('attr', 'placeholder')
        .should('match', /Job Description/i);
    });

    it('Should enter job description', () => {
      const jdText = 'Looking for Senior Developer with React and Node.js experience.';
      
      cy.typeInJD(jdText);
      cy.get('textarea').last().should('contain.value', 'Senior Developer');
    });

    it('Should display hint about JD importance', () => {
      cy.contains(/JD|job description/i).should('be.visible');
    });

    it('Should analyze without job description', () => {
      cy.typeInResume('John Doe\nDeveloper');
      cy.get('.ats-analysis-card', { timeout: 15000 }).should('be.visible');
    });
  });

  describe('E2E_RESUME_003: Real-time Analysis', () => {
    it('Should automatically analyze on resume text change', () => {
      cy.typeInResume('John Doe\nEmail: john@example.com\n\nSummary\nExperienced developer\n\nSkills\nReact, Node.js\n\nExperience\nSenior Developer\n\nEducation\nBS CS');
      
      cy.get('.ats-analysis-card', { timeout: 15000 }).should('be.visible');
      cy.get('.score-num').should('be.visible').and('not.be.empty');
    });

    it('Should update score when JD is added', () => {
      cy.typeInResume('John Doe\n\nSkills\nReact, Node.js, MongoDB');
      
      cy.get('.score-num', { timeout: 15000 }).should('be.visible');
      
      cy.typeInJD('We need React, Node.js, MongoDB skills');
      
      cy.wait(2000);
      cy.get('.score-num').should('be.visible');
    });

    it('Should display feedback automatically', () => {
      cy.typeInResume('John Doe\nDeveloper');
      
      cy.get('.feedback-list', { timeout: 15000 }).should('be.visible');
      cy.get('.feedback-list li').should('have.length.greaterThan', 0);
    });

    it('Should calculate higher score with complete sections', () => {
      const fullResume = 'John Doe\nEmail: john@example.com\nPhone: 555-1234\n\nSummary\nExperienced Developer with 5+ years\n\nSkills\nReact, Node.js, MongoDB, Docker\n\nExperience\nSenior Developer\n\nEducation\nBS Computer Science';
      
      cy.typeInResume(fullResume);
      
      cy.get('.score-num', { timeout: 15000 })
        .invoke('text')
        .then(parseFloat)
        .should('be.gte', 40);
    });

    it('Should match keywords from job description', () => {
      cy.typeInResume('John Doe\nEmail: john@example.com\n\nSkills\nReact, Node.js, MongoDB, Python, Docker');
      cy.typeInJD('We need React, Node.js, MongoDB, Python, Docker skills');
      
      cy.get('.score-num', { timeout: 15000 })
        .invoke('text')
        .then(parseFloat)
        .should('be.gte', 30);
    });
  });

  describe('E2E_RESUME_004: Template Selection', () => {
    beforeEach(() => {
      cy.typeInResume('John Doe\nEmail: john@example.com\n\nSummary\nDeveloper\n\nSkills\nReact\n\nExperience\nDeveloper\n\nEducation\nBS CS');
      cy.get('.ats-analysis-card', { timeout: 15000 }).should('be.visible');
    });

    it('Should display template options', () => {
      cy.get('.template-grid').should('be.visible');
      cy.get('.template-card').should('have.length', 3);
    });

    it('Should select Modern template', () => {
      cy.get('.template-card').contains('Modern').click();
      cy.get('.template-card.selected').should('contain', 'Modern');
    });

    it('Should select Minimal template', () => {
      cy.get('.template-card').contains('Minimal').click();
      cy.get('.template-card.selected').should('contain', 'Minimal');
    });

    it('Should select Classic template', () => {
      cy.get('.template-card').contains('Classic').click();
      cy.get('.template-card.selected').should('contain', 'Classic');
    });

    it('Should update preview when template changes', () => {
      cy.get('.template-card').contains('Classic').click();
      cy.get('.resume-sheet').should('have.class', 'theme-classic');
      
      cy.get('.template-card').contains('Minimal').click();
      cy.get('.resume-sheet').should('have.class', 'theme-minimal');
    });
  });

  describe('E2E_RESUME_005: PDF Export', () => {
    beforeEach(() => {
      cy.typeInResume('John Doe\nEmail: john@example.com\n\nSummary\nDeveloper\n\nSkills\nReact\n\nExperience\nDeveloper');
      cy.get('.ats-analysis-card', { timeout: 15000 }).should('be.visible');
    });

    it('Should display download button', () => {
      cy.get('button').contains(/download/i).should('be.visible');
      cy.get('button').contains(/download/i).should('not.be.disabled');
    });

    it('Should show correct template name in download button', () => {
      cy.get('.template-card').contains('Modern').click();
      cy.get('button').contains(/download/i).should('contain', 'Modern');
    });
  });

  describe('E2E_RESUME_006: Data Extraction', () => {
    it('Should extract and display contact information', () => {
      const resumeWithContact = 'John Doe\nEmail: john@example.com\nPhone: (555) 123-4567\n\nSummary\nDeveloper';
      
      cy.typeInResume(resumeWithContact);
      
      cy.get('.extracted-section', { timeout: 15000 }).should('be.visible');
      cy.get('.extracted-section').should('contain', 'john@example.com');
    });
  });

  describe('E2E_RESUME_007: Resume Preview', () => {
    beforeEach(() => {
      cy.typeInResume('John Doe\nEmail: john@example.com\n\nSummary\nDeveloper');
      cy.get('.ats-analysis-card', { timeout: 15000 }).should('be.visible');
    });

    it('Should display resume preview', () => {
      cy.get('.resume-sheet').should('be.visible');
    });

    it('Should show candidate name in preview', () => {
      cy.get('.name').should('contain', 'John Doe');
    });

    it('Should show avatar with first letter', () => {
      cy.get('.avatar').should('contain', 'J');
    });
  });

  describe('E2E_RESUME_008: Data Persistence', () => {
    it('Should persist resume data in localStorage', () => {
      cy.getRegisteredUser().then((user) => {
        const resumeText = 'John Doe\nDeveloper with skills';
        
        cy.typeInResume(resumeText);
        
        cy.wait(2000);
        cy.window().then((win) => {
          const storageKey = `RA_RESUME_${user.email}`;
          const stored = win.localStorage.getItem(storageKey);
          expect(stored).to.not.be.null;
        });
      });
    });

    it('Should load persisted data on page reload', () => {
      cy.typeInResume('Test Resume For Persistence');
      
      cy.wait(2000);
      cy.reload();
      cy.contains('button', /logout/i, { timeout: 15000 }).should('be.visible');
      cy.wait(2000);
      cy.get('textarea').first().should('contain.value', 'Test Resume');
    });
  });
});