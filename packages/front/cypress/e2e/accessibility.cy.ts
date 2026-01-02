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
      cy.wait(1500);
      cy.checkA11y(null, a11yOptions);
    });
  });

  describe('Game Page', () => {
    beforeEach(() => {
      cy.visit('/game');
      cy.injectAxe();
    });

    it('has no accessibility violations', () => {
      // Wait for page content to stabilize (WebSocket-based data)
      cy.wait(1500);
      cy.checkA11y(null, a11yOptions);
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
