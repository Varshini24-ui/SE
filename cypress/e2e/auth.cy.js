describe('E2E: Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForAppLoad();
  });

  describe('E2E_AUTH_001: Registration Tests', () => {
    it('Should display registration form', () => {
      cy.contains('button', /register|need|sign up/i).should('be.visible').click();
      cy.get('h2').contains(/register/i).should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('Should register new user successfully', () => {
      const testEmail = `test${Date.now()}@example.com`;
      const testPassword = 'TestPassword123!';
      
      cy.contains('button', /register|need/i).click();
      cy.get('input[type="email"]').clear().type(testEmail);
      cy.get('input[type="password"]').clear().type(testPassword);
      cy.get('button[type="submit"]').click();
      
      // Verify successful registration
      cy.contains('button', /logout/i, { timeout: 10000 }).should('be.visible');
      cy.get('.user-email').should('contain', testEmail);
    });

    it('Should validate email format', () => {
      cy.contains('button', /register|need/i).click();
      cy.get('input[type="email"]').clear().type('invalid-email');
      cy.get('input[type="password"]').clear().type('ValidPassword123!');
      
      // HTML5 validation should prevent submission
      cy.get('input[type="email"]:invalid').should('exist');
    });

    it('Should require password field', () => {
      cy.contains('button', /register|need/i).click();
      cy.get('input[type="email"]').clear().type('test@example.com');
      cy.get('input[type="password"]').clear();
      
      // Password field should be required
      cy.get('input[type="password"]:invalid').should('exist');
    });
  });

  describe('E2E_AUTH_002: Login Tests', () => {
    it('Should display login form by default', () => {
      cy.get('.auth-card').should('be.visible');
      cy.get('h2').contains(/login/i).should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
    });

    it('Should login with valid credentials', () => {
      cy.get('input[type="email"]').clear().type('alpha123@gmail.com');
      cy.get('input[type="password"]').clear().type('yourPassword');
      cy.get('button[type="submit"]').click();
      
      cy.contains('button', /logout/i, { timeout: 10000 }).should('be.visible');
      cy.get('.user-email').should('be.visible');
    });

    it('Should persist session on page reload', () => {
      cy.get('input[type="email"]').clear().type('alpha123@gmail.com');
      cy.get('input[type="password"]').clear().type('yourPassword');
      cy.get('button[type="submit"]').click();
      
      cy.contains('button', /logout/i, { timeout: 10000 }).should('be.visible');
      
      // Reload page
      cy.reload();
      
      // Session should persist
      cy.contains('button', /logout/i, { timeout: 10000 }).should('be.visible');
      cy.get('.user-email').should('be.visible');
    });

    it('Should logout successfully', () => {
      cy.loginUser('alpha123@gmail.com', 'yourPassword');
      
      cy.get('button.logout-btn').should('be.visible').click();
      cy.get('.auth-card').should('be.visible');
      cy.get('h2').contains(/login/i).should('be.visible');
    });

    it('Should clear session storage on logout', () => {
      cy.loginUser('alpha123@gmail.com', 'yourPassword');
      
      cy.get('button.logout-btn').click();
      
      // Verify session storage is cleared
      cy.window().then((win) => {
        expect(win.sessionStorage.getItem('RA_SESSION_AUTH')).to.be.null;
      });
    });
  });

  describe('E2E_AUTH_003: Toggle Between Login/Register', () => {
    it('Should switch from login to register', () => {
      cy.get('h2').contains(/login/i).should('be.visible');
      cy.contains('button', /need|register/i).click();
      cy.get('h2').contains(/register/i).should('be.visible');
    });

    it('Should switch from register to login', () => {
      cy.contains('button', /need|register/i).click();
      cy.get('h2').contains(/register/i).should('be.visible');
      
      cy.contains('button', /already|login/i).click();
      cy.get('h2').contains(/login/i).should('be.visible');
    });
  });
});