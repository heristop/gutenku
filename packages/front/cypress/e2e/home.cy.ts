/// <reference types="cypress" />

describe('Home Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Page Load', () => {
    it('displays the hero section', () => {
      cy.get('.home__hero').should('be.visible');
      cy.get('.home__title').should('be.visible');
    });

    it('displays the navigation bar', () => {
      cy.get('.ink-nav').should('exist');
    });

    it("displays today's haiku slip", () => {
      cy.get('.daily-slip').should('exist');
    });

    it('has proper page title', () => {
      cy.title().should('include', 'GutenKu');
    });
  });

  describe('Entries', () => {
    it('displays the GutenGuess entry (if enabled)', () => {
      cy.get('body').then(($body) => {
        if ($body.find('.home__entry[href="/game"]').length) {
          cy.get('.home__entry[href="/game"]').should('exist');
        } else {
          cy.log('GutenGuess not available (GAME_ENABLED=false)');
        }
      });
    });

    it('navigates to game page when clicking the entry (if enabled)', () => {
      cy.get('body').then(($body) => {
        if ($body.find('.home__entry[href="/game"]').length) {
          cy.get('.home__entry[href="/game"]').click();
          cy.url().should('include', '/game');
        } else {
          cy.log('GutenGuess not available (GAME_ENABLED=false)');
        }
      });
    });

    it('navigates to haiku page from the write button', () => {
      cy.get('[data-cy=home-write]').click();
      cy.url().should('include', '/haiku');
    });
  });
});

describe('Home daily haiku archive', () => {
  const TODAY = '2026-10-24';
  const days: Record<
    string,
    { previousDate: string | null; nextDate: string | null }
  > = {
    [TODAY]: { previousDate: '2026-10-23', nextDate: null },
    '2026-10-23': { previousDate: '2026-10-22', nextDate: TODAY },
    '2026-10-22': { previousDate: null, nextDate: '2026-10-23' },
  };

  function dailyHaiku(date: string) {
    return {
      __typename: 'DailyHaiku',
      date,
      title: `Leaf of ${date}`,
      verses: [
        'an old silent pond',
        'a frog jumps into the pond',
        'splash, silence again',
      ],
      reading: null,
      book: {
        __typename: 'Book',
        title: 'Walden',
        author: 'Thoreau',
        emoticons: null,
      },
      cardUrl: null,
      nextRolloverAt: '2026-10-25T10:00:00.000Z',
      ...days[date],
    };
  }

  beforeEach(() => {
    cy.clock(Date.UTC(2026, 9, 24, 12), ['Date']);
    // Queries go out as GET (query in the address) or POST (in the body)
    cy.intercept('**/graphql*', (req) => {
      const url = new URL(req.url);
      const body = typeof req.body === 'object' && req.body ? req.body : {};
      const query =
        typeof body.query === 'string'
          ? body.query
          : (url.searchParams.get('query') ?? '');

      if (!query.includes('DailyHaikuSlip')) {
        return;
      }

      const variables =
        body.variables ?? JSON.parse(url.searchParams.get('variables') ?? '{}');
      const date = (variables?.date as string | null) ?? TODAY;

      req.reply({
        data: { dailyHaiku: days[date] ? dailyHaiku(date) : null },
      });
    }).as('graphql');
  });

  it('steps back a day and writes it to the address', () => {
    cy.visit('/');
    cy.get('[data-cy=daily-date]').should('have.attr', 'datetime', TODAY);
    cy.get('[data-cy=daily-today]').should('not.exist');

    cy.get('[data-cy=daily-prev]').click();
    cy.location('search').should('eq', '?day=2026-10-23');
    cy.get('[data-cy=daily-date]').should(
      'have.attr',
      'datetime',
      '2026-10-23',
    );
    cy.get('.daily-slip__title').should('contain', 'Leaf of 2026-10-23');
  });

  it('returns to today and clears the address', () => {
    cy.visit('/?day=2026-10-23');
    cy.get('[data-cy=daily-today]').click();
    cy.location('search').should('eq', '');
    cy.get('[data-cy=daily-date]').should('have.attr', 'datetime', TODAY);
  });

  it('opens the day named in the address on reload', () => {
    cy.visit('/?day=2026-10-22');
    cy.get('.daily-slip__title').should('contain', 'Leaf of 2026-10-22');
    cy.reload();
    cy.get('[data-cy=daily-date]').should(
      'have.attr',
      'datetime',
      '2026-10-22',
    );
    cy.get('[data-cy=daily-prev]').should('be.disabled');
  });

  it('turns back with ArrowLeft while focus is in the slip', () => {
    cy.visit('/');
    cy.get('[data-cy=daily-prev]').focus();
    cy.focused().trigger('keydown', { key: 'ArrowLeft' });
    cy.location('search').should('eq', '?day=2026-10-23');
    cy.focused().should('have.attr', 'data-cy', 'daily-prev');
  });

  it('drops a future day from the address', () => {
    cy.visit('/?day=2099-01-01');
    cy.location('search').should('eq', '');
  });
});
