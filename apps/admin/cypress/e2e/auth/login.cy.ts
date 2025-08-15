describe('Authentication - Login', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should login successfully with valid admin credentials', () => {
    cy.fixture('users').then((users) => {
      cy.get('[data-cy=email-input]').type(users.admin.email);
      cy.get('[data-cy=password-input]').type(users.admin.password);
      cy.get('[data-cy=login-button]').click();
      
      cy.url().should('include', '/dashboard');
      cy.get('[data-cy=user-menu]').should('be.visible');
      cy.get('[data-cy=user-role]').should('contain', 'ADMIN');
    });
  });

  it('should show error with invalid credentials', () => {
    cy.get('[data-cy=email-input]').type('invalid@email.com');
    cy.get('[data-cy=password-input]').type('wrongpassword');
    cy.get('[data-cy=login-button]').click();
    
    cy.get('[data-cy=error-message]').should('be.visible');
    cy.get('[data-cy=error-message]').should('contain', 'Invalid credentials');
  });

  it('should validate required fields', () => {
    cy.get('[data-cy=login-button]').click();
    
    cy.get('[data-cy=email-error]').should('be.visible');
    cy.get('[data-cy=password-error]').should('be.visible');
  });

  it('should redirect to dashboard after successful login', () => {
    cy.fixture('users').then((users) => {
      cy.login(users.admin.email, users.admin.password);
      cy.url().should('include', '/dashboard');
      cy.get('[data-cy=dashboard-welcome]').should('be.visible');
    });
  });
});
