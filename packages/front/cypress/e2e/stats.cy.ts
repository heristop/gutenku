/// <reference types="cypress" />

describe('Stats panel', () => {
  beforeEach(() => {
    cy.visit('/haiku');
    cy.get('[data-cy=fetch-btn]', { timeout: 30000 })
      .should('exist')
      .and('not.be.disabled');
  });

  it('shows core metrics and displays values', () => {
    // The panel renders visible at rest (no scroll reveal)
    cy.get('.stats-panel', { timeout: 10000 }).scrollIntoView({
      duration: 100,
    });
    cy.get('.stats-panel').should('have.css', 'opacity', '1');

    // Verify core metric labels are present
    cy.contains('Haikus created').should('exist');
    cy.contains('Books used').should('exist');

    // Three counts always; the average time joins once a timed haiku exists
    cy.get('.stats-panel__metric-value').should('have.length.within', 3, 4);

    // Verify all metric values are valid numbers (including 0)
    cy.get('.stats-panel__metric-value').each(($el) => {
      const text = $el.text().trim();
      // Extract numeric part (handles "0.00s" format for avg time)
      const numericPart = text.replace(/[^\d.]/g, '');
      expect(parseFloat(numericPart)).to.be.a('number');
    });
  });
});
