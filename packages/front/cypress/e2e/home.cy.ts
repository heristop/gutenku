/// <reference types="cypress" />

describe('Home Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Page Load', () => {
    it('displays the hero section', () => {
      cy.get('.hero-wrapper').should('be.visible');
    });

    it('displays the navigation bar', () => {
      cy.get('.ink-nav').should('exist');
    });

    it('displays both preview cards', () => {
      cy.get('.preview-grid').within(() => {
        cy.get('.preview-card').should('have.length', 2);
      });
    });

    it('has proper page title', () => {
      cy.title().should('include', 'GutenKu');
    });
  });

  describe('Preview Cards', () => {
    it('displays GamePreview card', () => {
      cy.get('.preview-card[href="/game"]').should('exist');
    });

    it('displays HaikuPreview card', () => {
      cy.get('.preview-card[href="/haiku"]').should('exist');
    });

    it('navigates to game page when clicking game preview', () => {
      cy.get('.preview-card[href="/game"]').click();
      cy.url().should('include', '/game');
    });

    it('navigates to haiku page when clicking haiku preview', () => {
      cy.visit('/');
      cy.get('.preview-card[href="/haiku"]').click();
      cy.url().should('include', '/haiku');
    });
  });

  describe('Animations', () => {
    it('content becomes visible after load', () => {
      cy.get('.home-content').should('have.class', 'home-content--visible');
    });
  });
});
