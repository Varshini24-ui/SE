describe('E2E: Authentication Flow', () => {
  const testUsers = {
    existing: {
      email: 'alpha123@gmail.com',
      password: 'yourPassword'
    },
    new: {
      email: `test${Date.now()}@example.com`,
      password: 'TestPassword123!'
    }
  };

  beforeEach(() => {
    cy.clearAllStorage();
    cy.visit('/');
    cy.waitForApp();
  });

  // ============================================
  // E2E_AUTH_001-005: Registration Tests
  // ============================================
  describe('E2E_AUTH_001-005: User Registration', () => {
    
    it('E2E_AUTH_001: Should display registration form', () => {
      cy.contains('button', /register|need/i).should('be.visible');
      cy.contains('button', /login/i).should('be.visible');
    });

    it('E2E_AUTH_002: Should register new user successfully', () => {
      const { email, password } = testUsers.new;
      
      // Click Register button
      cy.contains('button', /register|need/i).click();
      
      // Fill registration form
      cy.get('input[type="email"]').first().should('be.visible').type(email);
      cy.get('input[type="password"]').first().type(password);
      
      // Submit
      cy.get('button[type="submit"]').click();
      
      // Verify successful registration - logout button appears
      cy.contains('button', /logout/i, { timeout: 10000 }).should('be.visible');
      
      // Verify email is displayed
      cy.get('.user-email').should('contain', email);
    });

    it('E2E_AUTH_003: Should validate email format', () => {
      cy.contains('button', /register|need/i).click();
      
      // Try invalid email
      cy.get('input[type="email"]').first().type('invalidemail');
      cy.get('input[type="password"]').first().type('Password123!');
      cy.get('button[type="submit"]').click();
      
      // Should show validation error
      cy.get('body').should('contain', /valid email|email/i);
    });

    it('E2E_AUTH_004: Should require password', () => {
      cy.contains('button', /register|need/i).click();
      
      cy.get('input[type="email"]').first().type('test@example.com');
      // Leave password empty
      cy.get('button[type="submit"]').click();
      
      // Should not proceed without password
      cy.contains('button', /logout/i).should('not.exist');
    });

    it('E2E_AUTH_005: Should toggle between Login and Register', () => {
      // Start with Login view
      cy.contains('h2', /login/i).should('be.visible');
      
      // Switch to Register
      cy.contains('button', /register|need/i).click();
      cy.contains('h2', /register/i).should('be.visible');
      
      // Switch back to Login
      cy.contains('button', /login|already/i).click();
      cy.contains('h2', /login/i).should('be.visible');
    });
  });

  // ============================================
  // E2E_AUTH_006-010: Login Tests
  // ============================================
  describe('E2E_AUTH_006-010: User Login', () => {
    
    it('E2E_AUTH_006: Should login with valid credentials', () => {
      const { email, password } = testUsers.existing;
      
      // Ensure on login view
      cy.get('body').then(($body) => {
        if ($body.text().includes('Register')) {
          cy.contains('button', /login/i).first().click();
        }
      });
      
      // Fill login form
      cy.get('input[type="email"]').clear().type(email);
      cy.get('input[type="password"]').clear().type(password);
      
      // Submit
      cy.get('button[type="submit"]').click();
      
      // Verify successful login
      cy.contains('button', /logout/i, { timeout: 10000 }).should('be.visible');
      cy.get('.user-email').should('contain', email);
    });

    it('E2E_AUTH_007: Should handle invalid credentials gracefully', () => {
      cy.get('input[type="email"]').type('wrong@example.com');
      cy.get('input[type="password"]').type('WrongPassword123!');
      cy.get('button[type="submit"]').click();
      
      // Should show error message or stay on login page
      cy.wait(2000);
      cy.get('body').then(($body) => {
        // Either error message appears or still on login page
        const hasError = $body.find('.error, [class*="error"]').length > 0 ||
                        $body.text().includes('failed') ||
                        $body.text().includes('Login');
        expect(hasError).to.be.true;
      });
    });

    it('E2E_AUTH_008: Should persist session after page reload', () => {
      cy.login(testUsers.existing.email, testUsers.existing.password);
      
      // Reload page
      cy.reload();
      
      // Should still be logged in
      cy.contains('button', /logout/i, { timeout: 5000 }).should('be.visible');
      cy.get('.user-email').should('contain', testUsers.existing.email);
    });

    it('E2E_AUTH_009: Should logout successfully', () => {
      cy.login(testUsers.existing.email, testUsers.existing.password);
      
      // Click logout
      cy.contains('button', /logout/i).click();
      
      // Should return to login page
      cy.contains('button', /login|register/i, { timeout: 5000 }).should('be.visible');
      cy.contains('h2', /login/i).should('be.visible');
    });

    it('E2E_AUTH_010: Should clear session data on logout', () => {
      cy.login(testUsers.existing.email, testUsers.existing.password);
      
      // Logout
      cy.logout();
      
      // Verify session storage is cleared
      cy.window().then((win) => {
        const sessionAuth = win.sessionStorage.getItem('RA_SESSION_AUTH');
        expect(sessionAuth).to.be.null;
      });
      
      // Verify we're on login page
      cy.contains('h2', /login/i).should('be.visible');
    });
  });
});