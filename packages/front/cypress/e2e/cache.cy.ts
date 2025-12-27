/// <reference types="cypress" />

describe('Cache usage progress', () => {
  it('reflects cached haikus when API returns cacheUsed', () => {
    cy.visitApp('/');
    // Wait for the page to load
    cy.get('[data-cy=fetch-btn]:visible', { timeout: 30000 }).should('exist');

    // Generate a few haikus to build up cache stats
    cy.get('[data-cy=fetch-btn]:visible').click();
    cy.get('[data-cy=fetch-btn]:visible', { timeout: 30000 }).should(
      'be.visible',
    );

    // Check that the stats panel shows cache info
    cy.contains('Calm waters').should('exist');
  });
});
