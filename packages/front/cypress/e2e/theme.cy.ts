/// <reference types="cypress" />

describe('Theme selection', () => {
  it('changes theme and triggers a new fetch', () => {
    cy.visitApp('/haiku');
    // Wait for initial load
    cy.get('[data-cy=fetch-btn]', { timeout: 30000 })
      .should('exist')
      .and('not.be.disabled');

    // Change theme to "colored"
    cy.selectTheme('colored');

    // Wait for the fetch button to be enabled again (page reloaded with new haiku)
    cy.get('[data-cy=fetch-btn]', { timeout: 30000 }).should('not.be.disabled');
  });
});
