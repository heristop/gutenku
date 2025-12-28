/// <reference types="cypress" />

describe('Stats panel', () => {
  beforeEach(() => {
    cy.visitApp('/haiku');
    cy.get('[data-cy=fetch-btn]', { timeout: 30000 })
      .should('exist')
      .and('not.be.disabled');
  });

  it('shows core metrics and updates after generation', () => {
    // Trigger visibility animation
    cy.get('.stats-panel').scrollIntoView();
    cy.get('.stats-panel.is-visible', { timeout: 5000 }).should('exist');

    cy.contains('Haikus created').should('exist');
    cy.contains('Books used').should('exist');

    cy.get('[data-cy=fetch-btn]').click();
    cy.get('[data-cy=fetch-btn]', { timeout: 30000 }).should('not.be.disabled');

    // Verify haiku count incremented
    cy.get('.stats-panel__metric-value')
      .first()
      .invoke('text')
      .then((txt) => {
        const n = parseInt(txt.trim(), 10);
        expect(n).to.be.gte(1);
      });
  });
});
