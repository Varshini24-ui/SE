describe('E2E: Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    cy.clearLocalStorage();
    // Remove cy.clearSessionStorage() - it doesn't exist in Cypress
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
  });

  // ============================================
  // E2E_AUTH_001-005: Registration Tests
  // ============================================
  describe('E2E_AUTH_001-005: Registration Tests', () => {
    it('Should register new user successfully', () => {
      cy.get('button').contains(/register|need an account/i).click();
      
      cy.get('input[type="email"]').first().type('newuser@example.com');
      cy.get('input[type="password"]').first().type('SecurePass123!');
      cy.get('button[type="submit"]').click();

      // Wait for redirect and verify logged in state
      cy.get('button').contains(/logout/i, { timeout: 5000 }).should('be.visible');
    });

    it('Should show error for invalid email', () => {
      cy.get('button').contains(/register|need an account/i).click();
      
      cy.get('input[type="email"]').first().type('invalidemail');
      cy.get('input[type="password"]').first().type('Password123!');
      cy.get('button[type="submit"]').click();

      // Check for error message
      cy.get('body').should('contain', /invalid|error|email/i);
    });

    it('Should show error for weak password', () => {
      cy.get('button').contains(/register|need an account/i).click();
      
      cy.get('input[type="email"]').first().type('user@example.com');
      cy.get('input[type="password"]').first().type('123');
      cy.get('button[type="submit"]').click();

      // Check for error message
      cy.get('body').should('contain', /weak|short|password/i);
    });

    it('Should validate required fields', () => {
      cy.get('button').contains(/register|need an account/i).click();
      
      cy.get('button[type="submit"]').click();
      // Should stay on registration page (button still visible)
      cy.get('input[type="email"]').should('be.visible');
    });

    it('Should hash password before sending', () => {
      cy.get('button').contains(/register|need an account/i).click();
      
      cy.get('input[type="email"]').first().type('user@example.com');
      cy.get('input[type="password"]').first().type('SecurePass123!');
      
      // Intercept network request to verify password is hashed
      cy.intercept('POST', '**/api/**', (req) => {
        // Body should not contain plain text password
        expect(req.body).not.to.contain('SecurePass123!');
        req.reply();
      }).as('registerRequest');
      
      cy.get('button[type="submit"]').click();
      cy.wait('@registerRequest', { timeout: 5000 });
    });
  });

  // ============================================
  // E2E_AUTH_006-010: Login Tests
  // ============================================
  describe('E2E_AUTH_006-010: Login Tests', () => {
    it('Should login with valid credentials', () => {
      cy.get('input[type="email"]').first().type('testuser@example.com');
      cy.get('input[type="password"]').first().type('SecurePass123!');
      cy.get('button').contains(/login/i).click();

      cy.get('button').contains(/logout/i, { timeout: 5000 }).should('be.visible');
    });

    it('Should reject wrong password', () => {
      cy.get('input[type="email"]').first().type('testuser@example.com');
      cy.get('input[type="password"]').first().type('WrongPassword123!');
      cy.get('button').contains(/login/i).click();

      // Should show error or stay on login
      cy.get('body').should('contain', /error|wrong|invalid/i);
    });

    it('Should reject non-existent email', () => {
      cy.get('input[type="email"]').first().type('nonexistent@example.com');
      cy.get('input[type="password"]').first().type('Password123!');
      cy.get('button').contains(/login/i).click();

      cy.get('body').should('contain', /error|not found|invalid/i);
    });

    it('Should maintain session after login', () => {
      cy.get('input[type="email"]').first().type('testuser@example.com');
      cy.get('input[type="password"]').first().type('SecurePass123!');
      cy.get('button').contains(/login/i).click();

      cy.window().then((win) => {
        const sessionAuth = win.sessionStorage.getItem('RA_SESSION_AUTH');
        expect(sessionAuth).to.exist;
      });
    });

    it('Should logout successfully', () => {
      // Login first
      cy.get('input[type="email"]').first().type('testuser@example.com');
      cy.get('input[type="password"]').first().type('SecurePass123!');
      cy.get('button').contains(/login/i).click();

      cy.get('button').contains(/logout/i, { timeout: 5000 }).should('be.visible');
      
      // Logout
      cy.get('button').contains(/logout/i).click();

      cy.get('input[type="email"]').should('be.visible');
    });
  });
});