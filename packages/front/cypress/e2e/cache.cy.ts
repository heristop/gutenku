/// <reference types="cypress" />

describe('Cache usage progress', () => {
  it('reflects cached haikus when API returns cacheUsed', () => {
    cy.interceptGraphQL('api', 'haiku_cached.json');
    cy.visitApp('/');
    cy.waitForHaiku('api');

    // Progress percentage should be > 0 when first haiku is from cache
    cy.contains('Calm waters (cache usage)')
      .parent()
      .within(() => {
        cy.get('.text-caption')
          .last()
          .invoke('text')
          .then((txt) => {
            const pct = parseInt(txt.replace('%', '').trim(), 10);
            expect(pct).to.be.gte(50);
          });
      });
  });
});
