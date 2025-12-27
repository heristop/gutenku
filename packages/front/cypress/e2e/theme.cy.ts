/// <reference types="cypress" />

describe('Theme selection', () => {
  it('changes theme and triggers a new fetch', () => {
    cy.visitApp('/');
    // Wait for initial load
    cy.get('[data-cy=fetch-btn]:visible', { timeout: 30000 }).should('exist');

    // Change theme to "colored"
    cy.selectTheme('colored');

    // Wait for the fetch button to be visible again (page reloaded with new haiku)
    cy.get('[data-cy=fetch-btn]:visible', { timeout: 30000 }).should(
      'be.visible',
    );
  });
});
