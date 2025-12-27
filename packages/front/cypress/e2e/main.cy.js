/// <reference types="cypress" />

describe('Landing page test', () => {
  beforeEach(() => {
    cy.visitApp('/');
    // Wait for the page to load and haiku to be fetched
    cy.get('[data-cy=fetch-btn]:visible', { timeout: 30000 }).should('exist');
  });

  it('homepage', () => {
    cy.get('[data-cy=fetch-btn]:visible').should('be.visible');
    cy.get('[data-cy=copy-btn]:visible').should('be.visible');
    cy.get('[data-cy=fetch-btn]:visible').click();

    // Wait for new haiku to load
    cy.get('[data-cy=fetch-btn]:visible', { timeout: 30000 }).should(
      'be.visible',
    );
    cy.get('[data-cy=copy-btn]:visible').click();
    // Copy button shows success state with .success class
    cy.get('[data-cy=copy-btn].success', { timeout: 4000 }).should('exist');
    cy.get('[data-cy=copy-btn].success', { timeout: 5000 }).should('not.exist');
    cy.get('[data-cy=light-toggle-btn]:visible').first().click();
    cy.get('[data-cy=download-btn]:visible').should('be.visible').click();
  });

  it('opens advanced config', () => {
    // ConfigPanel should be expanded by default (useExpandedState default is true)
    cy.get('.config-panel').scrollIntoView();
    // Wait for animation (animate-in class) to complete
    cy.get('.config-panel.is-visible', { timeout: 5000 }).should('exist');
    // The content should already be visible (default expanded = true)
    cy.get('#config-panel-content', { timeout: 3000 }).should('be.visible');
    // Check Sentiment is visible (always visible in expanded state)
    cy.contains('Sentiment').should('be.visible');
    // Click to show advanced options (Markov Chain is in advanced section)
    cy.get('.config-panel__advanced-toggle').scrollIntoView().click();
    cy.contains('Markov Chain').should('be.visible');
    cy.get('[data-cy=fetch-btn]:visible').should('be.visible').click();
  });
});
