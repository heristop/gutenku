/// <reference types="cypress" />

describe('Stats panel', () => {
  beforeEach(() => {
    cy.visitApp('/');
    cy.get('[data-cy=fetch-btn]:visible', { timeout: 30000 }).should('exist');
  });

  it('shows core metrics and updates after generation', () => {
    // Scroll stats panel into view to trigger animate-in visibility
    cy.get('.gutenku-card.stats-panel').scrollIntoView();
    // Wait for animation to complete (is-visible class added)
    cy.get('.gutenku-card.stats-panel.is-visible', { timeout: 5000 }).should(
      'exist',
    );

    cy.contains('Haiku forged').should('exist');
    cy.contains('Books browsed').should('exist');

    // trigger another generation
    cy.get('[data-cy=fetch-btn]:visible').click();
    cy.get('[data-cy=fetch-btn]:visible', { timeout: 30000 }).should(
      'be.visible',
    );

    // forged count should be >= 1
    cy.contains('.gutenku-book-page .font-weight-bold', /\d+/)
      .first()
      .invoke('text')
      .then((txt) => {
        const n = parseInt(txt.trim(), 10);
        expect(n).to.be.gte(1);
      });
  });
});
