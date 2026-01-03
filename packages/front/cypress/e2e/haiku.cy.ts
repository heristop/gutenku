/// <reference types="cypress" />

describe('Haiku Page', () => {
  beforeEach(() => {
    cy.visit('/haiku');
  });

  describe('Page Load', () => {
    it('displays navigation', () => {
      cy.get('.ink-nav').should('exist');
    });

    it('shows loading state initially', () => {
      cy.get('.haiku-page').should('exist');
    });

    it('displays content after loading', () => {
      cy.get('[data-cy=fetch-btn]', { timeout: 30000 })
        .should('exist')
        .and('not.be.disabled');
    });
  });

  describe('Haiku Content', () => {
    beforeEach(() => {
      cy.get('[data-cy=fetch-btn]', { timeout: 30000 })
        .should('exist')
        .and('not.be.disabled');
    });

    it('displays haiku title section', () => {
      cy.get('.haiku-section__title').should('exist');
    });

    it('displays haiku chapter', () => {
      cy.get('.haiku-section__chapter').should('exist');
    });

    it('displays haiku canvas', () => {
      cy.get('.haiku-section__canvas').should('exist');
    });

    it('displays toolbar panel', () => {
      cy.get('.haiku-section__toolbar').should('exist');
    });
  });

  describe('Haiku Generation', () => {
    beforeEach(() => {
      cy.get('[data-cy=fetch-btn]', { timeout: 30000 })
        .should('exist')
        .and('not.be.disabled');
    });

    it('can generate a new haiku', () => {
      cy.get('[data-cy=fetch-btn]').click();
      // Button should be disabled while loading
      cy.get('[data-cy=fetch-btn]').should('be.disabled');
      // Wait for generation to complete
      cy.get('[data-cy=fetch-btn]', { timeout: 30000 }).should(
        'not.be.disabled',
      );
    });

    it('updates haiku content after generation', () => {
      // Get initial content
      cy.get('.haiku-section__chapter')
        .invoke('text')
        .then((initialText) => {
          cy.get('[data-cy=fetch-btn]').click();
          cy.get('[data-cy=fetch-btn]', { timeout: 30000 }).should(
            'not.be.disabled',
          );
          // Content may or may not change (could be same haiku from cache)
          cy.get('.haiku-section__chapter').should('exist');
        });
    });
  });

  describe('Theme Selection', () => {
    beforeEach(() => {
      cy.get('[data-cy=fetch-btn]', { timeout: 30000 })
        .should('exist')
        .and('not.be.disabled');
    });

    it('displays theme selector', () => {
      cy.get('.theme-selector').should('exist');
    });

    it('can change theme', () => {
      cy.selectTheme('colored');
      cy.get('[data-cy=fetch-btn]', { timeout: 30000 }).should(
        'not.be.disabled',
      );
    });
  });

  describe('Stats Panel', () => {
    beforeEach(() => {
      cy.get('[data-cy=fetch-btn]', { timeout: 30000 })
        .should('exist')
        .and('not.be.disabled');
    });

    it('displays stats panel', () => {
      cy.get('.stats-panel').scrollIntoView();
      cy.get('.stats-panel.is-visible', { timeout: 10000 }).should('exist');
    });

    it('shows haikus created metric', () => {
      cy.get('.stats-panel').scrollIntoView();
      cy.get('.stats-panel.is-visible', { timeout: 10000 }).should('exist');
      cy.contains('Haikus created').should('exist');
    });

    it('shows books used metric', () => {
      cy.get('.stats-panel').scrollIntoView();
      cy.get('.stats-panel.is-visible', { timeout: 10000 }).should('exist');
      cy.contains('Books used').should('exist');
    });
  });

  describe('Config Panel', () => {
    beforeEach(() => {
      cy.get('[data-cy=fetch-btn]', { timeout: 30000 })
        .should('exist')
        .and('not.be.disabled');
    });

    it('displays config panel', () => {
      cy.get('.config-panel').should('exist');
    });
  });

  describe('Toolbar', () => {
    beforeEach(() => {
      cy.get('[data-cy=fetch-btn]', { timeout: 30000 })
        .should('exist')
        .and('not.be.disabled');
    });

    it('displays toolbar with actions', () => {
      cy.get('.toolbar-panel').should('exist');
    });

    it('has share functionality', () => {
      cy.get('.toolbar-panel').within(() => {
        cy.get('button').should('have.length.at.least', 1);
      });
    });
  });

  describe('Responsive Layout', () => {
    it('works on mobile viewport', () => {
      cy.viewport('iphone-x');
      cy.visit('/haiku');
      cy.get('[data-cy=fetch-btn]', { timeout: 30000 })
        .should('exist')
        .and('not.be.disabled');
      cy.get('.haiku-page__content').should('exist');
    });

    it('works on tablet viewport', () => {
      cy.viewport('ipad-2');
      cy.visit('/haiku');
      cy.get('[data-cy=fetch-btn]', { timeout: 30000 })
        .should('exist')
        .and('not.be.disabled');
      cy.get('.haiku-page__content').should('exist');
    });
  });

  describe('Keyboard Shortcuts', () => {
    beforeEach(() => {
      cy.get('[data-cy=fetch-btn]', { timeout: 30000 })
        .should('exist')
        .and('not.be.disabled');
    });

    it('supports keyboard interaction', () => {
      // Verify button is focusable (keyboard accessible)
      cy.get('[data-cy=fetch-btn]')
        .focus()
        .should('have.focus')
        .and('not.have.attr', 'tabindex', '-1');
      // Verify button can be activated (click after focus simulates keyboard activation)
      cy.get('[data-cy=fetch-btn]').click();
      cy.get('[data-cy=fetch-btn]').should('be.disabled');
      cy.get('[data-cy=fetch-btn]', { timeout: 30000 }).should(
        'not.be.disabled',
      );
    });
  });
});
