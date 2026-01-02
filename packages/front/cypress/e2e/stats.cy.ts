/// <reference types="cypress" />

describe('Stats panel', () => {
  beforeEach(() => {
    // Mock GraphQL response to ensure consistent test behavior
    cy.interceptGraphQL('api', 'haiku.json');
    cy.visitApp('/haiku');
    cy.get('[data-cy=fetch-btn]', { timeout: 30000 })
      .should('exist')
      .and('not.be.disabled');
  });

  it('shows core metrics and updates after generation', () => {
    // Scroll to stats panel and wait for animation to complete
    cy.get('.stats-panel').scrollIntoView();
    // Wait for IntersectionObserver + animation (300ms delay + 500ms transition)
    cy.get('.stats-panel.is-visible', { timeout: 10000 })
      .should('exist')
      .and('have.css', 'opacity', '1');

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
