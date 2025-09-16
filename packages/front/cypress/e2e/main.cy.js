/// <reference types="cypress" />

describe('Landing page test', () => {
  beforeEach(() => {
    cy.interceptGraphQL('api', 'haiku.json');
    cy.visitApp('/');
  });

  it('homepage', () => {
    cy.waitForHaiku('api').then(() => {
      cy.get('[data-cy=fetch-btn]').should('be.visible');
      cy.get('[data-cy=copy-btn]').should('be.visible');
      cy.get('[data-cy=fetch-btn]').click();

      cy.waitForHaiku('api').then(() => {
        cy.get('[data-cy=copy-btn]').click();
        cy.get('[data-cy=copy-success-icon]', { timeout: 4000 }).should(
          'be.visible',
        );
        cy.get('[data-cy=copy-success-icon]', { timeout: 5000 }).should(
          'not.exist',
        );
        cy.get('[data-cy=light-toggle-btn]')
          .should('be.visible')
          .first()
          .click();
        cy.get('[data-cy=download-btn]').should('be.visible').click();
      });
    });
  });

  it('opens advanced config', () => {
    cy.get('[data-cy=menu-btn]').click();
    cy.contains('Advanced Configuration').should('be.visible');
    cy.contains('Sentiment').should('be.visible');
    cy.contains('Markov Chain').should('be.visible');
    cy.get('[data-cy=fetch-btn]').should('be.visible').click();
    cy.waitForHaiku('api');
  });
});
