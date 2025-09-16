/// <reference types="cypress" />

describe('Theme selection', () => {
  it('changes theme and triggers a new fetch', () => {
    // First response
    cy.interceptGraphQL('api', 'haiku.json');
    cy.visitApp('/');
    cy.waitForHaiku('api');

    // Set up a second response to confirm refetch on theme change
    cy.interceptGraphQL('api2', 'haiku_cached.json');

    // Change theme to "colored" (or any available option)
    cy.selectTheme('colored');

    // Expect another call
    cy.waitForHaiku('api2');
  });
});
