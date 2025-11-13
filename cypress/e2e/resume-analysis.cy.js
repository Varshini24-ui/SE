describe('E2E: Resume Analysis Flow', () => {
  beforeEach(() => {
    cy.clearAppData();
    cy.loginUser('alpha123@gmail.com', 'yourPassword');
  });

  describe('E2E_RESUME_001: Resume Input', () => {
    it('Should display resume input textarea', () => {
      cy.get('textarea').first().should('be.visible');
      cy.get('textarea').first()
        .invoke('attr', 'placeholder')
        .should('include', 'resume');
    });

    it('Should enter resume text', () => {
      const resumeText = 'John Doe\nEmail: john@example.com\nPhone: (555) 123-4567\n\nSummary\nExperienced developer\n\nSkills\nReact, Node.js, MongoDB\n\nExperience\nSenior Developer at TechCorp';
      
      cy.get('textarea').first().clear().type(resumeText, { delay: 0 });
      cy.get('textarea').first().should('contain.value', 'John Doe');
    });

    it('Should handle large resume text', () => {
      const largeResume = 'John Doe\n'.repeat(100) + 'Skills\nReact, Node.js\n'.repeat(50);
      
      cy.get('textarea').first().clear().type(largeResume, { delay: 0 });
      cy.get('textarea').first().should('not.be.empty');
    });

    it('Should upload TXT file successfully', () => {
      cy.fixture('resumes/resume1.txt').then(fileContent => {
        cy.get('input[type="file"]').selectFile({
          contents: Cypress.Buffer.from(fileContent),
          fileName: 'resume.txt',
          mimeType: 'text/plain',
        }, { force: true });
        
        cy.get('textarea').first().should('not.be.empty');
      });
    });

    it('Should show warning for PDF files', () => {
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('dummy pdf content'),
        fileName: 'resume.pdf',
        mimeType: 'application/pdf',
      }, { force: true });
      
      cy.get('.hint', { timeout: 5000 }).should('contain', 'PDF');
    });

    it('Should validate file size limit (2MB)', () => {
      const largeContent = 'x'.repeat(3 * 1024 * 1024); // 3MB
      
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(largeContent),
        fileName: 'large.txt',
        mimeType: 'text/plain',
      }, { force: true });
      
      cy.get('.hint', { timeout: 5000 }).should('contain', 'large');
    });

    it('Should clear previous content when new file is uploaded', () => {
      cy.get('textarea').first().clear().type('Old content');
      
      cy.fixture('resumes/resume1.txt').then(fileContent => {
        cy.get('input[type="file"]').selectFile({
          contents: Cypress.Buffer.from(fileContent),
          fileName: 'resume.txt',
          mimeType: 'text/plain',
        }, { force: true });
        
        cy.get('textarea').first().should('not.contain.value', 'Old content');
      });
    });
  });

  describe('E2E_RESUME_002: Job Description Input', () => {
    it('Should display job description textarea', () => {
      cy.get('textarea').last().should('be.visible');
      cy.get('textarea').last()
        .invoke('attr', 'placeholder')
        .should('include', 'Job Description');
    });

    it('Should enter job description', () => {
      const jdText = 'Looking for Senior Developer with React and Node.js experience. Must have 5+ years experience.';
      
      cy.get('textarea').last().clear().type(jdText, { delay: 0 });
      cy.get('textarea').last().should('contain.value', 'Senior Developer');
    });

    it('Should work without job description', () => {
      cy.get('textarea').first().clear().type('John Doe\nDeveloper');
      cy.get('button').contains(/analyze/i).should('not.be.disabled');
    });
  });

  describe('E2E_RESUME_003: Job Role Selection', () => {
    it('Should display job role dropdown', () => {
      cy.get('#job-role').should('be.visible');
    });

    it('Should have default job role selected', () => {
      cy.get('#job-role').should('have.value');
    });

    it('Should select Software Engineer role', () => {
      cy.get('#job-role').select('software_engineer');
      cy.get('#job-role').should('have.value', 'software_engineer');
    });

    it('Should select Data Analyst role', () => {
      cy.get('#job-role').select('data_analyst');
      cy.get('#job-role').should('have.value', 'data_analyst');
    });

    it('Should select Product Manager role', () => {
      cy.get('#job-role').select('product_manager');
      cy.get('#job-role').should('have.value', 'product_manager');
    });

    it('Should select Consultant role', () => {
      cy.get('#job-role').select('consultant');
      cy.get('#job-role').should('have.value', 'consultant');
    });
  });

  describe('E2E_RESUME_004: Analysis Execution', () => {
    it('Should analyze resume and display score', () => {
      cy.get('textarea').first().clear().type('John Doe\nEmail: john@example.com\n\nSummary\nExperienced developer\n\nSkills\nReact, Node.js\n\nExperience\nSenior Developer\n\nEducation\nBS CS\n\nProjects\nPortfolio', { delay: 0 });
      cy.get('textarea').last().clear().type('Senior Developer with React and Node.js', { delay: 0 });
      
      cy.get('button').contains(/analyze/i).click();
      
      cy.get('.ats-analysis-card', { timeout: 10000 }).should('be.visible');
      cy.get('.score-num').should('be.visible').and('not.be.empty');
    });

    it('Should require resume text before analysis', () => {
      cy.get('textarea').first().clear();
      cy.get('button').contains(/analyze/i).should('be.disabled');
    });

    it('Should display feedback after analysis', () => {
      cy.get('textarea').first().clear().type('John Doe\nEmail: john@example.com\n\nSummary\nDeveloper\n\nSkills\nReact\n\nExperience\nDeveloper', { delay: 0 });
      cy.get('button').contains(/analyze/i).click();
      
      cy.get('.feedback-list', { timeout: 10000 }).should('be.visible');
      cy.get('.feedback-list li').should('have.length.greaterThan', 0);
    });

    it('Should calculate higher score with complete sections', () => {
      const fullResume = 'John Doe\nEmail: john@example.com\nPhone: 555-1234\n\nSummary\nExperienced Developer with 5+ years\n\nSkills\nReact, Node.js, MongoDB, Docker\n\nExperience\nSenior Developer at TechCorp\nSpearheaded development projects\n\nEducation\nBS Computer Science from University\n\nProjects\nE-commerce Platform\nPortfolio Website';
      
      cy.get('textarea').first().clear().type(fullResume, { delay: 0 });
      cy.get('button').contains(/analyze/i).click();
      
      cy.get('.score-num', { timeout: 10000 })
        .invoke('text')
        .then(parseFloat)
        .should('be.gte', 40);
    });

    it('Should match keywords from job description', () => {
      cy.get('textarea').first().clear().type('John Doe\nEmail: john@example.com\n\nSkills\nReact, Node.js, MongoDB, Python, Docker', { delay: 0 });
      cy.get('textarea').last().clear().type('We need React, Node.js, MongoDB, Python, Docker skills', { delay: 0 });
      cy.get('button').contains(/analyze/i).click();
      
      cy.get('.score-num', { timeout: 10000 })
        .invoke('text')
        .then(parseFloat)
        .should('be.gte', 30);
    });

    it('Should scroll to analysis results after analyzing', () => {
      cy.get('textarea').first().clear().type('John Doe\nDeveloper', { delay: 0 });
      cy.get('button').contains(/analyze/i).click();
      
      cy.get('.ats-analysis-card', { timeout: 10000 }).should('be.visible');
      cy.get('.ats-analysis-card').should('be.inViewport');
    });
  });

  describe('E2E_RESUME_005: Template Selection', () => {
    beforeEach(() => {
      cy.get('textarea').first().clear().type('John Doe\nEmail: john@example.com\n\nSummary\nDeveloper\n\nSkills\nReact\n\nExperience\nDeveloper', { delay: 0 });
      cy.get('button').contains(/analyze/i).click();
      cy.get('.ats-analysis-card', { timeout: 10000 }).should('be.visible');
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
    });

    it('Should show role-based template recommendation', () => {
      cy.get('.template-recommendation').should('be.visible');
    });

    it('Should apply recommended template', () => {
      cy.get('.btn-apply-template').then(($btn) => {
        if ($btn.length > 0) {
          cy.wrap($btn).first().click();
          cy.get('.template-card.selected').should('be.visible');
        }
      });
    });
  });

  describe('E2E_RESUME_006: PDF Export', () => {
    beforeEach(() => {
      cy.get('textarea').first().clear().type('John Doe\nEmail: john@example.com\n\nSummary\nDeveloper\n\nSkills\nReact\n\nExperience\nDeveloper', { delay: 0 });
      cy.get('button').contains(/analyze/i).click();
      cy.get('.ats-analysis-card', { timeout: 10000 }).should('be.visible');
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

  describe('E2E_RESUME_007: Data Persistence', () => {
    it('Should persist resume data in localStorage', () => {
      const resumeText = 'John Doe\nDeveloper with skills';
      const jdText = 'Looking for developer';
      
      cy.get('textarea').first().clear().type(resumeText, { delay: 0 });
      cy.get('textarea').last().clear().type(jdText, { delay: 0 });
      cy.get('button').contains(/analyze/i).click();
      
      cy.window().then((win) => {
        const stored = win.localStorage.getItem('RA_RESUME_alpha123@gmail.com');
        expect(stored).to.not.be.null;
        expect(stored).to.include('John Doe');
      });
    });

    it('Should load persisted data on page reload', () => {
      cy.get('textarea').first().clear().type('Test Resume Content For Persistence', { delay: 0 });
      cy.get('button').contains(/analyze/i).click();
      cy.get('.ats-analysis-card', { timeout: 10000 }).should('be.visible');
      
      cy.reload();
      cy.contains('button', /logout/i, { timeout: 10000 }).should('be.visible');
      cy.get('textarea').first().should('contain.value', 'Test Resume Content');
    });

    it('Should maintain analysis state after reload', () => {
      cy.get('textarea').first().clear().type('John Doe\nDeveloper', { delay: 0 });
      cy.get('button').contains(/analyze/i).click();
      cy.get('.ats-analysis-card', { timeout: 10000 }).should('be.visible');
      
      const scoreValue = cy.get('.score-num').invoke('text');
      
      cy.reload();
      cy.contains('button', /logout/i, { timeout: 10000 }).should('be.visible');
      cy.get('.ats-analysis-card', { timeout: 10000 }).should('be.visible');
    });
  });

  describe('E2E_RESUME_008: Resume Preview', () => {
    beforeEach(() => {
      cy.get('textarea').first().clear().type('John Doe\nEmail: john@example.com\n\nSummary\nExperienced Developer', { delay: 0 });
      cy.get('button').contains(/analyze/i).click();
      cy.get('.ats-analysis-card', { timeout: 10000 }).should('be.visible');
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

    it('Should update preview when template changes', () => {
      cy.get('.template-card').contains('Classic').click();
      cy.get('.resume-sheet').should('have.class', 'theme-classic');
      
      cy.get('.template-card').contains('Minimal').click();
      cy.get('.resume-sheet').should('have.class', 'theme-minimal');
    });

    it('Should display resume content in preview', () => {
      cy.get('.sheet-body').should('be.visible');
      cy.get('.sheet-body').should('not.be.empty');
    });
  });
});