/// <reference types="cypress" />

describe('Stats panel', () => {
  beforeEach(() => {
    cy.interceptGraphQL('api', 'haiku.json');
    cy.visitApp('/');
    cy.waitForHaiku('api');
  });

  it('shows core metrics and updates after generation', () => {
    cy.get('.gutenku-card.stats-card').should('be.visible');
    cy.contains('Haiku forged').should('exist');
    cy.contains('Books browsed').should('exist');

    // trigger another generation
    cy.get('[data-cy=fetch-btn]').click();
    cy.waitForHaiku('api');

    // forged count should be >= 2
    cy.contains('.gutenku-book-page .font-weight-bold', /\d+/)
      .first()
      .invoke('text')
      .then((txt) => {
        const n = parseInt(txt.trim(), 10);
        expect(n).to.be.gte(2);
      });
  });
});
