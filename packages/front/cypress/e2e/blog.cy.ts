/// <reference types="cypress" />

describe('Blog Page', () => {
  beforeEach(() => {
    cy.visit('/blog');
  });

  describe('Page Load', () => {
    it('displays navigation', () => {
      cy.get('.ink-nav').should('exist');
    });

    it('displays blog page header', () => {
      cy.get('.blog-page__header').should('exist');
    });

    it('shows page title', () => {
      cy.get('.blog-page__title').should('contain', 'From the Journal');
    });

    it('shows author name', () => {
      cy.get('.blog-page__author').should('exist');
    });

    it('shows reading time', () => {
      cy.get('.blog-page__reading-time').should('exist');
    });

    it('shows formatted date', () => {
      cy.get('.blog-page__date').should('exist');
    });
  });

  describe('Article Content', () => {
    it('displays article content after loading', () => {
      cy.get('.blog-page__article', { timeout: 10000 }).should('exist');
    });

    it('renders markdown headings', () => {
      cy.get('.blog-page__article h1, .blog-page__article h2', {
        timeout: 10000,
      }).should('have.length.at.least', 1);
    });

    it('renders markdown paragraphs', () => {
      cy.get('.blog-page__article p', { timeout: 10000 }).should(
        'have.length.at.least',
        1,
      );
    });

    it('renders images', () => {
      cy.get('.blog-page__article img', { timeout: 10000 }).should(
        'have.length.at.least',
        1,
      );
    });

    it('renders links', () => {
      cy.get('.blog-page__article a', { timeout: 10000 }).should(
        'have.length.at.least',
        1,
      );
    });
  });

  describe('Reading Progress', () => {
    it('displays progress bar', () => {
      cy.get('.blog-page__progress').should('exist');
    });

    it('updates progress on scroll', () => {
      cy.get('.blog-page__progress')
        .invoke('css', 'width')
        .then((initialWidth) => {
          cy.scrollTo('bottom');
          cy.get('.blog-page__progress')
            .invoke('css', 'width')
            .should('not.eq', initialWidth);
        });
    });
  });

  describe('Back to Top', () => {
    it('shows back to top button after scrolling', () => {
      // Wait for content to load first
      cy.get('.blog-page__article', { timeout: 10000 }).should('exist');
      cy.get('.blog-page__back-to-top').should('not.exist');
      // Scroll down past threshold (400px)
      cy.scrollTo(0, 500);
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(300); // Wait for transition
      cy.get('.blog-page__back-to-top', { timeout: 5000 }).should('be.visible');
    });

    it('scrolls to top when clicked', () => {
      cy.get('.blog-page__article', { timeout: 10000 }).should('exist');
      cy.scrollTo(0, 500);
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(300);
      cy.get('.blog-page__back-to-top', { timeout: 5000 }).click();
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(500); // Wait for smooth scroll
      cy.window().its('scrollY').should('be.lessThan', 100);
    });
  });

  describe('Share Buttons', () => {
    it('displays share buttons', () => {
      cy.get('.blog-page__article', { timeout: 10000 }).should('exist');
      cy.get('.blog-share-buttons, [class*="share"]').should('exist');
    });
  });

  describe('Promo Band', () => {
    it('displays GutenGuess promo section', () => {
      cy.get('.blog-page__article .promo-band', { timeout: 10000 }).should(
        'exist',
      );
    });

    it('promo section contains GutenGuess link', () => {
      cy.get('.blog-page__article .promo-band a', { timeout: 10000 }).should(
        'contain',
        'GutenGuess',
      );
    });
  });

  describe('Responsive Layout', () => {
    it('works on mobile viewport', () => {
      cy.viewport('iphone-x');
      cy.visit('/blog');
      cy.get('.blog-page__article', { timeout: 10000 }).should('exist');
      cy.get('.blog-page__header').should('exist');
    });

    it('works on tablet viewport', () => {
      cy.viewport('ipad-2');
      cy.visit('/blog');
      cy.get('.blog-page__article', { timeout: 10000 }).should('exist');
      cy.get('.blog-page__header').should('exist');
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      cy.get('.blog-page__article', { timeout: 10000 }).should('exist');
      // Check for heading elements
      cy.get('.blog-page__article').within(() => {
        cy.get('h1, h2, h3').should('have.length.at.least', 1);
      });
    });

    it('images have alt text', () => {
      cy.get('.blog-page__article img', { timeout: 10000 }).each(($img) => {
        cy.wrap($img).should('have.attr', 'alt');
      });
    });

    it('links are accessible', () => {
      cy.get('.blog-page__article a', { timeout: 10000 }).each(($link) => {
        cy.wrap($link).should('have.attr', 'href');
      });
    });

    it('back to top button is keyboard accessible', () => {
      cy.get('.blog-page__article', { timeout: 10000 }).should('exist');
      cy.scrollTo(0, 500);
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(300);
      cy.get('.blog-page__back-to-top', { timeout: 5000 })
        .focus()
        .should('have.focus');
    });
  });
});
