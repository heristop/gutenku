/// <reference types="cypress" />

describe('404 Not Found Page', () => {
  beforeEach(() => {
    cy.visit('/nonexistent-page-12345', { failOnStatusCode: false });
  });

  describe('Page Display', () => {
    it('displays 404 page for unknown routes', () => {
      cy.get('.not-found').should('exist');
    });

    it('displays navigation bar', () => {
      cy.get('.ink-nav').should('exist');
    });

    it('displays 404 number', () => {
      cy.get('.not-found__number').should('contain', '404');
    });

    it('displays illustration', () => {
      cy.get('.not-found__illustration').should('be.visible');
    });

    it('displays haiku', () => {
      cy.wait(500);
      cy.get('.not-found__haiku').should('exist');
      cy.get('.zen-haiku__line').should('have.length', 3);
    });
  });

  describe('Return Home', () => {
    it('displays return home button', () => {
      cy.wait(500);
      cy.get('.zen-btn').should('exist');
    });

    it('navigates to home when clicking return button', () => {
      cy.wait(500);
      cy.get('.zen-btn').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });

  describe('Animations', () => {
    it('card fades in on load', () => {
      cy.get('.not-found__card').should('be.visible');
    });

    it('haiku is displayed', () => {
      cy.wait(500);
      cy.get('.zen-haiku').should('be.visible');
      cy.get('.zen-haiku__line').should('have.length', 3);
    });
  });

  describe('Different Invalid Routes', () => {
    it('shows 404 for random path', () => {
      cy.visit('/xyz-random-path', { failOnStatusCode: false });
      cy.get('.not-found').should('exist');
    });

    it('shows 404 for nested invalid path', () => {
      cy.visit('/foo/bar/baz', { failOnStatusCode: false });
      cy.get('.not-found').should('exist');
    });

    it('shows 404 for path with special characters', () => {
      cy.visit('/test-page_123', { failOnStatusCode: false });
      cy.get('.not-found').should('exist');
    });
  });

  describe('Accessibility', () => {
    it('has proper aria label on card', () => {
      cy.get('.not-found__card').should(
        'have.attr',
        'aria-label',
        'Page not found',
      );
    });

    it('illustration is decorative', () => {
      cy.get('.not-found__illustration').should(
        'have.attr',
        'aria-hidden',
        'true',
      );
    });

    it('return button has accessible label', () => {
      cy.get('.zen-btn').should('have.attr', 'aria-label');
    });
  });
});
