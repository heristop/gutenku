/// <reference types="cypress" />

describe('Cache usage progress', () => {
  it('reflects cached haikus when API returns cacheUsed', () => {
    cy.visitApp('/haiku');
    // Wait for the page to load
    cy.get('[data-cy=fetch-btn]', { timeout: 30000 })
      .should('exist')
      .and('not.be.disabled');

    // Generate a few haikus to build up cache stats
    cy.get('[data-cy=fetch-btn]').click();
    cy.get('[data-cy=fetch-btn]', { timeout: 30000 }).should('not.be.disabled');

    // Check that the stats panel shows cache info
    cy.contains('Cache usage').should('exist');
  });
});
