describe('Authentication - Register', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('should register new user successfully', () => {
    const newUser = {
      email: 'newuser@qup.com',
      username: 'newuser',
      displayName: 'New User',
      password: 'password123'
    };

    cy.get('[data-cy=email-input]').type(newUser.email);
    cy.get('[data-cy=username-input]').type(newUser.username);
    cy.get('[data-cy=display-name-input]').type(newUser.displayName);
    cy.get('[data-cy=password-input]').type(newUser.password);
    cy.get('[data-cy=register-button]').click();
    
    cy.url().should('include', '/dashboard');
    cy.get('[data-cy=welcome-message]').should('contain', newUser.displayName);
  });

  it('should validate username format', () => {
    cy.get('[data-cy=username-input]').type('invalid username');
    cy.get('[data-cy=username-input]').blur();
    
    cy.get('[data-cy=username-error]').should('be.visible');
    cy.get('[data-cy=username-error]').should('contain', 'Username can only contain letters, numbers, underscores, and hyphens');
  });

  it('should validate email format', () => {
    cy.get('[data-cy=email-input]').type('invalid-email');
    cy.get('[data-cy=email-input]').blur();
    
    cy.get('[data-cy=email-error]').should('be.visible');
    cy.get('[data-cy=email-error]').should('contain', 'Invalid email format');
  });

  it('should prevent duplicate email registration', () => {
    cy.fixture('users').then((users) => {
      cy.get('[data-cy=email-input]').type(users.admin.email);
      cy.get('[data-cy=username-input]').type('duplicateuser');
      cy.get('[data-cy=display-name-input]').type('Duplicate User');
      cy.get('[data-cy=password-input]').type('password123');
      cy.get('[data-cy=register-button]').click();
      
      cy.get('[data-cy=error-message]').should('be.visible');
      cy.get('[data-cy=error-message]').should('contain', 'Email already exists');
    });
  });
});
