/// <reference types="cypress" />
/// <reference types="cypress-axe" />

describe('WCAG 2.2 Accessibility Tests', () => {
  const a11yOptions = {
    runOnly: {
      type: 'tag' as const,
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
    },
  };

  describe('Home Page', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.injectAxe();
    });

    it('has no accessibility violations', () => {
      cy.checkA11y(null, a11yOptions);
    });
  });

  describe('Haiku Page', () => {
    beforeEach(() => {
      cy.visit('/haiku');
      cy.injectAxe();
    });

    it('has no accessibility violations on initial load', () => {
      cy.checkA11y(null, a11yOptions);
    });

    it('has no accessibility violations after content loads', () => {
      // Wait for page content to stabilize (WebSocket-based data)
      cy.get('[data-cy=fetch-btn]', { timeout: 30000 })
        .should('exist')
        .and('not.be.disabled');
      cy.checkA11y(null, a11yOptions);
    });
  });

  describe('Game Page (if enabled)', () => {
    it('has no accessibility violations', () => {
      cy.visit('/');
      cy.get('body').then(($body) => {
        if ($body.find('.ink-nav__item[href="/game"]').length) {
          cy.visit('/game');
          cy.injectAxe();
          // Wait for page content to stabilize (WebSocket-based data)
          cy.wait(1500);
          cy.checkA11y(null, a11yOptions);
        } else {
          cy.log('Game page not available (GAME_ENABLED=false)');
        }
      });
    });
  });

  describe('404 Page', () => {
    beforeEach(() => {
      cy.visit('/nonexistent-page', { failOnStatusCode: false });
      cy.injectAxe();
    });

    it('has no accessibility violations', () => {
      cy.checkA11y(null, a11yOptions);
    });
  });

  describe('Dark Mode', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.injectAxe();
    });

    it('has no accessibility violations in dark mode', () => {
      // Enable dark mode via theme toggle button
      cy.get('.theme-toggle').first().click();
      cy.wait(300);
      cy.checkA11y(null, a11yOptions);
    });
  });
});
