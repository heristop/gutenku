/// <reference types="cypress" />

Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false;
});

describe('Landing page test', () => {
  beforeEach(() => {
    cy.intercept('POST', /\/graphql$/, { fixture: 'haiku.json' }).as('api');
    cy.visit('http://localhost:3000');
  });

  it('homepage', () => {
    cy.wait('@api').then(() => {
      cy.get('[data-cy=fetch-btn]').should('be.visible');
      cy.get('[data-cy=copy-btn]').should('be.visible');
      cy.get('[data-cy=fetch-btn').click();

      cy.wait('@api').then(() => {
        cy.get('[data-cy=copy-btn]').click();
        cy.get('[data-cy=copy-success-icon]').should('be.visible');
        cy.wait(2000);
        cy.get('[data-cy=copy-success-icon]').should('not.exist');
        cy.get('[data-cy=light-toggle-btn]')
          .should('be.visible')
          .first()
          .click();
        cy.get('[data-cy=download-btn]').should('be.visible').click();
        cy.get('[data-cy=🤖-description]').should('not.exist');
      });
    });
  });

  it('ai-generation', () => {
    cy.get('[data-cy=menu-btn]').click();
    cy.get('[data-cy=ai-boost-switch]').should('be.visible').click();
    cy.get('[data-cy=fetch-btn]').should('be.visible').click();

    cy.wait('@api').then(() => {
      cy.contains('AI Analysis').should('be.visible');
    });

    cy.get('[data-cy=switch-api-btn]').should('be.visible').click();
    cy.contains('Quote Filtering').should('be.visible');
  });
});
