describe('E2E: Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/'); // Your app home
    cy.wait(2000); // Wait for app to load
  });

  describe('E2E_AUTH_001-005: Registration Tests', () => {
    it('Should register new user successfully', () => {
      // Adjust selectors based on your actual UI
      cy.get('button:contains("Register")').click();
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[type="password"]').type('TestPassword123!');
      cy.get('button:contains("Sign Up")').click();
      
      // Wait for successful registration
      cy.get('button:contains("Logout")', { timeout: 10000 }).should('be.visible');
    });
  });

  describe('E2E_AUTH_006-010: Login Tests', () => {
    it('Should login with valid credentials', () => {
      cy.get('button:contains("Login")').click();
      cy.get('input[type="email"]').type('alpha123@gmail.com');
      cy.get('input[type="password"]').type('yourPassword');
      cy.get('button:contains("Login")').click();
      
      cy.get('button:contains("Logout")', { timeout: 10000 }).should('be.visible');
    });

    it('Should logout successfully', () => {
      cy.loginUser('alpha123@gmail.com', 'yourPassword');
      cy.get('button:contains("Logout")').click();
      cy.url().should('include', '/login');
    });
  });
});