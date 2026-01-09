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
    // Scroll to stats panel and wait for IntersectionObserver to trigger
    cy.get('.stats-panel').scrollIntoView({ duration: 100 });
    // Wait for element to gain is-visible class (IntersectionObserver + 300ms delay)
    cy.get('.stats-panel', { timeout: 10000 }).should('have.class', 'is-visible');
    // Wait for CSS transition to complete (600ms)
    cy.get('.stats-panel').should('have.css', 'opacity', '1');

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
