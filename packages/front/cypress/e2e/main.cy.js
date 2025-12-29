/// <reference types="cypress" />

describe('Landing page test', () => {
  beforeEach(() => {
    cy.visitApp('/haiku');
    // Wait for the page to load and haiku to be fetched
    cy.get('[data-cy=fetch-btn]', { timeout: 30000 })
      .should('exist')
      .and('not.be.disabled');
  });

  it('homepage', () => {
    cy.get('[data-cy=fetch-btn]').should('be.visible').and('not.be.disabled');
    cy.get('[data-cy=copy-btn]').should('be.visible');
    cy.get('[data-cy=fetch-btn]').click();

    // Wait for new haiku to load (button becomes enabled again)
    cy.get('[data-cy=fetch-btn]', { timeout: 30000 }).should('not.be.disabled');
    cy.get('[data-cy=copy-btn]').click();
    // Copy button shows success state with --success class modifier
    cy.get('[data-cy=copy-btn].toolbar-panel__action-btn--success', {
      timeout: 4000,
    }).should('exist');
    cy.get('[data-cy=copy-btn].toolbar-panel__action-btn--success', {
      timeout: 5000,
    }).should('not.exist');
    cy.get('[data-cy=light-toggle-btn]').first().click();
    cy.get('[data-cy=download-btn]').should('be.visible').click();
  });

  it('opens advanced config', () => {
    // Wait for animate-in to complete (element gets is-visible class)
    cy.get('.config-panel')
      .scrollIntoView()
      .should('have.class', 'is-visible')
      .and('be.visible');
    // Ensure accordion is expanded (click header if content not visible)
    cy.get('.zen-accordion__header')
      .first()
      .then(($header) => {
        if (!$header.hasClass('zen-accordion__header--expanded')) {
          cy.wrap($header).click();
        }
      });
    cy.get('.config-panel__content', { timeout: 5000 }).should('be.visible');
    cy.contains('Sentiment').should('be.visible');
    // Toggle advanced section
    cy.get('.config-panel__advanced-toggle').scrollIntoView().click();
    cy.contains('Markov Chain').should('be.visible');
  });
});
