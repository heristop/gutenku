/// <reference types="cypress" />

describe('Blog Index Page', () => {
  beforeEach(() => {
    cy.visit('/blog');
  });

  describe('Page Load', () => {
    it('displays navigation', () => {
      cy.get('.ink-nav').should('exist');
    });

    it('displays blog index header', () => {
      cy.get('.blog-index__header').should('exist');
    });

    it('shows page title', () => {
      cy.get('.blog-index__title').should('contain', 'From the Journal');
    });

    it('shows subtitle', () => {
      cy.get('.blog-index__subtitle').should('exist');
    });
  });

  describe('Article List', () => {
    it('displays article cards', () => {
      cy.get('.blog-index__card').should('have.length.at.least', 1);
    });

    it('shows article titles', () => {
      cy.get('.blog-index__article-title').should('have.length.at.least', 1);
    });

    it('shows article descriptions', () => {
      cy.get('.blog-index__description').should('have.length.at.least', 1);
    });

    it('shows article dates', () => {
      cy.get('.blog-index__date').should('have.length.at.least', 1);
    });

    it('shows reading time', () => {
      cy.get('.blog-index__reading-time').should('have.length.at.least', 1);
    });

    it('has read more links', () => {
      cy.get('.blog-index__read-more').should('have.length.at.least', 1);
    });
  });

  describe('Navigation to Article', () => {
    it('navigates to article when clicking read more', () => {
      cy.get('.blog-index__read-more').first().click();
      cy.url().should('include', '/blog/');
      cy.get('.blog-article__header').should('exist');
    });
  });

  describe('Responsive Layout', () => {
    it('works on mobile viewport', () => {
      cy.viewport('iphone-x');
      cy.visit('/blog');
      cy.get('.blog-index__card').should('have.length.at.least', 1);
    });

    it('works on tablet viewport', () => {
      cy.viewport('ipad-2');
      cy.visit('/blog');
      cy.get('.blog-index__card').should('have.length.at.least', 1);
    });
  });
});

describe('Blog Article Page', () => {
  beforeEach(() => {
    // Visit an article page (first navigate to index, then click)
    cy.visit('/blog');
    cy.get('.blog-index__read-more').first().click();
  });

  describe('Page Load', () => {
    it('displays article header', () => {
      cy.get('.blog-article__header').should('exist');
    });

    it('shows article title', () => {
      cy.get('.blog-article__title').should('exist');
    });

    it('shows author name', () => {
      cy.get('.blog-article__author').should('exist');
    });

    it('shows reading time', () => {
      cy.get('.blog-article__reading-time').should('exist');
    });

    it('shows formatted date', () => {
      cy.get('.blog-article__date').should('exist');
    });

    it('has back to blog link', () => {
      cy.get('.blog-article__back-to-blog').should('exist');
    });
  });

  describe('Article Content', () => {
    it('displays article content after loading', () => {
      cy.get('.blog-article__body', { timeout: 10000 }).should('exist');
    });

    it('renders markdown headings', () => {
      cy.get('.blog-article__body h1, .blog-article__body h2', {
        timeout: 10000,
      }).should('have.length.at.least', 1);
    });

    it('renders markdown paragraphs', () => {
      cy.get('.blog-article__body p', { timeout: 10000 }).should(
        'have.length.at.least',
        1,
      );
    });

    it('renders images', () => {
      cy.get('.blog-article__body img', { timeout: 10000 }).should(
        'have.length.at.least',
        1,
      );
    });

    it('renders links', () => {
      cy.get('.blog-article__body a', { timeout: 10000 }).should(
        'have.length.at.least',
        1,
      );
    });
  });

  describe('Reading Progress', () => {
    it('displays progress bar', () => {
      cy.get('.blog-article__progress').should('exist');
    });

    it('updates progress on scroll', () => {
      cy.get('.blog-article__progress')
        .invoke('css', 'width')
        .then((initialWidth) => {
          cy.scrollTo('bottom');
          cy.get('.blog-article__progress')
            .invoke('css', 'width')
            .should('not.eq', initialWidth);
        });
    });
  });

  describe('Back to Top', () => {
    it('shows back to top button after scrolling', () => {
      cy.get('.blog-article__body', { timeout: 10000 }).should('exist');
      cy.get('.blog-article__back-to-top').should('not.exist');
      cy.scrollTo(0, 500);
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(300);
      cy.get('.blog-article__back-to-top', { timeout: 5000 }).should(
        'be.visible',
      );
    });

    it('scrolls to top when clicked', () => {
      cy.get('.blog-article__body', { timeout: 10000 }).should('exist');
      cy.scrollTo(0, 500);
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(300);
      cy.get('.blog-article__back-to-top', { timeout: 5000 }).click();
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(500);
      cy.window().its('scrollY').should('be.lessThan', 100);
    });
  });

  describe('Share Buttons', () => {
    it('displays share buttons', () => {
      cy.get('.blog-article__body', { timeout: 10000 }).should('exist');
      cy.get('.blog-share').should('exist');
    });
  });

  describe('Article Navigation', () => {
    it('displays article navigation', () => {
      cy.get('.blog-article__body', { timeout: 10000 }).should('exist');
      cy.get('.blog-article__nav').should('exist');
    });
  });

  describe('Back to Blog', () => {
    it('navigates back to blog index', () => {
      cy.get('.blog-article__back-to-blog').click();
      cy.url().should('include', '/blog');
      cy.url().should('not.include', '/blog/');
      cy.get('.blog-index__header').should('exist');
    });
  });

  describe('Responsive Layout', () => {
    it('works on mobile viewport', () => {
      cy.viewport('iphone-x');
      cy.get('.blog-article__body', { timeout: 10000 }).should('exist');
      cy.get('.blog-article__header').should('exist');
    });

    it('works on tablet viewport', () => {
      cy.viewport('ipad-2');
      cy.get('.blog-article__body', { timeout: 10000 }).should('exist');
      cy.get('.blog-article__header').should('exist');
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      cy.get('.blog-article__body', { timeout: 10000 }).should('exist');
      cy.get('.blog-article__body').within(() => {
        cy.get('h1, h2, h3').should('have.length.at.least', 1);
      });
    });

    it('images have alt text', () => {
      cy.get('.blog-article__body img', { timeout: 10000 }).each(($img) => {
        cy.wrap($img).should('have.attr', 'alt');
      });
    });

    it('links are accessible', () => {
      cy.get('.blog-article__body a', { timeout: 10000 }).each(($link) => {
        cy.wrap($link).should('have.attr', 'href');
      });
    });

    it('back to top button is keyboard accessible', () => {
      cy.get('.blog-article__body', { timeout: 10000 }).should('exist');
      cy.scrollTo(0, 500);
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(300);
      cy.get('.blog-article__back-to-top', { timeout: 5000 })
        .focus()
        .should('have.focus');
    });
  });
});
