describe('E2E: Chatbot Functionality', () => {
  before(() => {
    cy.clearAppData();
    cy.registerNewUser();
  });

  beforeEach(() => {
    cy.loginWithRegisteredUser();
  });

  afterEach(() => {
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

  describe('E2E_CHATBOT_001: Chatbot UI', () => {
    it('Should display chatbot FAB button', () => {
      cy.get('.fab').first().should('be.visible');
      cy.get('.fab').first().should('contain', '💬');
    });

    it('Should open chatbot when FAB is clicked', () => {
      cy.get('.fab').first().click();
      cy.get('.chatbot-container.open', { timeout: 5000 }).should('be.visible');
      cy.get('.chat-header').should('contain', 'Resume Assistant');
    });

    it('Should close chatbot when close button is clicked', () => {
      cy.get('.fab').first().click();
      cy.get('.chatbot-container.open', { timeout: 5000 }).should('be.visible');
      
      cy.get('.chat-header .x').click();
      cy.get('.chatbot-container.open').should('not.exist');
    });

    it('Should display welcome message on open', () => {
      cy.get('.fab').first().click();
      cy.get('.chat-message.bot', { timeout: 5000 }).first().should('be.visible');
    });
  });

  describe('E2E_CHATBOT_002: Message Interaction', () => {
    beforeEach(() => {
      cy.get('.fab').first().click();
      cy.get('.chatbot-container.open', { timeout: 5000 }).should('be.visible');
    });

    it('Should send user message', () => {
      cy.get('.chat-input-row input').type('Hello');
      cy.get('.chat-input-row button').click();
      
      cy.get('.chat-message.user').should('contain', 'Hello');
    });

    it('Should receive bot response', () => {
      cy.get('.chat-input-row input').type('What is ATS?');
      cy.get('.chat-input-row button').click();
      
      cy.get('.chat-message.bot', { timeout: 15000 }).should('have.length.greaterThan', 1);
    });

    it('Should send message with Enter key', () => {
      cy.get('.chat-input-row input').type('Help{enter}');
      
      cy.get('.chat-message.user').should('contain', 'Help');
    });
  });

  describe('E2E_CHATBOT_003: Context-Aware Responses', () => {
    beforeEach(() => {
      cy.typeInResume('John Doe\n\nSkills\nReact, Node.js\n\nExperience\nSenior Developer');
      cy.get('.ats-analysis-card', { timeout: 15000 }).should('be.visible');
      
      cy.get('.fab').first().click();
      cy.get('.chatbot-container.open', { timeout: 5000 }).should('be.visible');
    });

    it('Should ask about ATS score', () => {
      cy.get('.chat-input-row input').type('What is my score?');
      cy.get('.chat-input-row button').click();
      
      cy.get('.chat-message.bot', { timeout: 15000 }).last().should('be.visible');
    });
  });
});