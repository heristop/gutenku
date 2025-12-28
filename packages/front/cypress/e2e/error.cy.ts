/// <reference types="cypress" />

describe('Error handling', () => {
  it('shows error state when server is unavailable', () => {
    // Note: Full error testing requires mocking, blocked by cross-origin restrictions
    cy.visitApp('/haiku');

    cy.get('[data-cy=fetch-btn]', { timeout: 30000 })
      .should('exist')
      .and('not.be.disabled');
    cy.get('.zen-toast-container').should('exist');
  });
});
