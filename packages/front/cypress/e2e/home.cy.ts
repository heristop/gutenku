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

    it('displays preview cards', () => {
      cy.get('.preview-grid').within(() => {
        // At least 1 card (haiku), 2 if game is enabled
        cy.get('.preview-card').should('have.length.at.least', 1);
      });
    });

    it('has proper page title', () => {
      cy.title().should('include', 'GutenKu');
    });
  });

  describe('Preview Cards', () => {
    it('displays GamePreview card (if enabled)', () => {
      cy.get('body').then(($body) => {
        if ($body.find('.preview-card[href="/game"]').length) {
          cy.get('.preview-card[href="/game"]').should('exist');
        } else {
          cy.log('GamePreview not available (GAME_ENABLED=false)');
        }
      });
    });

    it('displays HaikuPreview card', () => {
      cy.get('.preview-card[href="/haiku"]').should('exist');
    });

    it('navigates to game page when clicking game preview (if enabled)', () => {
      cy.get('body').then(($body) => {
        if ($body.find('.preview-card[href="/game"]').length) {
          cy.get('.preview-card[href="/game"]').click();
          cy.url().should('include', '/game');
        } else {
          cy.log('GamePreview not available (GAME_ENABLED=false)');
        }
      });
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
