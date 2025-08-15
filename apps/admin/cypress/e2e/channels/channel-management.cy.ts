describe('Channel Management', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.admin.email, users.admin.password);
    });
    cy.visit('/channels');
  });

  it('should create a new public channel', () => {
    cy.get('[data-cy=create-channel-button]').click();
    cy.get('[data-cy=channel-name-input]').type('Test Public Channel');
    cy.get('[data-cy=channel-description-input]').type('A test public channel');
    cy.get('[data-cy=channel-type-select]').select('PUBLIC');
    cy.get('[data-cy=save-channel-button]').click();
    
    cy.get('[data-cy=channel-list]').should('contain', 'Test Public Channel');
    cy.get('[data-cy=success-message]').should('contain', 'Channel created successfully');
  });

  it('should create a new private channel', () => {
    cy.get('[data-cy=create-channel-button]').click();
    cy.get('[data-cy=channel-name-input]').type('Test Private Channel');
    cy.get('[data-cy=channel-description-input]').type('A test private channel');
    cy.get('[data-cy=channel-type-select]').select('PRIVATE');
    cy.get('[data-cy=save-channel-button]').click();
    
    cy.get('[data-cy=channel-list]').should('contain', 'Test Private Channel');
    cy.get('[data-cy=channel-type-badge]').should('contain', 'PRIVATE');
  });

  it('should join a public channel', () => {
    cy.get('[data-cy=channel-item]').first().click();
    cy.get('[data-cy=join-channel-button]').click();
    
    cy.get('[data-cy=channel-members]').should('contain', 'admin@qup.com');
    cy.get('[data-cy=join-channel-button]').should('not.exist');
    cy.get('[data-cy=leave-channel-button]').should('be.visible');
  });

  it('should leave a channel', () => {
    cy.get('[data-cy=channel-item]').first().click();
    cy.get('[data-cy=join-channel-button]').click();
    cy.get('[data-cy=leave-channel-button]').click();
    
    cy.get('[data-cy=confirm-leave-button]').click();
    cy.get('[data-cy=join-channel-button]').should('be.visible');
    cy.get('[data-cy=leave-channel-button]').should('not.exist');
  });

  it('should edit channel details', () => {
    cy.get('[data-cy=channel-item]').first().click();
    cy.get('[data-cy=edit-channel-button]').click();
    cy.get('[data-cy=channel-description-input]').clear().type('Updated description');
    cy.get('[data-cy=save-channel-button]').click();
    
    cy.get('[data-cy=success-message]').should('contain', 'Channel updated successfully');
    cy.get('[data-cy=channel-description]').should('contain', 'Updated description');
  });

  it('should archive a channel', () => {
    cy.get('[data-cy=channel-item]').first().click();
    cy.get('[data-cy=channel-actions-menu]').click();
    cy.get('[data-cy=archive-channel-button]').click();
    cy.get('[data-cy=confirm-archive-button]').click();
    
    cy.get('[data-cy=success-message]').should('contain', 'Channel archived successfully');
    cy.get('[data-cy=archived-badge]').should('be.visible');
  });
});
