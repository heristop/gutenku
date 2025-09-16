/// <reference types="cypress" />

// Fail-safe: don't fail tests for 3rd-party runtime errors
Cypress.on('uncaught:exception', () => false);

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      interceptGraphQL(alias?: string, fixture?: string): Chainable<void>;
      visitApp(path?: string): Chainable<void>;
      waitForHaiku(alias?: string): Chainable<void>;
      selectTheme(value: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add(
  'interceptGraphQL',
  (alias = 'api', fixture = 'haiku.json') => {
    cy.intercept('POST', /\/graphql$/, { fixture }).as(alias);
  },
);

Cypress.Commands.add('visitApp', (path = '/') => {
  cy.visit(path);
});

Cypress.Commands.add('waitForHaiku', (alias = 'api') => {
  cy.wait(`@${alias}`);
});

Cypress.Commands.add('selectTheme', (value: string) => {
  // Open v-select menu
  cy.get('.theme-selector .v-field').click();
  // Click matching item
  cy.get('.v-overlay-container .v-list .v-list-item')
    .contains(new RegExp(`^${value}$`, 'i'))
    .click();
});
