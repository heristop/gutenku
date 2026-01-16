/// <reference types="cypress" />

describe('Stats panel', () => {
  beforeEach(() => {
    cy.visit('/haiku');
    cy.get('[data-cy=fetch-btn]', { timeout: 30000 })
      .should('exist')
      .and('not.be.disabled');
  });

  it('shows core metrics and displays values', () => {
    // Scroll to stats panel and wait for IntersectionObserver to trigger
    cy.get('.stats-panel').scrollIntoView({ duration: 100 });
    // Wait for element to gain is-visible class (IntersectionObserver + 300ms delay)
    cy.get('.stats-panel', { timeout: 10000 }).should(
      'have.class',
      'is-visible',
    );
    // Wait for CSS transition to complete (600ms)
    cy.get('.stats-panel').should('have.css', 'opacity', '1');

    // Verify core metric labels are present
    cy.contains('Haikus created').should('exist');
    cy.contains('Books used').should('exist');

    // Verify metric values are displayed (4 metrics in total)
    cy.get('.stats-panel__metric-value').should('have.length', 4);

    // Verify all metric values are valid numbers (including 0)
    cy.get('.stats-panel__metric-value').each(($el) => {
      const text = $el.text().trim();
      // Extract numeric part (handles "0.00s" format for avg time)
      const numericPart = text.replace(/[^\d.]/g, '');
      expect(parseFloat(numericPart)).to.be.a('number');
    });
  });
});
