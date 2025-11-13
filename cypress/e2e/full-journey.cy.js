describe('E2E: Complete User Journey', () => {
  describe('E2E_JOURNEY_001: Full Workflow - Registration to Export', () => {
    it('Should complete entire workflow from registration to analysis', () => {
      cy.clearAppData();
      cy.visit('/');
      cy.waitForAppLoad();

      // Step 1: Register new user
      const testEmail = `journey${Date.now()}@example.com`;
      cy.log('Step 1: Registering new user');
      cy.contains('button', /register|need/i).click();
      cy.get('input[type="email"]').clear().type(testEmail);
      cy.get('input[type="password"]').clear().type('JourneyPass123!');
      cy.get('button[type="submit"]').click();
      cy.contains('button', /logout/i, { timeout: 10000 }).should('be.visible');

      // Step 2: Enter resume content
      cy.log('Step 2: Entering resume content');
      const resumeText = 'John Doe\nEmail: john@example.com\nPhone: (555) 123-4567\n\nSummary\nExperienced full-stack developer with 5+ years in web technologies\n\nSkills\nReact, Node.js, MongoDB, Docker, Kubernetes\n\nExperience\nSenior Developer at TechCorp\nSpearheaded development of microservices architecture\nOptimized database queries for better performance\n\nEducation\nBS Computer Science, State University\n\nProjects\nE-commerce Platform using MERN stack\nPortfolio Website with React';
      cy.get('textarea').first().clear().type(resumeText, { delay: 0 });

      // Step 3: Enter job description
      cy.log('Step 3: Entering job description');
      const jdText = 'Senior Full Stack Developer with expertise in React, Node.js, MongoDB. Experience with Docker and Kubernetes preferred. 5+ years required.';
      cy.get('textarea').last().clear().type(jdText, { delay: 0 });

      // Step 4: Select job role
      cy.log('Step 4: Selecting job role');
      cy.get('#job-role').select('software_engineer');

      // Step 5: Analyze resume
      cy.log('Step 5: Analyzing resume');
      cy.get('button').contains(/analyze/i).click();
      cy.get('.ats-analysis-card', { timeout: 10000 }).should('be.visible');

      // Step 6: Verify score is displayed
      cy.log('Step 6: Verifying ATS score');
      cy.get('.score-num')
        .should('be.visible')
        .invoke('text')
        .then(parseFloat)
        .should('be.gte', 30);

      // Step 7: Check feedback
      cy.log('Step 7: Checking feedback');
      cy.get('.feedback-list li').should('have.length.greaterThan', 0);

      // Step 8: Select template
      cy.log('Step 8: Selecting template');
      cy.get('.template-card').contains('Minimal').click();
      cy.get('.template-card.selected').should('contain', 'Minimal');

      // Step 9: Verify preview
      cy.log('Step 9: Verifying resume preview');
      cy.get('.resume-sheet').should('be.visible');
      cy.get('.name').should('contain', 'John Doe');

      // Step 10: Verify download button
      cy.log('Step 10: Verifying download button');
      cy.get('button').contains(/download/i).should('be.visible').should('not.be.disabled');

      // Step 11: Logout
      cy.log('Step 11: Logging out');
      cy.get('button.logout-btn').click();
      cy.get('.auth-card').should('be.visible');
    });
  });

  describe('E2E_JOURNEY_002: Login and Continue Workflow', () => {
    it('Should login and continue previous work', () => {
      cy.clearAppData();
      cy.visit('/');
      
      // Login
      cy.log('Logging in with existing credentials');
      cy.get('input[type="email"]').clear().type('alpha123@gmail.com');
      cy.get('input[type="password"]').clear().type('yourPassword');
      cy.get('button[type="submit"]').click();
      cy.contains('button', /logout/i, { timeout: 10000 }).should('be.visible');

      // Add resume content
      cy.log('Adding resume content');
      cy.get('textarea').first().clear().type('New Resume Content for Testing', { delay: 0 });
      cy.get('button').contains(/analyze/i).click();
      cy.get('.ats-analysis-card', { timeout: 10000 }).should('be.visible');

      // Reload and verify persistence
      cy.log('Reloading page to test persistence');
      cy.reload();
      cy.contains('button', /logout/i, { timeout: 10000 }).should('be.visible');
      cy.get('textarea').first().should('contain.value', 'New Resume Content');
    });
  });

  describe('E2E_JOURNEY_003: Error Handling and Edge Cases', () => {
    beforeEach(() => {
      cy.clearAppData();
      cy.loginUser('alpha123@gmail.com', 'yourPassword');
    });

    it('Should handle empty resume gracefully', () => {
      cy.get('textarea').first().clear();
      cy.get('button').contains(/analyze/i).should('be.disabled');
    });

    it('Should handle large file upload error', () => {
      const largeContent = 'x'.repeat(3 * 1024 * 1024); // 3MB
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(largeContent),
        fileName: 'large.txt',
        mimeType: 'text/plain',
      }, { force: true });
      
      cy.get('.hint', { timeout: 5000 }).should('contain', 'large');
    });

    it('Should handle special characters in resume', () => {
      const specialResume = 'John Doe™\nEmail: john+test@example.com\n\nSkills\nC++, C#, React.js\n\nExperience\n• Developed apps\n• Improved performance by 50%';
      cy.get('textarea').first().clear().type(specialResume, { delay: 0 });
      cy.get('button').contains(/analyze/i).click();
      cy.get('.ats-analysis-card', { timeout: 10000 }).should('be.visible');
    });

    it('Should handle multiple rapid template changes', () => {
      cy.get('textarea').first().clear().type('John Doe\nDeveloper', { delay: 0 });
      cy.get('button').contains(/analyze/i).click();
      cy.get('.ats-analysis-card', { timeout: 10000 }).should('be.visible');

      cy.get('.template-card').contains('Modern').click();
      cy.get('.template-card').contains('Minimal').click();
      cy.get('.template-card').contains('Classic').click();
      
      cy.get('.template-card.selected').should('contain', 'Classic');
      cy.get('.resume-sheet').should('have.class', 'theme-classic');
    });
  });

  describe('E2E_JOURNEY_004: Multi-Session Data Persistence', () => {
    it('Should maintain data across page reloads', () => {
      cy.clearAppData();
      cy.loginUser('alpha123@gmail.com', 'yourPassword');

      const persistentResume = 'Persistent Resume Data Test\nThis should survive page reloads';
      cy.get('textarea').first().clear().type(persistentResume, { delay: 0 });
      cy.get('button').contains(/analyze/i).click();
      cy.get('.ats-analysis-card', { timeout: 10000 }).should('be.visible');

      // First reload
      cy.reload();
      cy.contains('button', /logout/i, { timeout: 10000 }).should('be.visible');
      cy.get('textarea').first().should('contain.value', 'Persistent Resume');

      // Second reload
      cy.reload();
      cy.contains('button', /logout/i, { timeout: 10000 }).should('be.visible');
      cy.get('textarea').first().should('contain.value', 'Persistent Resume');
    });

    it('Should clear data after logout', () => {
      cy.clearAppData();
      cy.loginUser('alpha123@gmail.com', 'yourPassword');

      cy.get('textarea').first().clear().type('Temporary Data', { delay: 0 });
      cy.get('button').contains(/analyze/i).click();

      // Logout
      cy.get('button.logout-btn').click();
      cy.get('.auth-card').should('be.visible');

      // Login again
      cy.get('input[type="email"]').clear().type('alpha123@gmail.com');
      cy.get('input[type="password"]').clear().type('yourPassword');
      cy.get('button[type="submit"]').click();
      cy.contains('button', /logout/i, { timeout: 10000 }).should('be.visible');

      // Data should still be there (localStorage persists)
      cy.get('textarea').first().should('contain.value', 'Temporary Data');
    });
  });

  describe('E2E_JOURNEY_005: Accessibility and UI Behavior', () => {
    beforeEach(() => {
      cy.clearAppData();
      cy.loginUser('alpha123@gmail.com', 'yourPassword');
    });

    it('Should have accessible form elements', () => {
      cy.get('textarea').first().should('have.attr', 'placeholder');
      cy.get('#job-role').should('have.attr', 'id');
      cy.get('button').contains(/analyze/i).should('be.visible');
    });

    it('Should show analysis results in viewport', () => {
      cy.get('textarea').first().clear().type('John Doe\nDeveloper', { delay: 0 });
      cy.get('button').contains(/analyze/i).click();
      
      cy.get('.ats-analysis-card', { timeout: 10000 }).should('be.visible');
      cy.get('.ats-analysis-card').should('be.inViewport');
    });

    it('Should display all UI elements after analysis', () => {
      cy.get('textarea').first().clear().type('John Doe\nDeveloper', { delay: 0 });
      cy.get('button').contains(/analyze/i).click();
      
      cy.get('.score-ring', { timeout: 10000 }).should('be.visible');
      cy.get('.feedback-list').should('be.visible');
      cy.get('.template-grid').should('be.visible');
      cy.get('.resume-sheet').should('be.visible');
    });
  });
});