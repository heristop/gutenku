/// <reference types="cypress" />

describe('Error handling', () => {
  it('shows a friendly message on max-attempts error', () => {
    cy.intercept('POST', /\/graphql$/, {
      fixture: 'haiku_error_max_attempts.json',
    }).as('api');
    cy.visitApp('/');

    cy.get('[data-cy=fetch-btn]').click();
    cy.waitForHaiku('api');

    cy.get('.v-snackbar', { timeout: 8000 })
      .should('exist')
      .and('have.class', 'v-snackbar--active')
      .and('contain.text', 'I could not find a haiku');
  });
});
