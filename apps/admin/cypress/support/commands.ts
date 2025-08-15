/// <reference types="cypress" />

// Custom command for login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('[data-cy=email-input]').type(email);
  cy.get('[data-cy=password-input]').type(password);
  cy.get('[data-cy=login-button]').click();
  cy.url().should('include', '/dashboard');
});

// Custom command for GraphQL requests
Cypress.Commands.add('graphql', (query: string, variables?: any) => {
  return cy.request({
    method: 'POST',
    url: Cypress.env('graphqlUrl'),
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      query,
      variables,
    },
  });
});

// Custom command for creating test data
Cypress.Commands.add('createTestUser', (userData: any) => {
  const mutation = `
    mutation CreateUser($input: CreateUserInput!) {
      register(input: $input) {
        user {
          id
          email
          username
        }
        token
      }
    }
  `;
  
  return cy.graphql(mutation, { input: userData });
});

// Custom command for creating test channel
Cypress.Commands.add('createTestChannel', (channelData: any) => {
  const mutation = `
    mutation CreateChannel($input: CreateChannelInput!) {
      createChannel(input: $input) {
        id
        name
        description
        type
      }
    }
  `;
  
  return cy.graphql(mutation, { input: channelData });
});

// Custom command for waiting for GraphQL response
Cypress.Commands.add('waitForGraphQL', (operationName: string) => {
  cy.intercept('POST', Cypress.env('graphqlUrl'), (req) => {
    if (req.body.operationName === operationName) {
      req.alias = operationName;
    }
  });
  cy.wait(`@${operationName}`);
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      graphql(query: string, variables?: any): Chainable<any>;
      createTestUser(userData: any): Chainable<any>;
      createTestChannel(channelData: any): Chainable<any>;
      waitForGraphQL(operationName: string): Chainable<void>;
    }
  }
}
