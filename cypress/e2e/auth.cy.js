describe('E2E: Authentication Flow', () => {
  beforeEach(() => {
    cy.clearAppData();
    cy.visit('/');
    cy.waitForAppLoad();
  });

  describe('E2E_AUTH_001: Registration Tests', () => {
    it('Should display registration form with all required fields', () => {
      cy.contains('button', /register|need|sign up/i).should('be.visible').click();
      cy.get('h2').contains(/register/i).should('be.visible');
      
      cy.get('input[type="text"][placeholder*="Username"]').should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="tel"][placeholder*="Contact"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('Should register new user successfully with username and contact info', () => {
      cy.registerNewUser().then((user) => {
        cy.log(`Registered user: ${user.email}`);
        cy.get('.user-email').should('contain', user.username);
      });
    });

    it('Should validate username minimum length (3 characters)', () => {
      cy.contains('button', /register|need/i).click();
      cy.get('input[type="text"][placeholder*="Username"]').clear().type('ab');
      cy.get('input[type="email"]').clear().type('test@example.com');
      cy.get('input[type="tel"][placeholder*="Contact"]').clear().type('5551234567');
      cy.get('input[type="password"]').clear().type('ValidPassword123!');
      cy.get('button[type="submit"]').click();
      
      cy.get('.error', { timeout: 5000 }).should('contain', 'Username must be at least 3 characters');
    });

    it('Should validate contact info minimum length', () => {
      cy.contains('button', /register|need/i).click();
      cy.get('input[type="text"][placeholder*="Username"]').clear().type('ValidUser');
      cy.get('input[type="email"]').clear().type('test@example.com');
      cy.get('input[type="tel"][placeholder*="Contact"]').clear().type('123');
      cy.get('input[type="password"]').clear().type('ValidPassword123!');
      cy.get('button[type="submit"]').click();
      
      cy.get('.error', { timeout: 5000 }).should('contain', 'contact');
    });

    it('Should validate email format', () => {
      cy.contains('button', /register|need/i).click();
      cy.get('input[type="text"][placeholder*="Username"]').clear().type('ValidUser');
      cy.get('input[type="email"]').clear().type('invalid-email');
      cy.get('input[type="tel"][placeholder*="Contact"]').clear().type('5551234567');
      cy.get('input[type="password"]').clear().type('ValidPassword123!');
      
      cy.get('input[type="email"]:invalid').should('exist');
    });

    it('Should clear form when switching to registration', () => {
      cy.get('input[type="email"]').type('some@email.com');
      cy.contains('button', /register|need/i).click();
      
      cy.get('input[type="email"]').should('have.value', '');
      cy.get('input[type="text"][placeholder*="Username"]').should('have.value', '');
      cy.get('input[type="tel"][placeholder*="Contact"]').should('have.value', '');
    });
  });

  describe('E2E_AUTH_002: Login Tests', () => {
    beforeEach(() => {
      cy.registerNewUser();
      cy.get('button.logout-btn').click();
      cy.wait(1000);
      cy.waitForAppLoad();
    });

    it('Should display login form by default', () => {
      cy.get('.auth-card').should('be.visible');
      cy.get('h2').contains(/login/i).should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      
      cy.get('input[type="text"][placeholder*="Username"]').should('not.exist');
      cy.get('input[type="tel"][placeholder*="Contact"]').should('not.exist');
    });

    it('Should login with registered user credentials', () => {
      cy.getRegisteredUser().then((user) => {
        cy.get('input[type="email"]').clear().type(user.email);
        cy.get('input[type="password"]').clear().type(user.password);
        cy.get('button[type="submit"]').click();
        
        cy.contains('button', /logout/i, { timeout: 10000 }).should('be.visible');
        cy.get('.user-email').should('contain', user.username);
      });
    });

    it('Should persist session on page reload', () => {
      cy.loginWithRegisteredUser();
      
      cy.reload();
      
      cy.contains('button', /logout/i, { timeout: 10000 }).should('be.visible');
      cy.get('.user-email').should('be.visible');
    });

    it('Should logout successfully and clear session', () => {
      cy.loginWithRegisteredUser();
      
      cy.get('button.logout-btn').should('be.visible').click();
      cy.wait(1000);
      cy.get('.auth-card').should('be.visible');
      cy.get('h2').contains(/login/i).should('be.visible');
    });

    it('Should clear session storage on logout', () => {
      cy.loginWithRegisteredUser();
      
      cy.get('button.logout-btn').click();
      cy.wait(1000);
      
      cy.window().then((win) => {
        expect(win.sessionStorage.getItem('RA_SESSION_AUTH')).to.be.null;
      });
    });
  });

  describe('E2E_AUTH_003: Toggle Between Login/Register', () => {
    it('Should switch from login to register and show all fields', () => {
      cy.get('h2').contains(/login/i).should('be.visible');
      cy.contains('button', /need|register/i).click();
      cy.get('h2').contains(/register/i).should('be.visible');
      
      cy.get('input[type="text"][placeholder*="Username"]').should('be.visible');
      cy.get('input[type="tel"][placeholder*="Contact"]').should('be.visible');
    });

    it('Should switch from register to login and hide extra fields', () => {
      cy.contains('button', /need|register/i).click();
      cy.get('h2').contains(/register/i).should('be.visible');
      
      cy.contains('button', /already|login/i).click();
      cy.get('h2').contains(/login/i).should('be.visible');
      
      cy.get('input[type="text"][placeholder*="Username"]').should('not.exist');
      cy.get('input[type="tel"][placeholder*="Contact"]').should('not.exist');
    });
  });
});