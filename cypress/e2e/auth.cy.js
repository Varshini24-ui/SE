describe('E2E: Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    cy.clearLocalStorage();
    cy.clearSessionStorage();
  });

  // ============================================
  // E2E_AUTH_001: User Registration
  // ============================================
  describe('E2E_AUTH_001-005: Registration Tests', () => {
    it('Should register new user successfully', () => {
      cy.get('button').contains(/register|need an account/i).click();
      
      cy.get('input[type="email"]').type('newuser@example.com');
      cy.get('input[type="password"]').type('SecurePass123!');
      cy.get('button[type="submit"]').click();

      cy.get('button').contains(/logout|resume/i).should('be.visible');
    });

    it('Should show error for invalid email', () => {
      cy.get('button').contains(/register/i).click();
      
      cy.get('input[type="email"]').type('invalidemail');
      cy.get('input[type="password"]').type('Password123!');
      cy.get('button[type="submit"]').click();

      cy.get('[class*="error"]').should('be.visible');
    });

    it('Should show error for weak password', () => {
      cy.get('button').contains(/register/i).click();
      
      cy.get('input[type="email"]').type('user@example.com');
      cy.get('input[type="password"]').type('123');
      cy.get('button[type="submit"]').click();

      cy.get('[class*="error"]').should('be.visible');
    });

    it('Should validate required fields', () => {
      cy.get('button').contains(/register/i).click();
      
      cy.get('button[type="submit"]').click();
      cy.get('[class*="error"]').should('be.visible');
    });

    it('Should hash password before sending', () => {
      cy.get('button').contains(/register/i).click();
      
      cy.get('input[type="email"]').type('user@example.com');
      cy.get('input[type="password"]').type('SecurePass123!');
      
      // Intercept network request to verify password is hashed
      cy.intercept('POST', '**').as('registerRequest');
      
      cy.get('button[type="submit"]').click();
      cy.wait('@registerRequest').then((interception) => {
        // Body should not contain plain text password
        expect(interception.request.body).not.to.contain('SecurePass123!');
      });
    });
  });

  // ============================================
  // E2E_AUTH_006-010: Login Tests
  // ============================================
  describe('E2E_AUTH_006-010: Login Tests', () => {
    it('Should login with valid credentials', () => {
      cy.get('input[type="email"]').type('testuser@example.com');
      cy.get('input[type="password"]').type('SecurePass123!');
      cy.get('button').contains(/login/i).click();

      cy.get('button').contains(/logout/i).should('be.visible');
    });

    it('Should reject wrong password', () => {
      cy.get('input[type="email"]').type('testuser@example.com');
      cy.get('input[type="password"]').type('WrongPassword123!');
      cy.get('button').contains(/login/i).click();

      cy.get('[class*="error"]').should('be.visible');
    });

    it('Should reject non-existent email', () => {
      cy.get('input[type="email"]').type('nonexistent@example.com');
      cy.get('input[type="password"]').type('Password123!');
      cy.get('button').contains(/login/i).click();

      cy.get('[class*="error"]').should('be.visible');
    });

    it('Should maintain session after login', () => {
      cy.get('input[type="email"]').type('testuser@example.com');
      cy.get('input[type="password"]').type('SecurePass123!');
      cy.get('button').contains(/login/i).click();

      cy.window().then((win) => {
        expect(win.sessionStorage.getItem('RA_SESSION_AUTH')).to.exist;
      });
    });

    it('Should logout successfully', () => {
      // Login first
      cy.get('input[type="email"]').type('testuser@example.com');
      cy.get('input[type="password"]').type('SecurePass123!');
      cy.get('button').contains(/login/i).click();

      cy.get('button').contains(/logout/i).should('be.visible');
      
      // Logout
      cy.get('button').contains(/logout/i).click();

      cy.get('input[type="email"]').should('be.visible');
    });
  });
});