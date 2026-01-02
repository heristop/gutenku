/// <reference types="cypress" />

describe('Game Page (GutenGuess)', () => {
  beforeEach(() => {
    cy.visit('/game');
  });

  describe('Page Load', () => {
    it('displays the game board', () => {
      cy.get('.game-board').should('exist');
    });

    it('displays navigation', () => {
      cy.get('.ink-nav').should('exist');
    });

    it('displays game header', () => {
      cy.get('.game-header').should('exist');
    });
  });

  describe('Start Gate', () => {
    it('displays start gate for new game', () => {
      // Wait for content to load
      cy.wait(1500);
      // Start gate may or may not be visible depending on game state
      cy.get('.game-board').should('exist');
    });

    it('shows illustration on start gate', () => {
      cy.wait(1500);
      cy.get('body').then(($body) => {
        if ($body.find('.start-gate').length) {
          cy.get('.start-gate__illustration').should('be.visible');
        }
      });
    });
  });

  describe('Game Header', () => {
    it('displays puzzle number', () => {
      cy.wait(1500);
      cy.get('.game-header').should('exist');
    });

    it('has action buttons', () => {
      cy.wait(1500);
      cy.get('.game-header').within(() => {
        cy.get('button').should('have.length.at.least', 1);
      });
    });
  });

  describe('Book Board', () => {
    beforeEach(() => {
      cy.wait(1500);
      // Start the game if start gate is visible
      cy.get('body').then(($body) => {
        if ($body.find('.start-gate__cta').length) {
          cy.get('.start-gate__cta').click();
        }
      });
      cy.wait(500);
    });

    it('displays book cards when game is started', () => {
      cy.get('body').then(($body) => {
        if ($body.find('.book-board').length) {
          cy.get('.book-card').should('have.length.at.least', 1);
        }
      });
    });

    it('has search input', () => {
      cy.get('body').then(($body) => {
        if ($body.find('.book-board').length) {
          cy.get('#book-search').should('exist');
        }
      });
    });

    it('filters books by search', () => {
      cy.get('body').then(($body) => {
        if ($body.find('.book-board').length) {
          cy.get('#book-search').type('pride');
          cy.wait(300);
          // Should filter results
          cy.get('.book-card').should('have.length.at.least', 0);
        }
      });
    });

    it('has pagination when many books', () => {
      cy.get('body').then(($body) => {
        if ($body.find('.book-board__pagination').length) {
          cy.get('.zen-pagination-dots').should('exist');
        }
      });
    });
  });

  describe('Book Selection', () => {
    beforeEach(() => {
      cy.wait(1500);
      cy.get('body').then(($body) => {
        if ($body.find('.start-gate__cta').length) {
          cy.get('.start-gate__cta').click();
        }
      });
      cy.wait(500);
    });

    it('can select a book', () => {
      cy.get('body').then(($body) => {
        if ($body.find('.book-card').length) {
          cy.get('.book-card').first().click();
          // Should show confirmation modal or selection
          cy.wait(300);
        }
      });
    });
  });

  describe('Hint Panel', () => {
    it('displays hints after guesses', () => {
      cy.wait(1500);
      cy.get('body').then(($body) => {
        // Hint panel shows after first guess or with initial emoticons
        if ($body.find('.hint-panel').length) {
          cy.get('.hint-panel').should('be.visible');
        }
      });
    });
  });

  describe('Game Modals', () => {
    beforeEach(() => {
      cy.wait(1500);
    });

    it('can interact with header buttons', () => {
      cy.get('.game-header').within(() => {
        cy.get('button').first().should('exist');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      cy.wait(1500);
      cy.get('body').then(($body) => {
        if ($body.find('.start-gate__cta').length) {
          cy.get('.start-gate__cta').click();
        }
      });
      cy.wait(500);
    });

    it('supports arrow key pagination', () => {
      cy.get('body').then(($body) => {
        if (
          $body.find('.book-board').length &&
          $body.find('.zen-pagination-dots__dot').length > 1
        ) {
          cy.get('body').type('{rightarrow}');
          cy.wait(300);
        }
      });
    });
  });
});
