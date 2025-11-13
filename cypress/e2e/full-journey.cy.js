describe('E2E: Complete User Journey', () => {
  afterEach(() => {
    cy.clearAppData();
  });

  describe('E2E_JOURNEY_001: Full Workflow', () => {
    it('Should complete entire workflow from registration to export', () => {
      cy.clearAppData();
      cy.visit('/');
      cy.waitForAppLoad();

      cy.log('Step 1: Registering new user');
      cy.registerNewUser().then((user) => {
        cy.log(`User registered: ${user.email}`);
        cy.get('.user-email').should('contain', user.username);

        cy.log('Step 2: Entering resume content');
        const resumeText = 'John Doe\nEmail: john@example.com\n\nSummary\nExperienced developer\n\nSkills\nReact, Node.js, MongoDB\n\nExperience\nSenior Developer\n\nEducation\nBS CS';
        cy.typeInResume(resumeText);

        cy.log('Step 3: Entering job description');
        const jdText = 'Senior Developer with React, Node.js, MongoDB experience.';
        cy.typeInJD(jdText);

        cy.log('Step 4: Verifying analysis');
        cy.get('.ats-analysis-card', { timeout: 15000 }).should('be.visible');

        cy.log('Step 5: Verifying score');
        cy.get('.score-num').should('be.visible');

        cy.log('Step 6: Selecting template');
        cy.get('.template-card').contains('Minimal').click();

        cy.log('Step 7: Testing chatbot');
        cy.get('.fab').first().click();
        cy.get('.chatbot-container.open').should('be.visible');
        cy.get('.chat-header .x').click();

        cy.log('Step 8: Verifying download button');
        cy.get('button').contains(/download/i).should('be.visible');

        cy.log('Step 9: Logging out');
        cy.get('button.logout-btn').click();
        cy.wait(1000);
      });
    });
  });

  describe('E2E_JOURNEY_002: Login and Continue', () => {
    it('Should login and continue work', () => {
      cy.clearAppData();
      cy.registerNewUser();
      cy.get('button.logout-btn').click();
      cy.wait(1000);
      
      cy.loginWithRegisteredUser();

      cy.typeInResume('Resume Content');
      cy.get('.ats-analysis-card', { timeout: 15000 }).should('be.visible');

      cy.reload();
      cy.contains('button', /logout/i, { timeout: 15000 }).should('be.visible');
      cy.wait(2000);
      cy.get('textarea').first().should('contain.value', 'Resume');
    });
  });
});