/// <reference types="cypress" />

describe('Navigation', () => {
  describe('InkBrushNav', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    it('displays navigation links', () => {
      cy.get('.ink-nav').should('exist');
      cy.get('.ink-nav__item').should('have.length.at.least', 2);
    });

    it('navigates to haiku page', () => {
      cy.get('.ink-nav__item[href="/haiku"]').click();
      cy.url().should('include', '/haiku');
    });

    it('navigates to game page', () => {
      cy.visit('/');
      cy.get('.ink-nav__item[href="/game"]').click();
      cy.url().should('include', '/game');
    });

    it('navigates back to home', () => {
      cy.visit('/haiku');
      cy.get('.ink-nav__item[href="/"]').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('highlights active link', () => {
      cy.visit('/haiku');
      cy.get('.ink-nav__item[href="/haiku"]').should(
        'have.class',
        'router-link-active',
      );
    });
  });

  describe('Footer Navigation', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    it('displays footer', () => {
      cy.get('.app-footer').should('exist');
    });

    it('displays footer navigation links', () => {
      cy.get('.footer-nav__link').should('have.length.at.least', 3);
    });

    it('navigates via footer links', () => {
      cy.get('.footer-nav__link[href="/haiku"]').click();
      cy.url().should('include', '/haiku');
    });

    it('displays social links', () => {
      cy.get('.footer-social__link').should('have.length.at.least', 2);
    });
  });

  describe('404 Page Navigation', () => {
    it('displays navigation on 404 page', () => {
      cy.visit('/nonexistent-page', { failOnStatusCode: false });
      cy.get('.ink-nav').should('exist');
    });

    it('displays return home button on 404', () => {
      cy.visit('/nonexistent-page', { failOnStatusCode: false });
      cy.wait(500);
      cy.get('.not-found').should('exist');
      cy.get('.zen-btn').should('exist');
    });

    it('navigates home from 404 page', () => {
      cy.visit('/nonexistent-page', { failOnStatusCode: false });
      cy.wait(500);
      cy.get('.zen-btn').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });

  describe('Browser Navigation', () => {
    it('supports browser back button', () => {
      cy.visit('/');
      cy.get('.ink-nav__item[href="/haiku"]').click();
      cy.url().should('include', '/haiku');
      cy.go('back');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('supports browser forward button', () => {
      cy.visit('/');
      cy.get('.ink-nav__item[href="/haiku"]').click();
      cy.url().should('include', '/haiku');
      cy.go('back');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      cy.go('forward');
      cy.url().should('include', '/haiku');
    });
  });
});
